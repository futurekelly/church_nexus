from rest_framework import viewsets, status, decorators
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from decimal import Decimal
from django.core.exceptions import ValidationError

from finance.models import (
    FinancialPeriod,
    Account,
    FinancialTransaction,
    LedgerEntry,
    TransactionAttachment
)
from finance.serializers import (
    FinancialPeriodSerializer,
    AccountSerializer,
    FinancialTransactionSerializer,
    TransactionAttachmentSerializer
)



class FinancialPeriodViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialPeriodSerializer
    queryset = FinancialPeriod.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    queryset = Account.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class FinancialTransactionViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialTransactionSerializer
    queryset = FinancialTransaction.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @decorators.action(detail=True, methods=['post'], url_path='void')
    def void_transaction(self, request, pk=None):
        """
        Custom action to void a posted transaction and insert reversing ledger entries.
        """
        user = self.request.user
        
        with transaction.atomic():
            # 1. Lock the transaction row to prevent concurrent modification
            tx = get_object_or_404(FinancialTransaction.objects.select_for_update(), pk=pk)
            
            # Branch validation
            if user.role != 'super_admin' and tx.branch != user.branch:
                return Response(
                    {"success": False, "message": "Permission denied."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check status
            if tx.status != 'POSTED':
                return Response(
                    {"success": False, "message": f"Only POSTED transactions can be voided. Current status: {tx.status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check period status
            if tx.period.status in ['CLOSED', 'LOCKED']:
                return Response(
                    {"success": False, "message": f"Cannot void transaction inside a {tx.period.status} period."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # 2. Update status of the original transaction
            tx.status = 'VOIDED'
            
            # 3. Create reversing transaction
            reversing_tx_data = {
                'branch': tx.branch,
                'period': tx.period,
                'transaction_type': 'JRN', # Journal type
                'date': timezone.now(),
                'description': f"Reversal of transaction {tx.reference_number}. Reason: {request.data.get('reason', 'N/A')}",
                'status': 'POSTED',
                'transaction_currency': tx.transaction_currency,
                'exchange_rate_applied': tx.exchange_rate_applied,
                'base_currency_amount': tx.base_currency_amount,
                'created_by': user
            }
            
            # Get the next sequence for JRN
            from finance.models import ReferenceSequence
            year = reversing_tx_data['date'].year
            seq, created = ReferenceSequence.objects.select_for_update().get_or_create(
                prefix='JRN',
                year=year,
                defaults={'last_value': 0}
            )
            seq.last_value += 1
            seq.save()
            reversing_tx_data['reference_number'] = f"JRN-{year}-{seq.last_value:06d}"
            
            reversing_tx = FinancialTransaction.objects.create(**reversing_tx_data)
            
            # 4. Create opposite ledger entries
            original_entries = tx.entries.all()
            reversing_entries = []
            
            # Lock accounts to prevent race conditions during updates
            account_ids = sorted([entry.account.id for entry in original_entries])
            locked_accounts = {
                acc.id: acc for acc in Account.objects.select_for_update().filter(id__in=account_ids)
            }
            
            for entry in original_entries:
                # Opposite amount: negative becomes positive, positive becomes negative
                reversal_amount = -entry.amount
                rev_entry = LedgerEntry.objects.create(
                    branch=tx.branch,
                    transaction=reversing_tx,
                    account=locked_accounts[entry.account.id],
                    amount=reversal_amount,
                    entry_sequence=entry.entry_sequence,
                    created_by=user
                )
                reversing_entries.append(rev_entry)

            # Update original link
            tx.reversed_by = reversing_tx
            tx.save()

            # 5. Recompute and update cached balances of all involved accounts
            for entry in original_entries:
                acc = locked_accounts[entry.account.id]
                acc.cached_balance = acc.reconstruct_balance()
                acc.save()
            
            serializer = FinancialTransactionSerializer(tx)
            return Response({
                "success": True,
                "data": serializer.data
            }, status=status.HTTP_200_OK)


class TransactionAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionAttachmentSerializer
    queryset = TransactionAttachment.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(transaction__branch=user.branch)
