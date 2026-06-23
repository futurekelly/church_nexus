from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorProfileViewSet, FollowUpTicketViewSet, ContactHistoryLogViewSet, FollowUpAnalyticsView

router = DefaultRouter()
router.register('visitors', VisitorProfileViewSet, basename='visitor')
router.register('tickets', FollowUpTicketViewSet, basename='ticket')
router.register('logs', ContactHistoryLogViewSet, basename='log')

urlpatterns = [
    path('analytics/', FollowUpAnalyticsView.as_view(), name='analytics'),
    path('', include(router.urls)),
]
