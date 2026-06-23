from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from testimonies.models import Testimony
from testimonies.serializers import TestimonySerializer
from authentication.models import User, Notification, EmailLog

class TestimonyViewSet(viewsets.ModelViewSet):
    queryset = Testimony.objects.all()
    serializer_class = TestimonySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'increment_view']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if not user or not user.is_authenticated:
            # Unauthenticated public users can only see Approved testimonies
            return qs.filter(status='Approved')

        if user.role == 'super_admin':
            # Super Admin has global visibility
            return qs

        if user.role in ['church_admin', 'pastor']:
            # Moderators can see testimonies in their own branch
            return qs.filter(branch=user.branch)

        # Members / Visitors / Treasurers: Approved testimonies OR their own submissions
        return qs.filter(Q(status='Approved') | Q(author_user=user))

    def perform_create(self, serializer):
        user = self.request.user
        
        # Enforce initial PENDING status and prevent non-moderators from auto-publishing
        # (Status defaults to Pending, we force it here as well)
        extra_args = {
            'status': 'Pending',
            'is_featured': False,
        }

        if user and user.is_authenticated:
            extra_args['author_user'] = user
            extra_args['branch'] = user.branch
            # If not anonymous, default to user's name/email if not provided
            if not serializer.validated_data.get('is_anonymous'):
                if not serializer.validated_data.get('author_name'):
                    extra_args['author_name'] = f"{user.first_name} {user.last_name}".strip() or user.email
                if not serializer.validated_data.get('author_email'):
                    extra_args['author_email'] = user.email

        testimony = serializer.save(**extra_args)

        # 1. Create In-App Notifications for branch moderators
        if testimony.branch:
            moderators = User.objects.filter(
                branch=testimony.branch,
                role__in=['church_admin', 'pastor']
            ) | User.objects.filter(role='super_admin')
        else:
            moderators = User.objects.filter(role='super_admin')

        for mod in moderators:
            Notification.objects.create(
                user=mod,
                title="New Testimony Submitted",
                message=f"A new testimony '{testimony.title}' has been submitted by {testimony.author_name} and is awaiting review.",
                priority="Medium",
                delivery_channel="In-App",
                action_url="/dashboard/testimonies",
                branch=testimony.branch
            )

        # 2. Trigger Celery Task to send email notifications to branch moderators
        from authentication.tasks import send_testimony_submitted_email_task
        send_testimony_submitted_email_task.delay(str(testimony.id))

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        
        testimony = serializer.save()
        new_status = testimony.status

        # If status transitioned to Approved or Rejected, trigger notifications
        if old_status != new_status and new_status in ['Approved', 'Rejected']:
            # 1. Create In-App Notification for author user
            if testimony.author_user:
                title = f"Testimony {new_status}"
                message = f"Your testimony '{testimony.title}' has been {new_status.lower()}."
                if new_status == 'Rejected' and testimony.rejection_reason:
                    message += f" Reason: {testimony.rejection_reason}"

                Notification.objects.create(
                    user=testimony.author_user,
                    title=title,
                    message=message,
                    priority="Medium",
                    delivery_channel="In-App",
                    action_url="/dashboard/testimonies",
                    branch=testimony.branch
                )

            # 2. Trigger Celery Task to send email notification to author
            from authentication.tasks import send_testimony_moderation_email_task
            send_testimony_moderation_email_task.delay(str(testimony.id))

    @action(detail=True, methods=['post'], url_path='increment-view', permission_classes=[permissions.AllowAny])
    def increment_view(self, request, pk=None):
        # Atomic database update using F() expression
        # Only Approved testimonies can increment views
        updated_count = Testimony.objects.filter(id=pk, status='Approved').update(views=models.F('views') + 1)
        if updated_count == 0:
            return Response(
                {"success": False, "message": "Testimony not found or is not approved."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({"success": True, "message": "View count incremented."})
