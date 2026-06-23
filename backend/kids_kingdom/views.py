from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Child, Classroom, CheckInLog
from .serializers import ChildSerializer, ClassroomSerializer, CheckInLogSerializer
from members.models import Member

class KidsKingdomPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admin bypasses all checks
        if request.user.role == 'super_admin':
            return True
            
        # Staff manager roles allowed
        allowed_roles = ['super_admin', 'church_admin', 'pastor']
        return request.user.role in allowed_roles


class ClassroomViewSet(viewsets.ModelViewSet):
    serializer_class = ClassroomSerializer
    permission_classes = [KidsKingdomPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = Classroom.objects.all()
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                queryset = Classroom.objects.none()
        return queryset


class ChildViewSet(viewsets.ModelViewSet):
    serializer_class = ChildSerializer
    permission_classes = [KidsKingdomPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = Child.objects.all().prefetch_related('parents')
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                queryset = Child.objects.none()
        
        # Query filter by parent id
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            queryset = queryset.filter(parents__id=parent_id)
            
        return queryset


class CheckInLogViewSet(viewsets.ModelViewSet):
    serializer_class = CheckInLogSerializer
    permission_classes = [KidsKingdomPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = CheckInLog.objects.all().select_related('child', 'classroom', 'checked_in_by', 'checked_out_by')
        if user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
            else:
                queryset = CheckInLog.objects.none()
                
        # Filters
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(check_in_time__date=date_param)
        else:
            # Default to today's logs for quick dashboard scanning if filter is not specified
            today = timezone.localdate()
            queryset = queryset.filter(check_in_time__date=today)
            
        return queryset

    @action(detail=False, methods=['post'], url_path='check-in')
    def check_in(self, request):
        user = request.user
        child_id = request.data.get('child_id')
        checked_in_by_id = request.data.get('checked_in_by_id')
        classroom_id = request.data.get('classroom_id')

        if not child_id or not checked_in_by_id:
            return Response(
                {"error": "Both child_id and checked_in_by_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get branch scoping
        branch = user.branch if user.role != 'super_admin' else None

        with transaction.atomic():
            # Find Child
            if branch:
                child = get_object_or_404(Child, id=child_id, branch=branch)
                checked_in_by = get_object_or_404(Member, id=checked_in_by_id, branch=branch)
            else:
                child = get_object_or_404(Child, id=child_id)
                checked_in_by = get_object_or_404(Member, id=checked_in_by_id)
                branch = child.branch # Super admin takes branch from child

            # Verify child is not already checked in
            already_checked_in = CheckInLog.objects.filter(
                child=child,
                status='Checked In'
            ).exists()
            if already_checked_in:
                return Response(
                    {"error": f"{child.first_name} is already checked in."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Determine Classroom
            classroom = None
            if classroom_id:
                if user.role != 'super_admin':
                    classroom = get_object_or_404(Classroom, id=classroom_id, branch=branch)
                else:
                    classroom = get_object_or_404(Classroom, id=classroom_id)
            else:
                # Auto classroom allocation based on age bands
                age = child.age
                classrooms = Classroom.objects.filter(branch=branch, min_age__lte=age, max_age__gte=age)
                if classrooms.exists():
                    classroom = classrooms.first()
                else:
                    return Response(
                        {"error": f"No classroom matching child's age ({age} years) exists in this branch. Please create a suitable classroom first."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Create CheckInLog
            log = CheckInLog.objects.create(
                branch=branch,
                child=child,
                classroom=classroom,
                checked_in_by=checked_in_by,
                status='Checked In'
            )

            serializer = self.get_serializer(log)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='check-out')
    def check_out(self, request, pk=None):
        user = request.user
        security_code = request.data.get('security_code')
        checked_out_by_id = request.data.get('checked_out_by_id')

        if not security_code or not checked_out_by_id:
            return Response(
                {"error": "Both security_code and checked_out_by_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get branch scoping
        branch = user.branch if user.role != 'super_admin' else None

        with transaction.atomic():
            # Get CheckInLog
            if branch:
                log = get_object_or_404(CheckInLog, id=pk, branch=branch, status='Checked In')
                checked_out_by = get_object_or_404(Member, id=checked_out_by_id, branch=branch)
            else:
                log = get_object_or_404(CheckInLog, id=pk, status='Checked In')
                checked_out_by = get_object_or_404(Member, id=checked_out_by_id)

            # Verify security code matches
            if log.security_code.strip().upper() != security_code.strip().upper():
                return Response(
                    {"error": "Invalid security code. Child release is unauthorized."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Perform check-out
            log.status = 'Checked Out'
            log.check_out_time = timezone.now()
            log.checked_out_by = checked_out_by
            log.save()

            serializer = self.get_serializer(log)
            return Response(serializer.data, status=status.HTTP_200_OK)
