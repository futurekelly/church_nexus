from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models, transaction
from django.core.exceptions import PermissionDenied

from events.models import Event, EventRegistration, EventCheckIn, EventResource, ResourceBooking
from events.serializers import (
    EventSerializer,
    EventRegistrationSerializer,
    EventCheckInSerializer,
    EventResourceSerializer,
    ResourceBookingSerializer
)

from rest_framework.pagination import PageNumberPagination

class StandardPageNumberPagination(PageNumberPagination):
    page_size = 8
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        page_size = self.get_page_size(self.request)
        count = self.page.paginator.count
        total_pages = self.page.paginator.num_pages
        
        return Response({
            'count': count,
            'page': self.page.number,
            'page_size': page_size,
            'total_pages': total_pages,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPageNumberPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return Event.objects.none()

        queryset = Event.objects.all()

        # Branch Isolation
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                return Event.objects.none()

        # Filtering soft deletes
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        # Filters
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(location__icontains=search) |
                models.Q(organizer__icontains=search)
            )

        event_type = self.request.query_params.get('type')
        if event_type and event_type != 'all':
            queryset = queryset.filter(event_type=event_type)

        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)

        date_range = self.request.query_params.get('dateRange')
        now = timezone.now()
        if date_range == 'today':
            queryset = queryset.filter(start_date__date=now.date())
        elif date_range == 'upcoming':
            queryset = queryset.filter(start_date__gte=now)
        elif date_range == 'past':
            queryset = queryset.filter(end_date__lt=now)
        elif date_range == 'this-week':
            one_week_later = now + timezone.timedelta(days=7)
            queryset = queryset.filter(start_date__range=(now, one_week_later))

        return queryset.order_by('start_date')

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch

        if user.role == 'super_admin':
            branch_id = self.request.data.get('branch')
            if branch_id:
                from branches.models import Branch
                try:
                    branch = Branch.objects.get(id=branch_id)
                except Branch.DoesNotExist:
                    raise serializers.ValidationError({"branch": "Invalid branch ID."})

        if not branch:
            raise serializers.ValidationError({"branch": "A branch assignment is required."})

        serializer.save(
            branch=branch,
            created_by=user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Physical deletion is disabled. Use the /archive/ endpoint instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        event = self.get_object()
        if event.is_archived:
            return Response({"detail": "Event is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        event.is_archived = True
        event.archived_at = timezone.now()
        event.archived_by = request.user
        event.status = 'Archived'
        event.save()
        return Response({"detail": "Event successfully archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        event = self.get_object()
        if not event.is_archived:
            return Response({"detail": "Event is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        event.is_archived = False
        event.archived_at = None
        event.archived_by = None
        event.status = 'Draft'
        event.save()
        return Response({"detail": "Event successfully restored."}, status=status.HTTP_200_OK)


class EventRegistrationViewSet(viewsets.ModelViewSet):
    serializer_class = EventRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return EventRegistration.objects.none()

        queryset = EventRegistration.objects.all()

        # Branch isolation via event branch
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(event__branch=user.branch)
            else:
                return EventRegistration.objects.none()

        # Soft delete filtering
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        # Filters
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id)

        return queryset.order_by('-registration_date')

    def perform_create(self, serializer):
        user = self.request.user
        event = serializer.validated_data.get('event')
        if user.role != 'super_admin' and event.branch != user.branch:
            raise PermissionDenied("You do not have permission to register for an event in another branch.")
        
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        old_status = self.get_object().status
        serializer.save(updated_by=user)
        new_status = serializer.instance.status

        # If cancelled, trigger waitlist promotion
        if old_status in ['REGISTERED', 'PROMOTED'] and new_status == 'CANCELLED':
            self.promote_waitlist(serializer.instance.event)

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Physical deletion is disabled. Use the /archive/ endpoint instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        reg = self.get_object()
        if reg.is_archived:
            return Response({"detail": "Registration is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        reg.is_archived = True
        reg.archived_at = timezone.now()
        reg.archived_by = request.user
        reg.save()
        
        # Trigger waitlist promotion if needed
        if reg.status in ['REGISTERED', 'PROMOTED']:
            self.promote_waitlist(reg.event)

        return Response({"detail": "Registration successfully archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        reg = self.get_object()
        if not reg.is_archived:
            return Response({"detail": "Registration is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        reg.is_archived = False
        reg.archived_at = None
        reg.archived_by = None
        reg.save()
        return Response({"detail": "Registration successfully restored."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='check-in')
    def check_in(self, request, pk=None):
        reg = self.get_object()
        if reg.attendance_status == 'checked_in':
            return Response({"detail": "Attendee is already checked in."}, status=status.HTTP_400_BAD_REQUEST)

        method = request.data.get('check_in_method', 'MANUAL')
        
        with transaction.atomic():
            reg.attendance_status = 'checked_in'
            reg.status = 'ATTENDED'
            reg.save()
            
            # Create CheckIn Audit row
            EventCheckIn.objects.create(
                registration=reg,
                checked_in_by=request.user,
                check_in_method=method,
                created_by=request.user
            )

            # Module 15 Sync Trigger
            event = reg.event
            if event.group_id and reg.member_id:
                self.sync_group_attendance(event, reg, request.user)

        return Response({"detail": "Attendee checked in successfully."}, status=status.HTTP_200_OK)

    def promote_waitlist(self, event):
        active_count = event.registrations.filter(
            status__in=['REGISTERED', 'PROMOTED', 'ATTENDED'],
            is_archived=False
        ).count()
        
        if event.capacity > 0 and active_count < event.capacity:
            next_waitlist = event.registrations.filter(
                status='WAITLISTED',
                is_archived=False
            ).order_by('registration_date').first()
            
            if next_waitlist:
                next_waitlist.status = 'PROMOTED'
                next_waitlist.save()

    def sync_group_attendance(self, event, reg, user):
        try:
            from groups.models import ConnectGroup, GroupAttendance, GroupAttendanceAttendee, GroupMember  # noqa: F401
            meeting_date = event.start_date.date()
            
            # Find group member corresponding to core member
            gmember = GroupMember.objects.filter(group_id=event.group_id, member_id=reg.member_id, is_archived=False).first()
            if not gmember:
                # Create a group member row if not registered
                gmember = GroupMember.objects.create(
                    group_id=event.group_id,
                    member_id=reg.member_id,
                    name=f"{reg.member.first_name} {reg.member.last_name}",
                    phone=reg.member.phone_number,
                    email=reg.member.email,
                    role='Member',
                    status='Active',
                    created_by=user
                )

            # Check if group attendance log exists
            log = GroupAttendance.objects.filter(group_id=event.group_id, meeting_date=meeting_date, is_archived=False).first()
            if log:
                # Add or update attendee
                attendee = log.attendees.filter(member=gmember).first()
                if attendee:
                    attendee.attended = True
                    attendee.status = 'Present'
                    attendee.notes = f"Event check-in sync: {event.title}"
                    attendee.save()
                else:
                    GroupAttendanceAttendee.objects.create(
                        attendance=log,
                        member=gmember,
                        attended=True,
                        status='Present',
                        notes=f"Event check-in sync: {event.title}"
                    )
            else:
                # Create group attendance log
                log = GroupAttendance.objects.create(
                    group_id=event.group_id,
                    meeting_date=meeting_date,
                    submitted_by=user,
                    study_topic=event.title,
                    created_by=user
                )
                GroupAttendanceAttendee.objects.create(
                    attendance=log,
                    member=gmember,
                    attended=True,
                    status='Present',
                    notes=f"Synced from Event: {event.title}"
                )
        except Exception as e:
            # Silently log error or raise depending on preferences
            print(f"Failed to sync group attendance: {e}")


class EventCheckInViewSet(viewsets.ModelViewSet):
    serializer_class = EventCheckInSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return EventCheckIn.objects.none()

        queryset = EventCheckIn.objects.all()

        # Branch isolation
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(registration__event__branch=user.branch)
            else:
                return EventCheckIn.objects.none()

        # Soft delete filtering
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        return queryset.order_by('-checked_in_at')


class EventResourceViewSet(viewsets.ModelViewSet):
    serializer_class = EventResourceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return EventResource.objects.none()

        queryset = EventResource.objects.all()

        # Branch isolation
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                return EventResource.objects.none()

        return queryset.order_by('name')

    def perform_create(self, serializer):
        user = self.request.user
        branch = user.branch
        if user.role == 'super_admin':
            branch_id = self.request.data.get('branch')
            if branch_id:
                from branches.models import Branch
                try:
                    branch = Branch.objects.get(id=branch_id)
                except Branch.DoesNotExist:
                    raise serializers.ValidationError({"branch": "Invalid branch ID."})
        if not branch:
            raise serializers.ValidationError({"branch": "A branch assignment is required."})
        serializer.save(branch=branch)


class ResourceBookingViewSet(viewsets.ModelViewSet):
    serializer_class = ResourceBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return ResourceBooking.objects.none()

        queryset = ResourceBooking.objects.all()

        # Branch isolation via event branch
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(event__branch=user.branch)
            else:
                return ResourceBooking.objects.none()

        # Filters
        event_id = self.request.query_params.get('event_id')
        if event_id:
            queryset = queryset.filter(event_id=event_id)

        return queryset.order_by('start_time')

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'Approved':
            return Response({"detail": "Booking is already approved."}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'Approved'
        booking.approved_by = request.user
        booking.approved_at = timezone.now()
        booking.save()
        return Response({"detail": "Booking approved successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'Rejected':
            return Response({"detail": "Booking is already rejected."}, status=status.HTTP_400_BAD_REQUEST)
        
        booking.status = 'Rejected'
        booking.save()
        return Response({"detail": "Booking rejected successfully."}, status=status.HTTP_200_OK)
