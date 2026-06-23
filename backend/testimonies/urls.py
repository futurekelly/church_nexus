from django.urls import path, include
from rest_framework.routers import DefaultRouter
from testimonies.views import TestimonyViewSet

router = DefaultRouter()
router.register(r'', TestimonyViewSet, basename='testimony')

urlpatterns = [
    path('', include(router.urls)),
]
