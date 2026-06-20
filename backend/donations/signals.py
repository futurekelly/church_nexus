from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from donations.models import Donation, Expense
from finance.models import FinancialPeriod, Account, FinancialTransaction, LedgerEntry, ReferenceSequence

@receiver(post_save, sender=Donation)
def handle_donation_ledger_posting(sender, instance, created, **kwargs):
    if instance.is_archived:
        return

    # 1. Post to ledger when COMPLETED and not already linked
    if instance.status == 'COMPLETED' and not instance.financial_transaction:
        # Find active open financial period covering the date
        period = FinancialPeriod.objects.filter(
            branch=instance.branch,
            start_date__lte=instance.date.date(),
            end_date__gte=instance.date.date()
        ).first()
        
        if not period:
            from datetime import date
            import calendar
            event_date = instance.date.date() if hasattr(instance.date, 'date') else instance.date
            year = event_date.year
            month = event_date.month
            _, last_day = calendar.monthrange(year, month)
            start_dt = date(year, month, 1)
            end_dt = date(year, month, last_day)
            
            period = FinancialPeriod.objects.create(
                branch=instance.branch,
                name=f"Auto-Opened Period {start_dt.strftime('%B %Y')}",
                start_date=start_dt,
                end_date=end_dt,
                status='OPEN'
            )
        if period.status in ['CLOSED', 'LOCKED']:
            raise ValidationError(f"Cannot post donation in a {period.status} financial period.")

        # Determine accounts
        cash_code = '1120' if instance.payment_method.lower() == 'cash' else '1110'
        debit_account = Account.objects.filter(branch=instance.branch, code=cash_code).first()
        if not debit_account:
            debit_account = Account.objects.filter(branch=instance.branch, type='ASSET').first()

        rev_code = '4200' if instance.campaign_id else '4100'
        credit_account = Account.objects.filter(branch=instance.branch, code=rev_code).first()
        if not credit_account:
            credit_account = Account.objects.filter(branch=instance.branch, type='REVENUE').first()

        if not debit_account or not credit_account:
            raise ValidationError("Required Asset or Revenue accounts are missing for this branch.")

        with transaction.atomic():
            # Get sequential reference number
            year = instance.date.year
            seq, _ = ReferenceSequence.objects.select_for_update().get_or_create(
                prefix='CSH',
                year=year,
                defaults={'last_value': 0}
            )
            seq.last_value += 1
            seq.save()
            ref = f"CSH-{year}-{seq.last_value:06d}"

            # Create transaction
            tx = FinancialTransaction.objects.create(
                branch=instance.branch,
                period=period,
                reference_number=ref,
                transaction_type='CSH',
                date=instance.date,
                description=f"Donation from {f'{instance.member.first_name} {instance.member.last_name}' if instance.member else 'Guest'} via {instance.payment_method}",
                status='POSTED',
                transaction_currency=instance.currency,
                exchange_rate_applied=Decimal('1.000000'),
                base_currency_amount=instance.amount,
                created_by=instance.created_by
            )

            # Debit Entry (Asset)
            LedgerEntry.objects.create(
                branch=instance.branch,
                transaction=tx,
                account=debit_account,
                amount=instance.amount,
                entry_sequence=1,
                created_by=instance.created_by
            )

            # Credit Entry (Revenue)
            LedgerEntry.objects.create(
                branch=instance.branch,
                transaction=tx,
                account=credit_account,
                amount=-instance.amount,
                entry_sequence=2,
                created_by=instance.created_by
            )

            # Reconstruct balances
            for acc in [debit_account, credit_account]:
                acc.cached_balance = acc.reconstruct_balance()
                acc.save()

            # Update link on donation
            Donation.objects.filter(pk=instance.pk).update(financial_transaction=tx)

    # 2. Void ledger transaction when Donation is VOIDED
    elif instance.status == 'VOIDED' and instance.financial_transaction and instance.financial_transaction.status == 'POSTED':
        tx = instance.financial_transaction
        if tx.period.status in ['CLOSED', 'LOCKED']:
            raise ValidationError("Cannot void transaction inside a closed/locked period.")

        with transaction.atomic():
            tx.status = 'VOIDED'
            
            # Create reversing transaction
            year = timezone.now().year
            seq, _ = ReferenceSequence.objects.select_for_update().get_or_create(
                prefix='JRN',
                year=year,
                defaults={'last_value': 0}
            )
            seq.last_value += 1
            seq.save()
            ref_rev = f"JRN-{year}-{seq.last_value:06d}"

            reversing_tx = FinancialTransaction.objects.create(
                branch=tx.branch,
                period=tx.period,
                reference_number=ref_rev,
                transaction_type='JRN',
                date=timezone.now(),
                description=f"Reversal of donation transaction {tx.reference_number}.",
                status='POSTED',
                transaction_currency=tx.transaction_currency,
                exchange_rate_applied=tx.exchange_rate_applied,
                base_currency_amount=tx.base_currency_amount,
                created_by=instance.updated_by or instance.created_by
            )

            # Lock and create opposite ledger entries
            original_entries = tx.entries.all()
            account_ids = sorted([e.account.id for e in original_entries])
            locked_accounts = {
                acc.id: acc for acc in Account.objects.select_for_update().filter(id__in=account_ids)
            }

            for entry in original_entries:
                LedgerEntry.objects.create(
                    branch=tx.branch,
                    transaction=reversing_tx,
                    account=locked_accounts[entry.account.id],
                    amount=-entry.amount,
                    entry_sequence=entry.entry_sequence,
                    created_by=instance.updated_by or instance.created_by
                )

            tx.reversed_by = reversing_tx
            tx.save()

            # Reconstruct balances
            for entry in original_entries:
                acc = locked_accounts[entry.account.id]
                acc.cached_balance = acc.reconstruct_balance()
                acc.save()


@receiver(post_save, sender=Expense)
def handle_expense_ledger_posting(sender, instance, created, **kwargs):
    if instance.is_archived:
        return

    # 1. Post to ledger when APPROVED and not already linked
    if instance.status == 'APPROVED' and not instance.financial_transaction:
        # Find active open financial period covering the date
        period = FinancialPeriod.objects.filter(
            branch=instance.branch,
            start_date__lte=instance.date.date(),
            end_date__gte=instance.date.date()
        ).first()

        if not period:
            from datetime import date
            import calendar
            event_date = instance.date.date() if hasattr(instance.date, 'date') else instance.date
            year = event_date.year
            month = event_date.month
            _, last_day = calendar.monthrange(year, month)
            start_dt = date(year, month, 1)
            end_dt = date(year, month, last_day)
            
            period = FinancialPeriod.objects.create(
                branch=instance.branch,
                name=f"Auto-Opened Period {start_dt.strftime('%B %Y')}",
                start_date=start_dt,
                end_date=end_dt,
                status='OPEN'
            )
        if period.status in ['CLOSED', 'LOCKED']:
            raise ValidationError(f"Cannot post expense in a {period.status} financial period.")

        # Determine accounts
        exp_code = '5300' if ('benev' in instance.category.lower() or 'outreach' in instance.category.lower()) else '5100'
        debit_account = Account.objects.filter(branch=instance.branch, code=exp_code).first()
        if not debit_account:
            debit_account = Account.objects.filter(branch=instance.branch, type='EXPENSE').first()

        cash_code = '1120' if instance.payment_method.lower() == 'cash' else '1110'
        credit_account = Account.objects.filter(branch=instance.branch, code=cash_code).first()
        if not credit_account:
            credit_account = Account.objects.filter(branch=instance.branch, type='ASSET').first()

        if not debit_account or not credit_account:
            raise ValidationError("Required Asset or Expense accounts are missing for this branch.")

        with transaction.atomic():
            # Get sequential reference number
            year = instance.date.year
            seq, _ = ReferenceSequence.objects.select_for_update().get_or_create(
                prefix='EXP',
                year=year,
                defaults={'last_value': 0}
            )
            seq.last_value += 1
            seq.save()
            ref = f"EXP-{year}-{seq.last_value:06d}"

            # Create transaction
            tx = FinancialTransaction.objects.create(
                branch=instance.branch,
                period=period,
                reference_number=ref,
                transaction_type='EXP',
                date=instance.date,
                description=f"Expense payed to {instance.payee} via {instance.payment_method}",
                status='POSTED',
                transaction_currency=instance.currency,
                exchange_rate_applied=Decimal('1.000000'),
                base_currency_amount=instance.amount,
                created_by=instance.created_by
            )

            # Debit Entry (Expense)
            LedgerEntry.objects.create(
                branch=instance.branch,
                transaction=tx,
                account=debit_account,
                amount=instance.amount,
                entry_sequence=1,
                created_by=instance.created_by
            )

            # Credit Entry (Asset)
            LedgerEntry.objects.create(
                branch=instance.branch,
                transaction=tx,
                account=credit_account,
                amount=-instance.amount,
                entry_sequence=2,
                created_by=instance.created_by
            )

            # Reconstruct balances
            for acc in [debit_account, credit_account]:
                acc.cached_balance = acc.reconstruct_balance()
                acc.save()

            # Update link on expense
            Expense.objects.filter(pk=instance.pk).update(financial_transaction=tx)

    # 2. Void ledger transaction when Expense is VOIDED
    elif instance.status == 'VOIDED' and instance.financial_transaction and instance.financial_transaction.status == 'POSTED':
        tx = instance.financial_transaction
        if tx.period.status in ['CLOSED', 'LOCKED']:
            raise ValidationError("Cannot void transaction inside a closed/locked period.")

        with transaction.atomic():
            tx.status = 'VOIDED'
            
            # Create reversing transaction
            year = timezone.now().year
            seq, _ = ReferenceSequence.objects.select_for_update().get_or_create(
                prefix='JRN',
                year=year,
                defaults={'last_value': 0}
            )
            seq.last_value += 1
            seq.save()
            ref_rev = f"JRN-{year}-{seq.last_value:06d}"

            reversing_tx = FinancialTransaction.objects.create(
                branch=tx.branch,
                period=tx.period,
                reference_number=ref_rev,
                transaction_type='JRN',
                date=timezone.now(),
                description=f"Reversal of expense transaction {tx.reference_number}.",
                status='POSTED',
                transaction_currency=tx.transaction_currency,
                exchange_rate_applied=tx.exchange_rate_applied,
                base_currency_amount=tx.base_currency_amount,
                created_by=instance.updated_by or instance.created_by
            )

            # Lock and create opposite ledger entries
            original_entries = tx.entries.all()
            account_ids = sorted([e.account.id for e in original_entries])
            locked_accounts = {
                acc.id: acc for acc in Account.objects.select_for_update().filter(id__in=account_ids)
            }

            for entry in original_entries:
                LedgerEntry.objects.create(
                    branch=tx.branch,
                    transaction=reversing_tx,
                    account=locked_accounts[entry.account.id],
                    amount=-entry.amount,
                    entry_sequence=entry.entry_sequence,
                    created_by=instance.updated_by or instance.created_by
                )

            tx.reversed_by = reversing_tx
            tx.save()

            # Reconstruct balances
            for entry in original_entries:
                acc = locked_accounts[entry.account.id]
                acc.cached_balance = acc.reconstruct_balance()
                acc.save()
