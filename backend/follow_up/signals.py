from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import VisitorProfile, FollowUpTicket
from members.models import Member

User = get_user_model()

@receiver(post_save, sender=User)
def handle_user_visitor_signup(sender, instance, created, **kwargs):
    if created and instance.role == 'visitor':
        # Ensure we don't duplicate the profile
        if not VisitorProfile.objects.filter(email__iexact=instance.email, branch=instance.branch).exists():
            member = Member.objects.filter(email__iexact=instance.email, branch=instance.branch).first()
            gender = 'male'
            if member:
                gender = member.gender

            visitor = VisitorProfile.objects.create(
                branch=instance.branch,
                member=member,
                first_name=instance.first_name or "New",
                last_name=instance.last_name or "Visitor",
                email=instance.email,
                phone_number="",
                gender=gender,
                date_joined=instance.date_joined if hasattr(instance, 'date_joined') else timezone.now(),
                first_time_visitor=True,
                notes="Registered online via web portal."
            )
            
            FollowUpTicket.objects.create(
                branch=instance.branch,
                visitor=visitor,
                status='New',
                source='Manual',
                notes="Auto-created from web registration."
            )
