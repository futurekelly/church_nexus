"""
Health check views for Church Nexus backend.

Provides endpoints to verify the operational status of:
- Overall application health
- Database connectivity (PostgreSQL)
- Redis connectivity (Celery broker)
- Celery worker availability
"""

import time
from django.db import connection
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


def _check_database():
    """Verify PostgreSQL database connectivity."""
    try:
        start = time.monotonic()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        engine = connection.vendor
        db_name = connection.settings_dict.get('NAME', 'unknown')
        return {
            'status': 'healthy',
            'engine': engine,
            'database': db_name,
            'latency_ms': latency_ms,
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
        }


def _check_redis():
    """Verify Redis connectivity via Celery broker URL."""
    try:
        import redis as redis_lib
        from django.conf import settings

        broker_url = getattr(settings, 'CELERY_BROKER_URL', 'redis://localhost:6379/0')
        start = time.monotonic()
        r = redis_lib.Redis.from_url(broker_url, socket_connect_timeout=3)
        r.ping()
        latency_ms = round((time.monotonic() - start) * 1000, 2)
        info = r.info('server')
        return {
            'status': 'healthy',
            'redis_version': info.get('redis_version', 'unknown'),
            'latency_ms': latency_ms,
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
        }


def _check_celery():
    """Verify Celery worker availability."""
    try:
        from church_nexus.celery import app as celery_app

        start = time.monotonic()
        inspector = celery_app.control.inspect(timeout=3)
        active_workers = inspector.ping()
        latency_ms = round((time.monotonic() - start) * 1000, 2)

        if active_workers:
            worker_names = list(active_workers.keys())
            return {
                'status': 'healthy',
                'workers': worker_names,
                'worker_count': len(worker_names),
                'latency_ms': latency_ms,
            }
        else:
            return {
                'status': 'degraded',
                'message': 'No active Celery workers detected',
                'latency_ms': latency_ms,
            }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e),
        }


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Overall health check - aggregates all component statuses."""
    db = _check_database()
    redis_status = _check_redis()

    components = {
        'database': db,
        'redis': redis_status,
    }

    overall = 'healthy'
    for comp in components.values():
        if comp['status'] == 'unhealthy':
            overall = 'unhealthy'
            break
        elif comp['status'] == 'degraded':
            overall = 'degraded'

    status_code = 200 if overall == 'healthy' else 503

    return JsonResponse({
        'status': overall,
        'service': 'church-nexus-backend',
        'components': components,
    }, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_database(request):
    """Database health check endpoint."""
    result = _check_database()
    status_code = 200 if result['status'] == 'healthy' else 503
    return JsonResponse(result, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_redis(request):
    """Redis health check endpoint."""
    result = _check_redis()
    status_code = 200 if result['status'] == 'healthy' else 503
    return JsonResponse(result, status=status_code)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_celery(request):
    """Celery worker health check endpoint."""
    result = _check_celery()
    status_code = 200 if result['status'] == 'healthy' else 503
    return JsonResponse(result, status=status_code)
