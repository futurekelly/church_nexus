from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from branches.models import Branch
from branches.serializers import BranchSerializer

class BranchViewSet(viewsets.ModelViewSet):
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action == 'list':
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if getattr(self, "swagger_fake_view", False):
            return Branch.objects.none()
        
        # Allow unregistered visitors to view active branches during signup
        if user.is_anonymous:
            return Branch.objects.filter(is_active=True)
            
        if user.role == 'super_admin':
            return Branch.objects.all()
        if user.branch:
            return Branch.objects.filter(id=user.branch.id)
        return Branch.objects.none()

