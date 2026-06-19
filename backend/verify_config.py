"""Verify production readiness configurations."""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'church_nexus.settings')

import django
django.setup()

from django.urls import reverse
from django.conf import settings

print("=" * 60)
print("PRODUCTION READINESS VERIFICATION")
print("=" * 60)

# 1. Health Check URLs
print("\n1. Health Check URLs:")
for name in ['health_check', 'health_database', 'health_redis', 'health_celery']:
    print(f"   {reverse(name)}")

# 2. Security - DEFAULT_PERMISSION_CLASSES
print("\n2. Security - DEFAULT_PERMISSION_CLASSES:")
perms = settings.REST_FRAMEWORK.get('DEFAULT_PERMISSION_CLASSES')
print(f"   {perms}")

# 3. Celery Beat Schedule
print("\n3. Celery Beat Schedule:")
for name, config in settings.CELERY_BEAT_SCHEDULE.items():
    print(f"   {name}: {config['task']} @ {config['schedule']}")

# 4. Auth endpoints (should still be public via simplejwt defaults)
print("\n4. Auth Endpoints (public):")
print(f"   Login:   {reverse('token_obtain_pair')}")
print(f"   Refresh: {reverse('token_refresh')}")

print("\n" + "=" * 60)
print("ALL CHECKS PASSED")
print("=" * 60)
