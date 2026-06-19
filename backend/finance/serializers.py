from rest_framework import serializers
from django.core.exceptions import ValidationError
from django.db import transaction
from decimal import Decimal
from django.utils import timezone
from finance.models import (
    FinancialPeriod,
    Account,
    FinancialTransaction,
    LedgerEntry,
    TransactionAttachment,
    ReferenceSequence
)

class FinancialPeriodSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialPeriod
        fields = '__all__'
        read_only_fields = ('id', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def validate_branch(self, value):
        user = self.context['request'].user
        if self.instance and self.instance.branch != value:
            raise serializers.ValidationError("Branch assignment cannot be changed after creation.")
        if not self.instance and user and not user.is_anonymous and user.role != 'super_admin':
            if value != user.branch:
                raise serializers.ValidationError("Branch assignment must match your assigned branch.")
        return value

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and start_date > end_date:
            raise serializers.ValidationError("Start date cannot be after end date.")
        return attrs


class AccountSerializer(serializers.ModelSerializer):
    reconstructed_balance = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'branch', 'code', 'name', 'type', 'cached_balance', 'reconstructed_balance', 'created_at', 'updated_at']
        read_only_fields = ('id', 'cached_balance', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def validate_branch(self, value):
        user = self.context['request'].user
        if self.instance and self.instance.branch != value:
            raise serializers.ValidationError("Branch assignment cannot be changed after creation.")
        if not self.instance and user and not user.is_anonymous and user.role != 'super_admin':
            if value != user.branch:
                raise serializers.ValidationError("Branch assignment must match your assigned branch.")
        return value

    def get_reconstructed_balance(self, obj):
        return obj.reconstruct_balance()


class LedgerEntrySerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = LedgerEntry
        fields = ['id', 'account', 'account_code', 'account_name', 'amount', 'entry_sequence']
        read_only_fields = ['id']


class TransactionAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionAttachment
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at']


class FinancialTransactionSerializer(serializers.ModelSerializer):
    period = serializers.PrimaryKeyRelatedField(queryset=FinancialPeriod.objects.all(), required=False)
    entries = LedgerEntrySerializer(many=True)
    attachments = TransactionAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = FinancialTransaction
        fields = [
            'id', 'branch', 'period', 'reference_number', 'transaction_type', 
            'date', 'description', 'status', 'transaction_currency', 
            'exchange_rate_applied', 'base_currency_amount', 'reversed_by', 
            'entries', 'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'reference_number', 'base_currency_amount', 'reversed_by', 'created_by', 'updated_by', 'created_at', 'updated_at')

    def validate_branch(self, value):
        user = self.context['request'].user
        if self.instance and self.instance.branch != value:
            raise serializers.ValidationError("Branch assignment cannot be changed after creation.")
        if not self.instance and user and not user.is_anonymous and user.role != 'super_admin':
            if value != user.branch:
                raise serializers.ValidationError("Branch assignment must match your assigned branch.")
        return value

    def validate(self, attrs):
        # 1. Enforce active open period checks
        date = attrs.get('date') or (self.instance.date if self.instance else timezone.now())
        branch = attrs.get('branch') or (self.instance.branch if self.instance else None)
        
        if branch:
            period = FinancialPeriod.objects.filter(
                branch=branch,
                start_date__lte=date.date(),
                end_date__gte=date.date()
            ).first()
            if not period:
                raise serializers.ValidationError("No financial period found covering the transaction date.")
            if period.status in ['CLOSED', 'LOCKED']:
                raise serializers.ValidationError(f"Cannot post transaction in a {period.status} period.")
            attrs['period'] = period

        # 2. Lifecycle transitions
        status = attrs.get('status', 'DRAFT')
        if self.instance:
            allowed = FinancialTransaction.ALLOWED_TRANSITIONS.get(self.instance.status, set())
            if status != self.instance.status and status not in allowed:
                raise serializers.ValidationError(f"Transition from {self.instance.status} to {status} is blocked.")

        # 3. Double-entry validation on POSTED
        entries_data = attrs.get('entries', [])
        
        # In case of partial updates where entries aren't sent, retrieve existing entries
        if self.instance and not entries_data:
            entries_data = list(self.instance.entries.all())

        if status == 'POSTED':
            if not entries_data:
                raise serializers.ValidationError("A posted transaction must contain ledger entries.")
            
            # Sum debits and credits
            total_sum = Decimal('0.00')
            for entry in entries_data:
                # Handle both dict (creation) and model instance (existing)
                amount = entry.amount if isinstance(entry, LedgerEntry) else Decimal(str(entry.get('amount', '0.00')))
                total_sum += amount
            
            if total_sum != Decimal('0.00'):
                raise serializers.ValidationError("Double-entry error: Sum of debits and credits must equal zero.")

        return attrs

    def create(self, validated_data):
        entries_data = validated_data.pop('entries')
        branch = validated_data['branch']
        date = validated_data['date']
        tx_type = validated_data['transaction_type']
        
        # Multi-currency amount calculation
        rate = validated_data.get('exchange_rate_applied', Decimal('1.000000'))
        
        # Calculate total base currency amount from the positive side (debits) of ledger entries
        total_debits = sum(Decimal(str(e.get('amount'))) for e in entries_data if Decimal(str(e.get('amount'))) > 0)
        validated_data['base_currency_amount'] = (total_debits * rate).quantize(Decimal('0.01'))

        # Wrap in transaction atomic and use pessimistic locking for sequence generation
        with transaction.atomic():
            # Generate unique sequence-backed reference number
            year = date.year
            seq, created = ReferenceSequence.objects.select_for_update().get_or_create(
                prefix=tx_type,
                year=year,
                defaults={'last_value': 0}
            )
            seq.last_value += 1
            seq.save()
            
            validated_data['reference_number'] = f"{tx_type}-{year}-{seq.last_value:06d}"
            
            # Create transaction
            tx = FinancialTransaction.objects.create(**validated_data)
            
            # Create ledger entries
            ledger_entries = []
            for entry_data in entries_data:
                ledger_entries.append(
                    LedgerEntry.objects.create(
                        branch=branch,
                        transaction=tx,
                        **entry_data
                    )
                )
            
            # Update account cached balances if POSTED
            if tx.status == 'POSTED':
                for entry in ledger_entries:
                    acc = entry.account
                    # Pessimistic row-lock to prevent race conditions on account updates
                    locked_acc = Account.objects.select_for_update().get(id=acc.id)
                    locked_acc.cached_balance = locked_acc.reconstruct_balance()
                    locked_acc.save()
                    
            return tx

    def update(self, instance, validated_data):
        entries_data = validated_data.pop('entries', None)
        status = validated_data.get('status', instance.status)
        
        with transaction.atomic():
            # Update base transaction details
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            if entries_data is not None:
                # Clear old entries and create new ones
                instance.entries.all().delete()
                
                # Create new ledger entries
                ledger_entries = []
                for entry_data in entries_data:
                    ledger_entries.append(
                        LedgerEntry.objects.create(
                            branch=instance.branch,
                            transaction=instance,
                            **entry_data
                        )
                    )
                
                # Re-calculate total debits
                rate = validated_data.get('exchange_rate_applied', instance.exchange_rate_applied)
                total_debits = sum(Decimal(str(e.get('amount'))) for e in entries_data if Decimal(str(e.get('amount'))) > 0)
                instance.base_currency_amount = (total_debits * rate).quantize(Decimal('0.01'))
            
            instance.save()

            # Update balances of all accounts involved in the transaction
            # Lock the accounts to be updated
            entries_to_process = instance.entries.all()
            for entry in entries_to_process:
                acc = entry.account
                locked_acc = Account.objects.select_for_update().get(id=acc.id)
                locked_acc.cached_balance = locked_acc.reconstruct_balance()
                locked_acc.save()

            return instance
