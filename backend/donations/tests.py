import pytest
from decimal import Decimal
from django.utils import timezone
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from branches.models import Branch
from authentication.models import User
from members.models import Member
from donations.models import Donation, Expense, Pledge
from finance.models import FinancialPeriod, Account, FinancialTransaction, LedgerEntry

@pytest.fixture
def setup_data(db):
    branch = Branch.objects.create(id="br-test", branch_name="Branch Test", branch_code="BRTEST")
    
    # Retrieve default accounts automatically seeded by branch signals
    cash_account = Account.objects.get(branch=branch, code="1110")
    petty_cash = Account.objects.get(branch=branch, code="1120")
    tithe_account = Account.objects.get(branch=branch, code="4100")
    campaign_account = Account.objects.get(branch=branch, code="4200")
    expense_account = Account.objects.get(branch=branch, code="5100")
    
    # Create open financial period
    period = FinancialPeriod.objects.create(
        branch=branch,
        name="Q2 2026 Test Period",
        start_date=timezone.now().date() - timedelta(days=30),
        end_date=timezone.now().date() + timedelta(days=30),
        status='OPEN'
    )
    
    # Create user with a valid role Choice ('treasurer')
    user = User.objects.create_user(
        email="treasurer@test.com", password="password123", role="treasurer", branch=branch
    )
    
    # Create member
    member = Member.objects.create(
        branch=branch,
        first_name="John",
        last_name="Doe",
        email="john.doe@test.com",
        phone_number="123456789",
        status="Active",
        join_date=timezone.now().date()
    )
    
    return {
        'branch': branch,
        'user': user,
        'member': member,
        'period': period,
        'accounts': {
            'cash': cash_account,
            'petty': petty_cash,
            'tithe': tithe_account,
            'campaign': campaign_account,
            'expense': expense_account,
        }
    }

@pytest.mark.django_db
def test_donation_posting_to_ledger(setup_data):
    # Create completed donation
    donation = Donation.objects.create(
        branch=setup_data['branch'],
        member=setup_data['member'],
        amount=Decimal('150.00'),
        currency='USD',
        payment_method='Bank Transfer',
        date=timezone.now(),
        status='COMPLETED',
        created_by=setup_data['user']
    )
    
    # Verify transaction link
    donation.refresh_from_db()
    assert donation.financial_transaction is not None
    
    tx = donation.financial_transaction
    assert tx.status == 'POSTED'
    assert tx.transaction_currency == 'USD'
    assert tx.base_currency_amount == Decimal('150.00')
    
    # Verify entries balance exactly
    entries = tx.entries.all()
    assert entries.count() == 2
    
    debit_entry = entries.get(amount__gt=0)
    credit_entry = entries.get(amount__lt=0)
    
    assert debit_entry.account == setup_data['accounts']['cash']
    assert debit_entry.amount == Decimal('150.00')
    assert credit_entry.account == setup_data['accounts']['tithe']
    assert credit_entry.amount == Decimal('-150.00')
    
    # Verify cached balances updated
    setup_data['accounts']['cash'].refresh_from_db()
    setup_data['accounts']['tithe'].refresh_from_db()
    assert setup_data['accounts']['cash'].cached_balance == Decimal('150.00')
    assert setup_data['accounts']['tithe'].cached_balance == Decimal('-150.00')


@pytest.mark.django_db
def test_pending_donation_does_not_post(setup_data):
    donation = Donation.objects.create(
        branch=setup_data['branch'],
        member=setup_data['member'],
        amount=Decimal('200.00'),
        currency='USD',
        payment_method='Cash',
        date=timezone.now(),
        status='PENDING',
        created_by=setup_data['user']
    )
    
    donation.refresh_from_db()
    assert donation.financial_transaction is None


@pytest.mark.django_db
def test_donation_voiding(setup_data):
    donation = Donation.objects.create(
        branch=setup_data['branch'],
        member=setup_data['member'],
        amount=Decimal('100.00'),
        currency='USD',
        payment_method='Cash',
        date=timezone.now(),
        status='COMPLETED',
        created_by=setup_data['user']
    )
    
    donation.refresh_from_db()
    orig_tx = donation.financial_transaction
    assert orig_tx.status == 'POSTED'
    
    # Void the donation
    donation.status = 'VOIDED'
    donation.save()
    
    orig_tx.refresh_from_db()
    assert orig_tx.status == 'VOIDED'
    assert orig_tx.reversed_by is not None
    
    reversing_tx = orig_tx.reversed_by
    assert reversing_tx.status == 'POSTED'
    assert reversing_tx.transaction_type == 'JRN'
    
    # Reversing entries must offset original
    rev_entries = reversing_tx.entries.all()
    assert rev_entries.count() == 2
    
    cash_rev = rev_entries.get(account=setup_data['accounts']['petty'])
    tithe_rev = rev_entries.get(account=setup_data['accounts']['tithe'])
    
    assert cash_rev.amount == Decimal('-100.00')
    assert tithe_rev.amount == Decimal('100.00')
    
    # Verify account cached balances returned to zero
    setup_data['accounts']['petty'].refresh_from_db()
    setup_data['accounts']['tithe'].refresh_from_db()
    assert setup_data['accounts']['petty'].cached_balance == Decimal('0.00')
    assert setup_data['accounts']['tithe'].cached_balance == Decimal('0.00')


@pytest.mark.django_db
def test_expense_posting_and_voiding(setup_data):
    expense = Expense.objects.create(
        branch=setup_data['branch'],
        payee="Utility Company",
        amount=Decimal('80.00'),
        currency='USD',
        date=timezone.now(),
        category='Utilities',
        payment_method='Bank Transfer',
        status='APPROVED',
        created_by=setup_data['user']
    )
    
    expense.refresh_from_db()
    assert expense.financial_transaction is not None
    
    tx = expense.financial_transaction
    assert tx.status == 'POSTED'
    
    entries = tx.entries.all()
    assert entries.count() == 2
    
    debit_entry = entries.get(amount__gt=0)
    credit_entry = entries.get(amount__lt=0)
    
    assert debit_entry.account == setup_data['accounts']['expense']
    assert debit_entry.amount == Decimal('80.00')
    assert credit_entry.account == setup_data['accounts']['cash']
    assert credit_entry.amount == Decimal('-80.00')
    
    # Void the expense
    expense.status = 'VOIDED'
    expense.save()
    
    tx.refresh_from_db()
    assert tx.status == 'VOIDED'
    assert tx.reversed_by is not None
