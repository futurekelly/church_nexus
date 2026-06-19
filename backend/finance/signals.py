from django.db.models.signals import post_save
from django.dispatch import receiver
from branches.models import Branch
from finance.models import Account

DEFAULT_ACCOUNTS = [
    {'code': '1110', 'name': 'Main Operating Bank Account', 'type': 'ASSET'},
    {'code': '1120', 'name': 'Petty Cash Fund', 'type': 'ASSET'},
    {'code': '2100', 'name': 'Accounts Payable', 'type': 'LIABILITY'},
    {'code': '3100', 'name': 'Retained Earnings', 'type': 'EQUITY'},
    {'code': '4100', 'name': 'General Tithes & Offerings', 'type': 'REVENUE'},
    {'code': '4200', 'name': 'Campaign Donations', 'type': 'REVENUE'},
    {'code': '5100', 'name': 'Operational & Admin Expenses', 'type': 'EXPENSE'},
    {'code': '5300', 'name': 'Benevolence & Outreach', 'type': 'EXPENSE'},
]

@receiver(post_save, sender=Branch)
def seed_default_accounts_for_new_branch(sender, instance, created, **kwargs):
    if created:
        for acc_data in DEFAULT_ACCOUNTS:
            Account.objects.get_or_create(
                branch=instance,
                code=acc_data['code'],
                defaults={
                    'name': acc_data['name'],
                    'type': acc_data['type'],
                    'cached_balance': 0.00
                }
            )
