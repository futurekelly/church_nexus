from django.urls import path, include
from rest_framework.routers import DefaultRouter
from branches.views import BranchViewSet, InquiryViewSet

router = DefaultRouter()
router.register('branches', BranchViewSet, basename='branch')
router.register('inquiries', InquiryViewSet, basename='inquiry')

urlpatterns = [
    path('', include(router.urls)),
]
