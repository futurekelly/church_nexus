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
