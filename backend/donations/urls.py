from django.urls import path, include
from rest_framework.routers import DefaultRouter
from donations.views import (
    DonationViewSet, ExpenseViewSet, PledgeViewSet,
    PledgeCampaignViewSet, FinancialAuditLogViewSet
)

router = DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'pledges', PledgeViewSet, basename='pledge')
router.register(r'pledge-campaigns', PledgeCampaignViewSet, basename='pledgecampaign')
router.register(r'financial-audit-logs', FinancialAuditLogViewSet, basename='financialauditlog')

urlpatterns = [
    path('', include(router.urls)),
]
