import uuid
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db.models import Sum

class FinancialPeriod(models.Model):
    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('LOCKED', 'Locked'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='financial_periods', db_index=True)
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN', db_index=True)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_periods')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_periods')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['branch', 'start_date', 'end_date'], name='unique_period_per_branch_dates')
        ]

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date cannot be after end date.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.status}) - {self.branch.branch_name}"


class Account(models.Model):
    TYPE_CHOICES = (
        ('ASSET', 'Asset'),
        ('LIABILITY', 'Liability'),
        ('EQUITY', 'Equity'),
        ('REVENUE', 'Revenue'),
        ('EXPENSE', 'Expense'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='accounts', db_index=True)
    code = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    cached_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_accounts')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_accounts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['branch', 'code'], name='unique_account_code_per_branch')
        ]

    def reconstruct_balance(self):
        # Calculate balance based strictly on POSTED and VOIDED transactions' LedgerEntry records
        posted_entries = self.ledger_entries.filter(transaction__status__in=['POSTED', 'VOIDED'])
        aggregate = posted_entries.aggregate(total=Sum('amount'))
        return aggregate['total'] or 0.00

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.branch.branch_code})"


class FinancialTransaction(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('POSTED', 'Posted'),
        ('VOIDED', 'Voided'),
    )

    ALLOWED_TRANSITIONS = {
        'DRAFT': {'POSTED'},
        'POSTED': {'VOIDED'},
        'VOIDED': set(),
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='financial_transactions', db_index=True)
    period = models.ForeignKey(FinancialPeriod, on_delete=models.PROTECT, related_name='transactions', db_index=True)
    
    reference_number = models.CharField(max_length=50, unique=True, db_index=True)
    transaction_type = models.CharField(max_length=20, db_index=True) # CSH, EXP, JRN
    date = models.DateTimeField(db_index=True)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT', db_index=True)

    # Multi-currency handling fields
    transaction_currency = models.CharField(max_length=10, default='USD')
    exchange_rate_applied = models.DecimalField(max_digits=10, decimal_places=6, default=1.000000)
    base_currency_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)

    # Reversal tracing link
    reversed_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reversal_for')

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_financial_transactions')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_financial_transactions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        
        # Validate financial period states
        if self.period.status in ['CLOSED', 'LOCKED']:
            raise ValidationError(f"Cannot record transaction in a {self.period.status} financial period.")

        # Lifecycle transition validation
        if self.pk:
            try:
                original = FinancialTransaction.objects.get(pk=self.pk)
                if original.status != self.status:
                    allowed = self.ALLOWED_TRANSITIONS.get(original.status, set())
                    if self.status not in allowed:
                        raise ValidationError(f"Transition from {original.status} to {self.status} is not allowed.")
            except FinancialTransaction.DoesNotExist:
                pass

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference_number} ({self.status}) - {self.branch.branch_code}"


class LedgerEntry(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='ledger_entries', db_index=True)
    transaction = models.ForeignKey(FinancialTransaction, on_delete=models.CASCADE, related_name='entries', db_index=True)
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='ledger_entries', db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2) # Positive for Debits, Negative for Credits
    entry_sequence = models.IntegerField(default=1)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_ledger_entries')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_ledger_entries')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.transaction.reference_number} - {self.account.code} : {self.amount}"


class TransactionAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(FinancialTransaction, on_delete=models.CASCADE, related_name='attachments', db_index=True)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    file_size = models.IntegerField()
    storage_provider = models.CharField(max_length=50, default='local')
    storage_key = models.CharField(max_length=500)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment {self.file_name} for {self.transaction.reference_number}"


class ReferenceSequence(models.Model):
    prefix = models.CharField(max_length=10, db_index=True) # CSH, EXP, JRN
    year = models.IntegerField(db_index=True)
    last_value = models.IntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['prefix', 'year'], name='unique_prefix_year_sequence')
        ]

    def __str__(self):
        return f"{self.prefix}-{self.year} ({self.last_value})"
