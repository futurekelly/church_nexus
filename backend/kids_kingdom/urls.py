from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClassroomViewSet, ChildViewSet, CheckInLogViewSet

router = DefaultRouter()
router.register('classrooms', ClassroomViewSet, basename='classroom')
router.register('children', ChildViewSet, basename='child')
router.register('check-ins', CheckInLogViewSet, basename='check-in')

urlpatterns = [
    path('', include(router.urls)),
]
