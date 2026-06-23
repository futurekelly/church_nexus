import logging
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from authentication.models import EmailLog, Notification
from authentication.services.email_service import send_templated_email
from .models import FollowUpTicket, VisitorProfile
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_visitor_integration_notifications_task(self, ticket_id):
    logger.info(f"Executing send_visitor_integration_notifications_task for ticket {ticket_id}")
    try:
        ticket = FollowUpTicket.objects.get(pk=ticket_id)
        visitor = ticket.visitor
    except FollowUpTicket.DoesNotExist:
        logger.error(f"FollowUpTicket {ticket_id} not found.")
        return

    # 1. Send Welcome Email to Integrated Visitor (if email exists)
    if visitor.email:
        try:
            subject = f"Welcome to {ticket.branch.branch_name or 'our Church'}!"
            existing_log = EmailLog.objects.filter(
                recipient=visitor.email,
                email_type="visitor_integration",
                subject=subject
            ).first()
            
            if not existing_log:
                log = EmailLog.objects.create(
                    recipient=visitor.email,
                    subject=subject,
                    email_type="visitor_integration",
                    status="PENDING"
                )
                
                context = {
                    'visitor_name': f"{visitor.first_name} {visitor.last_name}",
                    'branch_name': ticket.branch.branch_name,
                    'join_date': timezone.now().strftime('%Y-%m-%d'),
                }
                
                send_templated_email(log.id, context)
            elif existing_log.status == "FAILED":
                existing_log.status = "PENDING"
                existing_log.error_message = None
                existing_log.save()
                
                context = {
                    'visitor_name': f"{visitor.first_name} {visitor.last_name}",
                    'branch_name': ticket.branch.branch_name,
                    'join_date': timezone.now().strftime('%Y-%m-%d'),
                }
                
                send_templated_email(existing_log.id, context)
        except Exception as e:
            logger.error(f"Failed to send visitor integration email: {e}")
            raise e

    # 2. In-App Notification to same-branch leaders/admins
    admins = User.objects.filter(
        role__in=['super_admin', 'church_admin', 'pastor'],
        branch=ticket.branch
    )
    for admin in admins:
        try:
            action_url = f"/dashboard/members/{visitor.member.id}" if visitor.member else "/dashboard/members"
            notification_exists = Notification.objects.filter(
                user=admin,
                title="Visitor Integrated",
                branch=ticket.branch,
                action_url=action_url
            ).exists()
            
            if not notification_exists:
                Notification.objects.create(
                    user=admin,
                    title="Visitor Integrated",
                    message=f"Visitor {visitor.first_name} {visitor.last_name} has been successfully integrated as an Active Member.",
                    priority="Medium",
                    delivery_channel="In-App",
                    branch=ticket.branch,
                    action_url=action_url
                )
        except Exception as e:
            logger.error(f"Failed to create integration notification for user {admin.id}: {e}")


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3}
)
def send_ticket_assignment_notification_task(self, ticket_id):
    logger.info(f"Executing send_ticket_assignment_notification_task for ticket {ticket_id}")
    try:
        ticket = FollowUpTicket.objects.get(pk=ticket_id)
        pastor = ticket.assigned_pastor
        visitor = ticket.visitor
    except FollowUpTicket.DoesNotExist:
        logger.error(f"FollowUpTicket {ticket_id} not found.")
        return

    if not pastor:
        logger.warning(f"No pastor assigned to ticket {ticket_id}.")
        return

    # 1. Send Assignment Email to Pastor
    try:
        subject = f"[Church Nexus] New Follow-Up Ticket Assigned - {visitor.first_name} {visitor.last_name}"
        existing_log = EmailLog.objects.filter(
            recipient=pastor.email,
            email_type="ticket_assignment",
            subject=subject
        ).first()
        
        if not existing_log:
            log = EmailLog.objects.create(
                recipient=pastor.email,
                subject=subject,
                email_type="ticket_assignment",
                status="PENDING"
            )
            
            context = {
                'pastor_name': f"{pastor.first_name} {pastor.last_name}",
                'visitor_name': f"{visitor.first_name} {visitor.last_name}",
                'ticket_source': ticket.source,
                'ticket_notes': ticket.notes or "No additional notes.",
                'action_url': f"{settings.FRONTEND_URL}/dashboard/follow-up/{ticket.id}"
            }
            
            send_templated_email(log.id, context)
        elif existing_log.status == "FAILED":
            existing_log.status = "PENDING"
            existing_log.error_message = None
            existing_log.save()
            
            context = {
                'pastor_name': f"{pastor.first_name} {pastor.last_name}",
                'visitor_name': f"{visitor.first_name} {visitor.last_name}",
                'ticket_source': ticket.source,
                'ticket_notes': ticket.notes or "No additional notes.",
                'action_url': f"{settings.FRONTEND_URL}/dashboard/follow-up/{ticket.id}"
            }
            
            send_templated_email(existing_log.id, context)
    except Exception as e:
        logger.error(f"Failed to send ticket assignment email to pastor: {e}")
        raise e

    # 2. In-App Notification to Pastor
    try:
        notification_exists = Notification.objects.filter(
            user=pastor,
            title="New Follow-Up Ticket Assigned",
            branch=ticket.branch,
            action_url=f"/dashboard/follow-up/{ticket.id}"
        ).exists()
        
        if not notification_exists:
            Notification.objects.create(
                user=pastor,
                title="New Follow-Up Ticket Assigned",
                message=f"You have been assigned to follow up on new visitor {visitor.first_name} {visitor.last_name}.",
                priority="High",
                delivery_channel="In-App",
                branch=ticket.branch,
                action_url=f"/dashboard/follow-up/{ticket.id}"
            )
    except Exception as e:
        logger.error(f"Failed to create ticket assignment notification for pastor {pastor.id}: {e}")
