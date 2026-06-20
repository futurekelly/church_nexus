from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.decorators import action


from authentication.serializers import UserSerializer, RegisterSerializer

from rest_framework.throttling import SimpleRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.utils import timezone


class LoginBurstThrottle(SimpleRateThrottle):
    scope = 'login_burst'

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }

class CookieTokenObtainPairView(TokenObtainPairView):
    throttle_classes = [LoginBurstThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            refresh_token = response.data.get('refresh')
            if refresh_token:
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite='Strict',
                    path='/api/auth/',
                    max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
                )
                del response.data['refresh']
        return response

class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token and 'refresh' not in request.data:
            if hasattr(request.data, '_mutable'):
                request.data._mutable = True
            request.data['refresh'] = refresh_token

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            new_refresh = response.data.get('refresh')
            if new_refresh:
                response.set_cookie(
                    key='refresh_token',
                    value=new_refresh,
                    httponly=True,
                    secure=not settings.DEBUG,
                    samesite='Strict',
                    path='/api/auth/',
                    max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
                )
                del response.data['refresh']
        return response

class LogoutSerializer(serializers.Serializer):
    pass

class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        request=LogoutSerializer,
        responses={
            205: OpenApiResponse(description="Successfully logged out and token blacklisted."),
            400: OpenApiResponse(description="Refresh token is missing or invalid.")
        },
        description="Blacklists the refresh token stored in cookie, logging the user out."
    )
    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token') or request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            response = Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
            response.delete_cookie('refresh_token', path='/api/auth/')
            return response
        except TokenError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "An error occurred during logout."}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    @extend_schema(
        responses={
            200: UserSerializer,
        },
        description="Returns the authenticated user's profile information, including their role and branch."
    )
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class RegisterView(APIView):
    permission_classes = (AllowAny,)

    @extend_schema(
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description="User registered successfully. Session cookies set."),
            400: OpenApiResponse(description="Validation error.")
        },
        description="Registers a new user as a Visitor under the selected branch and automatically signs them in."
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            response_data = {
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }
            response = Response(response_data, status=status.HTTP_201_CREATED)
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Strict',
                path='/api/auth/',
                max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Notifications & Announcements ViewSets
# ---------------------------------------------------------------------------
from django.db import models
from authentication.serializers import NotificationSerializer, AnnouncementSerializer
from authentication.models import Notification, Announcement
from rest_framework import viewsets

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(self, "swagger_fake_view", False) or user.is_anonymous:
            return Notification.objects.none()
        return Notification.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        notifications = self.get_queryset().filter(read=False)
        notifications.update(read=True, read_at=timezone.now())
        return Response({"success": True, "message": "All notifications marked as read."})


class AnnouncementViewSet(viewsets.ModelViewSet):
    serializer_class = AnnouncementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(self, "swagger_fake_view", False) or user.is_anonymous:
            return Announcement.objects.none()
        
        # Super admin sees all announcements
        if user.role == 'super_admin':
            return Announcement.objects.all().order_by('-created_at')

        # Filter by branch (Global or user's specific branch)
        qs = Announcement.objects.filter(
            models.Q(branch__isnull=True) | models.Q(branch=user.branch)
        )
        
        # Filter by status: normal users can only see Published announcements
        if user.role not in ['church_admin', 'pastor', 'super_admin']:
            qs = qs.filter(status='Published')
            
        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['super_admin', 'church_admin', 'pastor']:
            raise serializers.ValidationError("You do not have permission to create announcements.")
        
        branch = user.branch if user.role != 'super_admin' else serializer.validated_data.get('branch')
        serializer.save(created_by=user, branch=branch)


# ---------------------------------------------------------------------------
# Password Reset ViewSets
# ---------------------------------------------------------------------------
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.password_validation import validate_password
from authentication.models import User

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetRequestSerializer,
        responses={200: OpenApiResponse(description="If email exists, a password reset link has been sent.")},
        description="Requests a password reset link for the given email address."
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Formulate local/prod reset link
            reset_url = f"http://localhost:3000/password-reset/confirm/?uid={uid}&token={token}"
            
            # Send the email
            send_mail(
                subject="Reset your Church Nexus password",
                message=f"Hello,\n\nPlease use the link below to reset your password:\n\n{reset_url}\n\nThis link is valid for 24 hours.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            # Prevent email enumeration by returning 200 OK regardless
            pass
            
        return Response({"detail": "If the email is registered, a password reset link has been sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=PasswordResetConfirmSerializer,
        responses={
            200: OpenApiResponse(description="Password has been reset successfully."),
            400: OpenApiResponse(description="Invalid token, expired token, or invalid user ID.")
        },
        description="Resets the password if the token and uid are valid."
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        uid = serializer.validated_data['uid']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            uid_decoded = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=uid_decoded)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid user identification."}, status=status.HTTP_400_BAD_REQUEST)
            
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)

