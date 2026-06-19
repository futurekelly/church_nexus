from django.urls import path, include
from rest_framework.routers import DefaultRouter
from finance.views import (
    FinancialPeriodViewSet,
    AccountViewSet,
    FinancialTransactionViewSet,
    TransactionAttachmentViewSet
)

router = DefaultRouter()
router.register(r'financial-periods', FinancialPeriodViewSet, basename='financialperiod')
router.register(r'accounts', AccountViewSet, basename='account')
router.register(r'financial-transactions', FinancialTransactionViewSet, basename='financialtransaction')
router.register(r'transaction-attachments', TransactionAttachmentViewSet, basename='transactionattachment')

urlpatterns = [
    path('', include(router.urls)),
]
