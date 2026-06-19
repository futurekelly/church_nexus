from django.urls import path, include
from rest_framework.routers import DefaultRouter
from groups.views import (
    ConnectGroupViewSet,
    GroupMemberViewSet,
    GroupAttendanceViewSet,
    GroupPrayerRequestViewSet,
    StudyOutlineViewSet
)

router = DefaultRouter()
router.register(r'groups', ConnectGroupViewSet, basename='connectgroup')
router.register(r'group-members', GroupMemberViewSet, basename='groupmember')
router.register(r'group-attendance', GroupAttendanceViewSet, basename='groupattendance')
router.register(r'group-prayer-requests', GroupPrayerRequestViewSet, basename='groupprayerrequest')
router.register(r'study-outlines', StudyOutlineViewSet, basename='studyoutline')

urlpatterns = [
    path('', include(router.urls)),
]
