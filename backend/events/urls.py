from django.urls import path, include
from rest_framework.routers import DefaultRouter
from events.views import (
    EventViewSet,
    EventRegistrationViewSet,
    EventCheckInViewSet,
    EventResourceViewSet,
    ResourceBookingViewSet
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'event-registrations', EventRegistrationViewSet, basename='eventregistration')
router.register(r'event-checkins', EventCheckInViewSet, basename='eventcheckin')
router.register(r'event-resources', EventResourceViewSet, basename='eventresource')
router.register(r'resource-bookings', ResourceBookingViewSet, basename='resourcebooking')

urlpatterns = [
    path('', include(router.urls)),
]
