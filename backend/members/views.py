from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError  # noqa: F401
from django.db import models
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination

from members.models import Member, Family, FamilyRelationship, MemberLifecycleTimeline
from members.serializers import (
    MemberSerializer,
    FamilySerializer,
    FamilyRelationshipSerializer,
    MemberLifecycleTimelineSerializer
)

class StandardPageNumberPagination(PageNumberPagination):
    page_size = 20
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

class MemberViewSet(viewsets.ModelViewSet):
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPageNumberPagination

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return Member.objects.none()
        queryset = Member.objects.all()

        # Branch isolation enforcement
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                return Member.objects.none()

        # Handle show_archived filter (hidden by default)
        show_archived = self.request.query_params.get('show_archived', 'false').lower() == 'true'
        if not show_archived and self.action != 'restore':
            queryset = queryset.filter(is_archived=False)

        # Order queryset for consistent pagination
        queryset = queryset.order_by('-created_at')

        # Filters
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(email__icontains=search) |
                models.Q(phone_number__icontains=search) |
                models.Q(membership_number__icontains=search)
            )

        gender = self.request.query_params.get('gender')
        if gender and gender != 'all':
            queryset = queryset.filter(gender=gender)

        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            queryset = queryset.filter(status=status_param)

        role = self.request.query_params.get('role')
        if role and role != 'all':
            queryset = queryset.filter(member_type=role)

        return queryset

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

        # Log timeline
        member = serializer.instance
        MemberLifecycleTimeline.objects.create(
            member=member,
            previous_status='Visitor',
            new_status=member.status,
            changed_by=user,
            notes="Initial member registration"
        )

    def perform_update(self, serializer):
        user = self.request.user
        old_status = serializer.instance.status
        serializer.save(updated_by=user)
        new_status = serializer.instance.status

        if old_status != new_status:
            MemberLifecycleTimeline.objects.create(
                member=serializer.instance,
                previous_status=old_status,
                new_status=new_status,
                changed_by=user,
                notes=self.request.data.get('status_notes', 'Profile update status change')
            )

    def destroy(self, request, *args, **kwargs):
        return Response(
            {"detail": "Physical deletion is disabled. Use the /archive/ endpoint instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        member = self.get_object()
        if member.is_archived:
            return Response({"detail": "Member is already archived."}, status=status.HTTP_400_BAD_REQUEST)
        
        member.is_archived = True
        member.archived_at = timezone.now()
        member.archived_by = request.user
        member.save()
        return Response({"detail": "Member successfully archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        member = self.get_object()
        if not member.is_archived:
            return Response({"detail": "Member is not archived."}, status=status.HTTP_400_BAD_REQUEST)

        member.is_archived = False
        member.archived_at = None
        member.archived_by = None
        member.save()
        return Response({"detail": "Member successfully restored."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='relationships')
    def relationships(self, request, pk=None):
        member = self.get_object()
        serializer = self.get_serializer(member)
        return Response(serializer.data['relationships'], status=status.HTTP_200_OK)


class FamilyViewSet(viewsets.ModelViewSet):
    serializer_class = FamilySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return Family.objects.none()
        if user.role == 'super_admin':
            return Family.objects.all()
        if user.branch:
            return Family.objects.filter(branch=user.branch)
        return Family.objects.none()

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
        serializer.save(branch=branch, created_by=user)


class FamilyRelationshipViewSet(viewsets.ModelViewSet):
    serializer_class = FamilyRelationshipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return FamilyRelationship.objects.none()
        if user.role == 'super_admin':
            return FamilyRelationship.objects.all()
        if user.branch:
            return FamilyRelationship.objects.filter(
                models.Q(from_member__branch=user.branch) |
                models.Q(to_member__branch=user.branch)
            )
        return FamilyRelationship.objects.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MemberLifecycleTimelineViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = MemberLifecycleTimelineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous or getattr(self, "swagger_fake_view", False):
            return MemberLifecycleTimeline.objects.none()
        if user.role == 'super_admin':
            return MemberLifecycleTimeline.objects.all()
        if user.branch:
            return MemberLifecycleTimeline.objects.filter(member__branch=user.branch)
        return MemberLifecycleTimeline.objects.none()
