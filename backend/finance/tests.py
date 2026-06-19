import pytest
from django.urls import reverse
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.test import APIClient
from decimal import Decimal

from branches.models import Branch
from authentication.factories import BranchFactory, UserFactory
from finance.models import FinancialPeriod, Account, FinancialTransaction, LedgerEntry

@pytest.mark.django_db
class TestFinanceAPI:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.branch = BranchFactory(id="br-1", branch_name="Branch 1", branch_code="BR1")
        self.user = UserFactory(email="treasurer@test.com", role="pastor", branch=self.branch)
        self.client.force_authenticate(user=self.user)

        # Create an open financial period
        self.open_period = FinancialPeriod.objects.create(
            branch=self.branch,
            name="Q2 2026",
            start_date="2026-04-01",
            end_date="2026-06-30",
            status="OPEN"
        )

        # Retrieve seeded accounts for branch
        self.cash_account = Account.objects.get(branch=self.branch, code="1110")
        self.revenue_account = Account.objects.get(branch=self.branch, code="4100")
        self.expense_account = Account.objects.get(branch=self.branch, code="5100")

    def test_double_entry_enforcement(self):
        # 1. Attempt to create a POSTED transaction with unbalanced entries (sum != 0) -> Fail
        url = reverse('financialtransaction-list')
        payload = {
            'branch': self.branch.id,
            'transaction_type': 'CSH',
            'date': '2026-05-15T10:00:00Z',
            'description': 'Unbalanced Transaction',
            'status': 'POSTED',
            'entries': [
                {'account': str(self.cash_account.id), 'amount': '100.00', 'entry_sequence': 1},
                {'account': str(self.revenue_account.id), 'amount': '-90.00', 'entry_sequence': 2} # Discrepancy of 10.00
            ]
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Double-entry error" in str(response.json()['errors'])

        # 2. Balanced transaction -> Succeed
        payload['entries'][1]['amount'] = '-100.00'
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json()['data']['status'] == 'POSTED'

    def test_financial_period_locking(self):
        # Create a closed period
        closed_period = FinancialPeriod.objects.create(
            branch=self.branch,
            name="Q1 2026",
            start_date="2026-01-01",
            end_date="2026-03-31",
            status="CLOSED"
        )

        # Attempt to post transaction inside the closed period's date range -> Fail
        url = reverse('financialtransaction-list')
        payload = {
            'branch': self.branch.id,
            'transaction_type': 'EXP',
            'date': '2026-02-15T12:00:00Z',
            'description': 'Out of period posting',
            'status': 'POSTED',
            'entries': [
                {'account': str(self.expense_account.id), 'amount': '50.00', 'entry_sequence': 1},
                {'account': str(self.cash_account.id), 'amount': '-50.00', 'entry_sequence': 2}
            ]
        }
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "CLOSED" in str(response.json()['errors'])

    def test_reference_sequence_generation(self):
        url = reverse('financialtransaction-list')
        payload = {
            'branch': self.branch.id,
            'transaction_type': 'CSH',
            'date': '2026-05-15T10:00:00Z',
            'description': 'Transaction 1',
            'status': 'POSTED',
            'entries': [
                {'account': str(self.cash_account.id), 'amount': '150.00', 'entry_sequence': 1},
                {'account': str(self.revenue_account.id), 'amount': '-150.00', 'entry_sequence': 2}
            ]
        }
        
        # Post first transaction
        resp1 = self.client.post(url, payload, format='json')
        assert resp1.status_code == status.HTTP_201_CREATED
        ref1 = resp1.json()['data']['reference_number']
        assert ref1 == 'CSH-2026-000001'

        # Post second transaction of same type -> increments sequence
        payload['description'] = 'Transaction 2'
        resp2 = self.client.post(url, payload, format='json')
        assert resp2.status_code == status.HTTP_201_CREATED
        ref2 = resp2.json()['data']['reference_number']
        assert ref2 == 'CSH-2026-000002'

        # Post third transaction of different type -> separate stream
        payload['transaction_type'] = 'EXP'
        payload['description'] = 'Expense 1'
        payload['entries'] = [
            {'account': str(self.expense_account.id), 'amount': '80.00', 'entry_sequence': 1},
            {'account': str(self.cash_account.id), 'amount': '-80.00', 'entry_sequence': 2}
        ]
        resp3 = self.client.post(url, payload, format='json')
        assert resp3.status_code == status.HTTP_201_CREATED
        ref3 = resp3.json()['data']['reference_number']
        assert ref3 == 'EXP-2026-000001'

    def test_cached_balance_reconstruction_and_voiding(self):
        url = reverse('financialtransaction-list')
        payload = {
            'branch': self.branch.id,
            'transaction_type': 'CSH',
            'date': '2026-05-15T10:00:00Z',
            'description': 'Giving Collection',
            'status': 'POSTED',
            'entries': [
                {'account': str(self.cash_account.id), 'amount': '300.00', 'entry_sequence': 1},
                {'account': str(self.revenue_account.id), 'amount': '-300.00', 'entry_sequence': 2}
            ]
        }
        
        # Post donation transaction
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        tx_id = response.json()['data']['id']

        # Refresh accounts and check cached balance
        self.cash_account.refresh_from_db()
        self.revenue_account.refresh_from_db()
        
        assert self.cash_account.cached_balance == Decimal('300.00')
        assert self.revenue_account.cached_balance == Decimal('-300.00')
        
        # Check source of truth (reconstructed balance)
        assert self.cash_account.reconstruct_balance() == Decimal('300.00')

        # Void the transaction
        void_url = reverse('financialtransaction-void-transaction', args=[tx_id])
        void_response = self.client.post(void_url, {'reason': 'Incorrect entry'}, format='json')
        assert void_response.status_code == status.HTTP_200_OK

        # Refresh accounts and check balance is zeroed out
        self.cash_account.refresh_from_db()
        self.revenue_account.refresh_from_db()
        
        assert self.cash_account.cached_balance == Decimal('0.00')
        assert self.revenue_account.cached_balance == Decimal('0.00')
        
        # Check database reconstruction balance
        assert self.cash_account.reconstruct_balance() == Decimal('0.00')
