"""
URL configuration for church_nexus project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from authentication.views import (
    LogoutView,
    ProfileView,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    RegisterView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    NotificationViewSet,
    AnnouncementViewSet,
)
from authentication.views_scripture import DailyScriptureView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from church_nexus.health import (
    health_check,
    health_database,
    health_redis,
    health_celery,
)

auth_router = DefaultRouter()
auth_router.register('notifications', NotificationViewSet, basename='notification')
auth_router.register('announcements', AnnouncementViewSet, basename='announcement')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Health Check Endpoints (public — AllowAny)
    path('api/health/', health_check, name='health_check'),
    path('api/health/database/', health_database, name='health_database'),
    path('api/health/redis/', health_redis, name='health_redis'),
    path('api/health/celery/', health_celery, name='health_celery'),
    
    # JWT Authentication Endpoints
    path('api/auth/login/', CookieTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/', LogoutView.as_view(), name='token_logout'),
    path('api/auth/profile/', ProfileView.as_view(), name='user_profile'),
    path('api/auth/register/', RegisterView.as_view(), name='token_register'),
    path('api/auth/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/sermons/scripture/daily/', DailyScriptureView.as_view(), name='daily_scripture'),
    
    # OpenAPI Schema & Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Domain APIs
    path('api/', include(auth_router.urls)),
    path('api/', include('branches.urls')),
    path('api/', include('members.urls')),
    path('api/', include('groups.urls')),
    path('api/', include('events.urls')),
    path('api/', include('finance.urls')),
    path('api/', include('documents.urls')),
    path('api/', include('donations.urls')),
    path('api/', include('analytics.urls')),
    path('api/testimonies/', include('testimonies.urls')),
    path('api/follow-up/', include('follow_up.urls')),
    path('api/sermons/', include('sermons.urls')),
    path('api/kids-kingdom/', include('kids_kingdom.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
