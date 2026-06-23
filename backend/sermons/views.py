from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db import models
from .models import Sermon
from .serializers import SermonSerializer

class SermonAccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        # Read operations are public (AllowAny)
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Write operations require authentication
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Super Admin bypasses all checks
        if request.user.role == 'super_admin':
            return True
            
        # Allowed write roles
        allowed_roles = ['super_admin', 'church_admin', 'pastor', 'media_team']
        return request.user.role in allowed_roles


class SermonViewSet(viewsets.ModelViewSet):
    serializer_class = SermonSerializer
    permission_classes = [SermonAccessPermission]

    def get_queryset(self):
        user = self.request.user
        queryset = Sermon.objects.all()
        
        # Check if staff manager
        is_manager = False
        if user and user.is_authenticated:
            allowed_roles = ['super_admin', 'church_admin', 'pastor', 'media_team']
            if user.role in allowed_roles:
                is_manager = True
                
        # If not manager, only show Published sermons
        if not is_manager:
            queryset = queryset.filter(status='Published')
            
        # Filter by branch if not super_admin and user is authenticated
        if user and user.is_authenticated and user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
        elif not user or not user.is_authenticated:
            # Anonymous users - filter by branch if query param provided
            branch_id = self.request.query_params.get('branch')
            if branch_id:
                queryset = queryset.filter(branch_id=branch_id)
                
        # Apply Query Filters
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category=category)
            
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all' and is_manager:
            queryset = queryset.filter(status=status_param)
            
        speaker = self.request.query_params.get('speaker')
        if speaker and speaker != 'all':
            queryset = queryset.filter(speaker__icontains=speaker)
            
        featured = self.request.query_params.get('featured')
        if featured:
            queryset = queryset.filter(featured=featured.lower() == 'true')
            
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(scripture_reference__icontains=search) |
                models.Q(speaker__icontains=search)
            )
            
        # Sorting parameters
        sort_key = self.request.query_params.get('sort_key', 'sermon_date')
        sort_dir = self.request.query_params.get('sort_dir', 'desc')
        if sort_key in ['sermon_date', 'title']:
            prefix = '-' if sort_dir == 'desc' else ''
            queryset = queryset.order_by(f"{prefix}{sort_key}")
            
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)
