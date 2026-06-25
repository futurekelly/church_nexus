from rest_framework import viewsets, permissions  # noqa: F401
from donations.models import Donation, Expense, Pledge, PledgeCampaign, FinancialAuditLog
from donations.serializers import (
    DonationSerializer, ExpenseSerializer, PledgeSerializer,
    PledgeCampaignSerializer, FinancialAuditLogSerializer
)

class DonationViewSet(viewsets.ModelViewSet):
    serializer_class = DonationSerializer
    queryset = Donation.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().filter(is_archived=False)
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch if user.role != 'super_admin' else serializer.validated_data.get('branch')
        serializer.save(created_by=user, branch=branch)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    queryset = Expense.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().filter(is_archived=False)
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch if user.role != 'super_admin' else serializer.validated_data.get('branch')
        serializer.save(created_by=user, branch=branch)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class PledgeViewSet(viewsets.ModelViewSet):
    serializer_class = PledgeSerializer
    queryset = Pledge.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().filter(is_archived=False)
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch if user.role != 'super_admin' else serializer.validated_data.get('branch')
        serializer.save(created_by=user, branch=branch)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class PledgeCampaignViewSet(viewsets.ModelViewSet):
    serializer_class = PledgeCampaignSerializer
    queryset = PledgeCampaign.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch if user.role != 'super_admin' else serializer.validated_data.get('branch')
        serializer.save(branch=branch)


class FinancialAuditLogViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialAuditLogSerializer
    queryset = FinancialAuditLog.objects.all()

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch if user.role != 'super_admin' else serializer.validated_data.get('branch')
        serializer.save(branch=branch)
