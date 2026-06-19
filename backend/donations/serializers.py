from rest_framework import serializers
from donations.models import Donation, Expense, Pledge, PledgeCampaign, FinancialAuditLog

def validate_branch_helper(serializer, value):
    user = serializer.context['request'].user
    if serializer.instance and serializer.instance.branch != value:
        raise serializers.ValidationError("Branch assignment cannot be changed after creation.")
    if not serializer.instance and user and not user.is_anonymous and user.role != 'super_admin':
        if value != user.branch:
            raise serializers.ValidationError("Branch assignment must match your assigned branch.")
    return value

class DonationSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField(read_only=True)
    financial_tx_ref = serializers.CharField(source='financial_transaction.reference_number', read_only=True)

    class Meta:
        model = Donation
        fields = [
            'id', 'branch', 'member', 'member_name', 'campaign_id', 
            'amount', 'currency', 'payment_method', 'date', 'notes', 
            'status', 'financial_transaction', 'financial_tx_ref',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'financial_transaction', 'created_at', 'updated_at')

    def validate_branch(self, value):
        return validate_branch_helper(self, value)

    def get_member_name(self, obj):
        if obj.member:
            return f"{obj.member.first_name} {obj.member.last_name}"
        return "Guest visitor"


class ExpenseSerializer(serializers.ModelSerializer):
    financial_tx_ref = serializers.CharField(source='financial_transaction.reference_number', read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'branch', 'payee', 'amount', 'currency', 'date', 
            'category', 'payment_method', 'notes', 'status', 
            'financial_transaction', 'financial_tx_ref',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'financial_transaction', 'created_at', 'updated_at')

    def validate_branch(self, value):
        return validate_branch_helper(self, value)


class PledgeSerializer(serializers.ModelSerializer):
    member_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Pledge
        fields = [
            'id', 'branch', 'member', 'member_name', 'campaign_id', 
            'target_amount', 'currency', 'current_paid', 'status', 
            'due_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_branch(self, value):
        return validate_branch_helper(self, value)

    def get_member_name(self, obj):
        return f"{obj.member.first_name} {obj.member.last_name}" if obj.member else ""


class PledgeCampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = PledgeCampaign
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_branch(self, value):
        return validate_branch_helper(self, value)


class FinancialAuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialAuditLog
        fields = '__all__'
        read_only_fields = ('id', 'timestamp')

    def validate_branch(self, value):
        return validate_branch_helper(self, value)
