"""
Security middleware for Church Nexus backend.

Provides:
- Content Security Policy (CSP) headers (SEC-07)
- Additional hardening headers beyond Django's built-ins
"""

from django.conf import settings


class ContentSecurityPolicyMiddleware:
    """
    Adds Content-Security-Policy and related security headers to every response.

    In DEBUG mode a report-only policy is applied so developers can iterate
    without breaking the UI. In production the enforcing policy is used.
    """

    # Tight enforcing policy for production
    CSP_PRODUCTION = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob:; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "upgrade-insecure-requests;"
    )

    # Permissive report-only policy for development
    CSP_DEVELOPMENT = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: blob: http: https:; "
        "connect-src 'self' ws: wss: http: https:; "
        "frame-ancestors 'none';"
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        self._apply_security_headers(response)
        return response

    def _apply_security_headers(self, response):
        """Attach security headers that aren't covered by Django's SecurityMiddleware."""
        if settings.DEBUG:
            # Report-only in development — won't break the app
            response["Content-Security-Policy-Report-Only"] = self.CSP_DEVELOPMENT
        else:
            response["Content-Security-Policy"] = self.CSP_PRODUCTION

        # Prevent MIME-type sniffing (also set by Django but included for explicitness)
        response.setdefault("X-Content-Type-Options", "nosniff")

        # Referrer policy — limit information leakage
        response.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")

        # Restrict browser features
        response.setdefault(
            "Permissions-Policy",
            "geolocation=(), microphone=(), camera=(), payment=(), usb=()"
        )

        # Cross-Origin policies
        response.setdefault("Cross-Origin-Opener-Policy", "same-origin")
        response.setdefault("Cross-Origin-Resource-Policy", "same-origin")
