import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction, DatabaseError
from django.utils import timezone
from django.db.models import Avg, F, Count, Q
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import VisitorProfile, FollowUpTicket, ContactHistoryLog
from .serializers import VisitorProfileSerializer, FollowUpTicketSerializer, ContactHistoryLogSerializer
from members.models import Member
from authentication.models import User

class FollowUpAccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Super Admin bypasses all checks
        if request.user.role == 'super_admin':
            return True
            
        allowed_roles = ['super_admin', 'church_admin', 'pastor', 'treasurer', 'media_team']
        if request.user.role not in allowed_roles:
            return False
            
        # Write operations restricted to managers
        if request.method not in permissions.SAFE_METHODS:
            allowed_managers = ['super_admin', 'church_admin', 'pastor']
            return request.user.role in allowed_managers
            
        return True


class VisitorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = VisitorProfileSerializer
    permission_classes = [FollowUpAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = VisitorProfile.objects.filter(is_archived=False)
        if user.role != 'super_admin':
            queryset = queryset.filter(branch=user.branch)
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(membership_number__icontains=search)
            )
        return queryset

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'super_admin':
            branch = user.branch
        else:
            branch = serializer.validated_data.get('branch') or user.branch
            
        visitor = serializer.save(branch=branch, created_by=user)
        
        # Auto-create the follow-up ticket
        notes = self.request.data.get('notes') or "Visitor registered manually."
        FollowUpTicket.objects.create(
            branch=branch,
            visitor=visitor,
            status='New',
            source='Manual',
            notes=notes
        )


class FollowUpTicketViewSet(viewsets.ModelViewSet):
    serializer_class = FollowUpTicketSerializer
    permission_classes = [FollowUpAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = FollowUpTicket.objects.all()
        if user.role != 'super_admin':
            queryset = queryset.filter(branch=user.branch)
            
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        source_param = self.request.query_params.get('source')
        if source_param:
            queryset = queryset.filter(source=source_param)
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(visitor__first_name__icontains=search) |
                Q(visitor__last_name__icontains=search) |
                Q(notes__icontains=search)
            )
        return queryset

    @action(detail=True, methods=['post'], url_path='log-interaction')
    def log_interaction(self, request, pk=None):
        ticket = self.get_object()
        interaction_type = request.data.get('interaction_type')
        notes = request.data.get('notes')
        contact_date_str = request.data.get('contact_date')
        
        if not interaction_type or not notes:
            return Response(
                {"error": "interaction_type and notes are required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        contact_date = timezone.now()
        if contact_date_str:
            try:
                contact_date = timezone.datetime.fromisoformat(contact_date_str.replace('Z', '+00:00'))
            except ValueError:
                pass

        try:
            with transaction.atomic():
                ticket = FollowUpTicket.objects.select_for_update().get(pk=ticket.pk)
                
                # Check touchpoint logging idempotency (duplicates check within last 5 seconds)
                recent_logs = ContactHistoryLog.objects.filter(
                    visitor=ticket.visitor,
                    interaction_type=interaction_type,
                    notes=notes,
                    contacted_by=request.user,
                    contact_date__gte=timezone.now() - timezone.timedelta(seconds=5)
                )
                if recent_logs.exists():
                    return Response({"error": "Duplicate touchpoint detected."}, status=status.HTTP_400_BAD_REQUEST)
                
                log = ContactHistoryLog.objects.create(
                    visitor=ticket.visitor,
                    ticket=ticket,
                    interaction_type=interaction_type,
                    notes=notes,
                    contact_date=contact_date,
                    contacted_by=request.user
                )
                
                # Auto-transition status from New to Contacted
                if ticket.status == 'New':
                    ticket.status = 'Contacted'
                    ticket.save()
                    
                serializer = ContactHistoryLogSerializer(log)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='integrate')
    def integrate(self, request, pk=None):
        ticket = self.get_object()
        
        try:
            with transaction.atomic():
                ticket = FollowUpTicket.objects.select_for_update(nowait=True).get(pk=ticket.pk)
                
                if ticket.status == 'Integrated':
                    return Response(
                        {"error": "This ticket has already been integrated."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                visitor = ticket.visitor
                
                # Check if member profile already exists, if not, create one
                member = visitor.member
                if not member and visitor.email:
                    member = Member.objects.filter(email__iexact=visitor.email, branch=ticket.branch).first()
                        
                if not member:
                    # Fallback unique email if empty to prevent IntegrityError
                    email = visitor.email
                    if not email:
                        email = f"{visitor.first_name.lower()}.{visitor.last_name.lower()}-{str(uuid.uuid4())[:8]}@noemail.com"

                    member = Member.objects.create(
                        branch=ticket.branch,
                        first_name=visitor.first_name,
                        last_name=visitor.last_name,
                        email=email,
                        phone_number=visitor.phone_number,
                        gender=visitor.gender,
                        status='Active',
                        join_date=timezone.now().date(),
                        notes=f"Converted from visitor follow-up ticket. Intake notes: {visitor.notes or ''}"
                    )
                    visitor.member = member
                    visitor.save()
                else:
                    member.status = 'Active'
                    member.save()

                # Update associated user login role if they have one
                if visitor.email:
                    user_acct = User.objects.filter(email__iexact=visitor.email).first()
                    if user_acct:
                        user_acct.role = 'member'
                        user_acct.member_id = str(member.id)
                        user_acct.save()
                    
                # Transition ticket status to Integrated
                ticket.status = 'Integrated'
                ticket.save()
                
                # Celery notifications trigger
                try:
                    from follow_up.tasks import send_visitor_integration_notifications_task
                    send_visitor_integration_notifications_task.delay(str(ticket.id))
                except Exception as notif_err:
                    # Do not fail transaction if notification task queueing fails
                    pass
                
                return Response({
                    "message": "Visitor successfully transitioned to active member.",
                    "ticket_id": str(ticket.id),
                    "status": ticket.status,
                    "is_completed": ticket.is_completed,
                    "member_id": str(member.id),
                    "membership_number": member.membership_number
                }, status=status.HTTP_200_OK)
                
        except DatabaseError:
            return Response(
                {"error": "This ticket is currently being updated by another request. Please try again."},
                status=status.HTTP_409_CONFLICT
            )
        except DjangoValidationError as e:
            return Response({"error": e.message_dict}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ContactHistoryLogViewSet(viewsets.ModelViewSet):
    serializer_class = ContactHistoryLogSerializer
    permission_classes = [FollowUpAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = ContactHistoryLog.objects.all()
        if user.role != 'super_admin':
            queryset = queryset.filter(visitor__branch=user.branch)
            
        visitor_param = self.request.query_params.get('visitor')
        if visitor_param:
            queryset = queryset.filter(visitor_id=visitor_param)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(contacted_by=self.request.user)


class FollowUpAnalyticsView(APIView):
    permission_classes = [FollowUpAccessPermission]

    def get(self, request):
        user = request.user
        
        tickets = FollowUpTicket.objects.all()
        if user.role != 'super_admin':
            tickets = tickets.filter(branch=user.branch)
            
        new_count = tickets.filter(status='New', is_completed=False).count()
        contacted_count = tickets.filter(status='Contacted', is_completed=False).count()
        following_up_count = tickets.filter(status='Following Up', is_completed=False).count()
        integrated_count = tickets.filter(status='Integrated').count()
        
        total_tickets = tickets.count()
        conversion_rate = round((integrated_count / total_tickets * 100), 1) if total_tickets > 0 else 0.0
        
        integrated_tickets = tickets.filter(status='Integrated', integrated_at__isnull=False)
        duration_expr = F('integrated_at') - F('created_at')
        avg_duration = integrated_tickets.annotate(duration=duration_expr).aggregate(Avg('duration'))['duration__avg']
        
        avg_days = 0.0
        if avg_duration:
            avg_days = round(avg_duration.total_seconds() / 86400.0, 1)
            
        pastor_counts = tickets.filter(is_completed=False, assigned_pastor__isnull=False)\
                               .values('assigned_pastor__id', 'assigned_pastor__first_name', 'assigned_pastor__last_name')\
                               .annotate(count=Count('id'))\
                               .order_by('-count')
                               
        tickets_by_pastor = []
        for p in pastor_counts:
            first = p['assigned_pastor__first_name'] or ''
            last = p['assigned_pastor__last_name'] or ''
            tickets_by_pastor.append({
                "pastor_name": f"{first} {last}".strip() or "Pastor",
                "ticket_count": p['count']
            })
            
        return Response({
            "new_visitors": new_count,
            "contacted_visitors": contacted_count,
            "following_up_visitors": following_up_count,
            "integrated_visitors": integrated_count,
            "conversion_rate": conversion_rate,
            "avg_days_to_integration": avg_days,
            "tickets_by_pastor": tickets_by_pastor
        }, status=status.HTTP_200_OK)
