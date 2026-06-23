import logging
from celery import shared_task
from authentication.services.email_service import send_templated_email

logger = logging.getLogger(__name__)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_password_reset_email_task(self, log_id, context):
    logger.info(f"Executing send_password_reset_email_task for log {log_id}")
    send_templated_email(log_id, context)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_visitor_registration_email_task(self, log_id, context):
    logger.info(f"Executing send_visitor_registration_email_task for log {log_id}")
    send_templated_email(log_id, context)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_visitor_approval_email_task(self, log_id, context):
    logger.info(f"Executing send_visitor_approval_email_task for log {log_id}")
    send_templated_email(log_id, context)

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_donation_receipt_email_task(self, donation_id):
    logger.info(f"Executing send_donation_receipt_email_task for donation {donation_id}")
    from authentication.models import EmailLog
    from donations.models import Donation
    
    # 1. Prevent duplicate email sending
    if EmailLog.objects.filter(email_type='donation_receipt', subject__icontains=str(donation_id), status='SENT').exists():
        logger.info(f"Donation receipt already sent for donation {donation_id}")
        return
        
    try:
        donation = Donation.objects.get(pk=donation_id)
    except Donation.DoesNotExist:
        logger.error(f"Donation {donation_id} not found in database.")
        return

    # Check email availability
    recipient_email = donation.member.email if (donation.member and donation.member.email) else None
    tx_ref = donation.financial_transaction.reference_number if donation.financial_transaction else f"TX-{donation.id}"
    
    if not recipient_email:
        # Create a failed log for record keeping
        EmailLog.objects.create(
            recipient="unknown@donor.com",
            subject=f"Donation Receipt (Ref: {tx_ref}) - Donation ID: {donation_id}",
            email_type="donation_receipt",
            status="FAILED",
            error_message="Guest donation: No member email available for receipt."
        )
        logger.warning(f"Skipping donation receipt for {donation_id}: Guest donation with no email.")
        return

    # Create PENDING EmailLog
    log = EmailLog.objects.create(
        recipient=recipient_email,
        subject=f"Donation Receipt (Ref: {tx_ref}) - Donation ID: {donation_id}",
        email_type="donation_receipt",
        status="PENDING"
    )

    context = {
        'donor_name': f"{donation.member.first_name} {donation.member.last_name}" if donation.member else "Guest Donor",
        'amount': str(donation.amount),
        'currency': donation.currency,
        'branch_name': donation.branch.branch_name if donation.branch else "Church Nexus",
        'transaction_ref': tx_ref,
        'timestamp': donation.date.strftime('%Y-%m-%d %H:%M:%S')
    }

    try:
        send_templated_email(str(log.id), context)
    except Exception as e:
        logger.error(f"Failed sending donation receipt email task for {donation_id}: {e}")
        raise e

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_testimony_submitted_email_task(self, testimony_id):
    logger.info(f"Executing send_testimony_submitted_email_task for testimony {testimony_id}")
    from testimonies.models import Testimony
    from authentication.models import EmailLog, User
    from django.conf import settings

    try:
        testimony = Testimony.objects.get(pk=testimony_id)
    except Testimony.DoesNotExist:
        logger.error(f"Testimony {testimony_id} not found in database.")
        return

    # Find moderators belonging to the same branch
    if testimony.branch:
        moderators = User.objects.filter(
            branch=testimony.branch,
            role__in=['church_admin', 'pastor']
        ) | User.objects.filter(role='super_admin')
    else:
        moderators = User.objects.filter(role='super_admin')

    # Send an email alert to each moderator
    for mod in moderators:
        if not mod.email:
            continue
            
        try:
            log = EmailLog.objects.create(
                recipient=mod.email,
                subject=f"[Church Nexus] New Testimony Submitted - {testimony.title}",
                email_type="testimony_submitted",
                status="PENDING"
            )
            
            review_url = f"{settings.FRONTEND_URL}/dashboard/testimonies"
            context = {
                'moderator_name': f"{mod.first_name} {mod.last_name}".strip() or mod.email,
                'author_name': testimony.author_name,
                'testimony_title': testimony.title,
                'category': testimony.category,
                'branch_name': testimony.branch.branch_name if testimony.branch else "Global / No Branch",
                'review_url': review_url
            }
            send_templated_email(str(log.id), context)
        except Exception as e:
            logger.error(f"Failed sending testimony submitted email alert to moderator {mod.email}: {e}")

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_testimony_moderation_email_task(self, testimony_id):
    logger.info(f"Executing send_testimony_moderation_email_task for testimony {testimony_id}")
    from testimonies.models import Testimony
    from authentication.models import EmailLog
    from django.conf import settings

    try:
        testimony = Testimony.objects.get(pk=testimony_id)
    except Testimony.DoesNotExist:
        logger.error(f"Testimony {testimony_id} not found in database.")
        return

    recipient_email = testimony.author_email
    if not recipient_email and testimony.author_user:
        recipient_email = testimony.author_user.email
        
    if not recipient_email:
        logger.warning(f"No recipient email found for testimony {testimony_id} author notification.")
        return

    status_lower = testimony.status.lower()
    email_type = f"testimony_{status_lower}"
    subject = f"[Church Nexus] Your testimony has been {status_lower}!"

    try:
        log = EmailLog.objects.create(
            recipient=recipient_email,
            subject=subject,
            email_type=email_type,
            status="PENDING"
        )
        
        context = {
            'author_name': testimony.author_name,
            'testimony_title': testimony.title,
            'status': testimony.status,
            'rejection_reason': testimony.rejection_reason,
            'wall_url': f"{settings.FRONTEND_URL}/testimonies"
        }
        send_templated_email(str(log.id), context)
    except Exception as e:
        logger.error(f"Failed sending testimony moderation status email to {recipient_email}: {e}")
        raise e

