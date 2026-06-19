from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db import models
from django.core.exceptions import PermissionDenied

from groups.models import ConnectGroup, GroupMember, GroupAttendance, GroupPrayerRequest, StudyOutline
from groups.serializers import (
    ConnectGroupSerializer,
    GroupMemberSerializer,
    GroupAttendanceSerializer,
    GroupPrayerRequestSerializer,
    StudyOutlineSerializer
)

class ConnectGroupViewSet(viewsets.ModelViewSet):
    serializer_class = ConnectGroupSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return ConnectGroup.objects.none()
        
        queryset = ConnectGroup.objects.all()
        
        # Branch Isolation
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                return ConnectGroup.objects.none()

        # Consistent ordering
        return queryset.order_by('-created_at')

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


class GroupMemberViewSet(viewsets.ModelViewSet):
    serializer_class = GroupMemberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return GroupMember.objects.none()

        queryset = GroupMember.objects.all()

        # Branch isolation via group branch
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(group__branch=user.branch)
            else:
                return GroupMember.objects.none()

        # Handle soft delete filtering
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        # Filters
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        # Verify user has access to create member in this group
        user = self.request.user
        group = serializer.validated_data.get('group')
        if user.role != 'super_admin' and group.branch != user.branch:
            raise PermissionDenied("You do not have permission to add members to a group in another branch.")

        serializer.save(created_by=user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Physical deletion is disabled. Use the /archive/ endpoint instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        member = self.get_object()
        if member.is_archived:
            return Response({"detail": "Group member is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        member.is_archived = True
        member.archived_at = timezone.now()
        member.archived_by = request.user
        member.save()
        return Response({"detail": "Group member successfully archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        member = self.get_object()
        if not member.is_archived:
            return Response({"detail": "Group member is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        member.is_archived = False
        member.archived_at = None
        member.archived_by = None
        member.save()
        return Response({"detail": "Group member successfully restored."}, status=status.HTTP_200_OK)


class GroupAttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = GroupAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return GroupAttendance.objects.none()

        queryset = GroupAttendance.objects.all()

        # Branch isolation
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(group__branch=user.branch)
            else:
                return GroupAttendance.objects.none()

        # Soft delete filtering
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        # Filters
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        return queryset.order_by('-meeting_date')

    def perform_create(self, serializer):
        user = self.request.user
        group = serializer.validated_data.get('group')
        if user.role != 'super_admin' and group.branch != user.branch:
            raise PermissionDenied("You do not have permission to log attendance for a group in another branch.")

        serializer.save(
            submitted_by=user,
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
        log = self.get_object()
        if log.is_archived:
            return Response({"detail": "Attendance log is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        log.is_archived = True
        log.archived_at = timezone.now()
        log.archived_by = request.user
        log.save()
        return Response({"detail": "Attendance log successfully archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        log = self.get_object()
        if not log.is_archived:
            return Response({"detail": "Attendance log is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        log.is_archived = False
        log.archived_at = None
        log.archived_by = None
        log.save()
        return Response({"detail": "Attendance log successfully restored."}, status=status.HTTP_200_OK)


class GroupPrayerRequestViewSet(viewsets.ModelViewSet):
    serializer_class = GroupPrayerRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return GroupPrayerRequest.objects.none()

        queryset = GroupPrayerRequest.objects.all()

        # Branch isolation
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(group__branch=user.branch)
            else:
                return GroupPrayerRequest.objects.none()

        # Soft delete filtering
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        # Filters
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)

        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        group = serializer.validated_data.get('group')
        if user.role != 'super_admin' and group.branch != user.branch:
            raise PermissionDenied("You do not have permission to add prayer requests to a group in another branch.")

        serializer.save(created_by=user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Physical deletion is disabled. Use the /archive/ endpoint instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        req = self.get_object()
        if req.is_archived:
            return Response({"detail": "Prayer request is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        req.is_archived = True
        req.archived_at = timezone.now()
        req.archived_by = request.user
        req.save()
        return Response({"detail": "Prayer request successfully archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        req = self.get_object()
        if not req.is_archived:
            return Response({"detail": "Prayer request is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        req.is_archived = False
        req.archived_at = None
        req.archived_by = None
        req.save()
        return Response({"detail": "Prayer request successfully restored."}, status=status.HTTP_200_OK)


class StudyOutlineViewSet(viewsets.ModelViewSet):
    serializer_class = StudyOutlineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return StudyOutline.objects.none()

        # Study outlines are globally shared, but check if only active ones are queried by default
        queryset = StudyOutline.objects.all()
        show_inactive = self.request.query_params.get('show_inactive', 'false').lower() == 'true'
        if not show_inactive:
            queryset = queryset.filter(is_active=True)

        return queryset.order_by('-published_at')

    def perform_create(self, serializer):
        # Restrict creation to pastors and admins
        user = self.request.user
        if user.role not in ['super_admin', 'pastor', 'church_admin']:
            raise PermissionDenied("You do not have permission to create study outlines.")

        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.role not in ['super_admin', 'pastor', 'church_admin']:
            raise PermissionDenied("You do not have permission to update study outlines.")

        serializer.save(updated_by=user)
