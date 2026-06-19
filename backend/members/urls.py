from django.urls import path, include
from rest_framework.routers import DefaultRouter
from members.views import (
    MemberViewSet,
    FamilyViewSet,
    FamilyRelationshipViewSet,
    MemberLifecycleTimelineViewSet
)

router = DefaultRouter()
router.register('members', MemberViewSet, basename='member')
router.register('families', FamilyViewSet, basename='family')
router.register('family-relationships', FamilyRelationshipViewSet, basename='familyrelationship')
router.register('lifecycle-timeline', MemberLifecycleTimelineViewSet, basename='memberlifecycletimeline')

urlpatterns = [
    path('', include(router.urls)),
]
