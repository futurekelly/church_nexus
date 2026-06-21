import logging
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from authentication.models import EmailLog

logger = logging.getLogger(__name__)

def send_templated_email(log_id, context):
    """
    Core reusable email service.
    Loads the EmailLog by ID, renders HTML and plaintext templates, 
    sends via EmailMultiAlternatives, and updates the EmailLog status.
    """
    try:
        log = EmailLog.objects.get(pk=log_id)
    except EmailLog.DoesNotExist:
        logger.error(f"EmailLog with ID {log_id} not found in database.")
        return False

    # Map email type to template name
    # e.g., 'password_reset' -> 'emails/password_reset.html' / 'emails/password_reset.txt'
    template_name = f"emails/{log.email_type}"
    
    try:
        # Render HTML version
        html_content = render_to_string(f"{template_name}.html", context)
        
        # Render Plaintext version (fallback)
        try:
            text_content = render_to_string(f"{template_name}.txt", context)
        except Exception:
            # Safe fallback if plaintext template is missing
            text_content = strip_tags(html_content)

        # Create email
        msg = EmailMultiAlternatives(
            subject=log.subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[log.recipient]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Send
        msg.send(fail_silently=False)
        
        # Log success
        log.status = 'SENT'
        log.error_message = None
        log.save()
        logger.info(f"Email type '{log.email_type}' successfully sent to {log.recipient}.")
        return True

    except Exception as e:
        # Log failure details
        log.status = 'FAILED'
        log.error_message = str(e)
        log.save()
        logger.error(f"Failed sending email type '{log.email_type}' to {log.recipient}: {e}")
        # Re-raise to let Celery retry the task if autoretry is enabled
        raise e
