import uuid
from rest_framework import viewsets, permissions, filters, response, status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from django.conf import settings
from .models import Sermon, SermonSeries
from .serializers import (
    SermonSerializer, SermonListSerializer, SermonSeriesSerializer
)
from .filters import SermonFilter, SermonSeriesFilter
from .storage_manager import StorageManager
from .media_metadata import MediaMetadataService
from .tasks import process_sermon_media


class SermonPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 50


class SermonAccessPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.role == 'super_admin':
            return True

        allowed_roles = [
            'super_admin', 'church_admin', 'pastor', 'media_team'
        ]
        return request.user.role in allowed_roles


class SermonSeriesViewSet(viewsets.ModelViewSet):
    serializer_class = SermonSeriesSerializer
    permission_classes = [SermonAccessPermission]
    pagination_class = SermonPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SermonSeriesFilter
    ordering_fields = ['start_date', 'title', 'created_at']
    ordering = ['-start_date', '-created_at']

    def get_queryset(self):
        user = self.request.user
        queryset = SermonSeries.objects.all().select_related('branch')

        is_manager = False
        if user and user.is_authenticated:
            allowed_roles = [
                'super_admin', 'church_admin', 'pastor', 'media_team'
            ]
            if user.role in allowed_roles:
                is_manager = True

        if not is_manager:
            queryset = queryset.filter(is_active=True)

        if user and user.is_authenticated and user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
        elif not user or not user.is_authenticated:
            branch_id = self.request.query_params.get('branch')
            if branch_id:
                queryset = queryset.filter(branch_id=branch_id)
            elif self.action == 'list':
                return SermonSeries.objects.none()

        return queryset


class SermonViewSet(viewsets.ModelViewSet):
    serializer_class = SermonSerializer
    permission_classes = [SermonAccessPermission]
    pagination_class = SermonPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = SermonFilter
    ordering_fields = [
        'sermon_date', 'title', 'views_count', 'featured', 'created_at'
    ]
    ordering = ['-sermon_date', '-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return SermonListSerializer
        return SermonSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Sermon.objects.all().select_related('series', 'branch')

        is_manager = False
        if user and user.is_authenticated:
            allowed_roles = [
                'super_admin', 'church_admin', 'pastor', 'media_team'
            ]
            if user.role in allowed_roles:
                is_manager = True

        if not is_manager:
            queryset = queryset.filter(status='Published')

        if user and user.is_authenticated and user.role != 'super_admin':
            if user.branch:
                queryset = queryset.filter(branch=user.branch)
        elif not user or not user.is_authenticated:
            branch_id = self.request.query_params.get('branch')
            if branch_id:
                queryset = queryset.filter(branch_id=branch_id)
            elif self.action == 'list':
                return Sermon.objects.none()

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Sermon.objects.filter(pk=instance.pk).update(
            views_count=models.F('views_count') + 1
        )
        instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return response.Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(created_by=user)


class UploadIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        allowed_roles = ['super_admin', 'church_admin', 'pastor', 'media_team']
        if user.role not in allowed_roles:
            return response.Response(
                {"detail": "Permission denied for media uploads."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Handle local multipart file upload fallback
        if 'file' in request.FILES and 'storage_key' in request.data:
            uploaded_file = request.FILES['file']
            storage_key = request.data.get('storage_key')
            try:
                saved_path = StorageManager.save_file(storage_key, uploaded_file)
                return response.Response({
                    "status": "success",
                    "storage_key": saved_path
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                return response.Response(
                    {"detail": f"Failed to save file locally: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        filename = request.data.get('filename')
        file_size = request.data.get('file_size')
        asset_type = request.data.get('asset_type', 'video')

        if not filename or file_size is None:
            return response.Response(
                {"detail": "filename and file_size are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            file_size = int(file_size)
        except ValueError:
            return response.Response(
                {"detail": "file_size must be an integer."},
                status=status.HTTP_400_BAD_REQUEST
            )

        limits = {'thumbnail': 5, 'audio': 50, 'video': 250}
        max_mb = limits.get(asset_type, 250)
        if file_size > max_mb * 1024 * 1024:
            return response.Response(
                {"detail": f"File size exceeds maximum {max_mb}MB limit."},
                status=status.HTTP_400_BAD_REQUEST
            )

        branch_id = user.branch.id if user.branch else request.data.get(
            'branch'
        )
        if not branch_id and user.role != 'super_admin':
            return response.Response(
                {"detail": "User branch is required for upload scoping."},
                status=status.HTTP_400_BAD_REQUEST
            )

        upload_id = f"u_{uuid.uuid4().hex[:12]}"
        storage_key = StorageManager.generate_storage_path(
            branch_id, filename, subfolder=asset_type
        )
        upload_url = StorageManager.get_file_url(storage_key)

        return response.Response({
            "upload_id": upload_id,
            "storage_key": storage_key,
            "upload_url": upload_url,
            "expires_in": 900,
            "direct_upload": getattr(settings, 'USE_CLOUD_STORAGE', False)
        }, status=status.HTTP_200_OK)


class UploadCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        allowed_roles = ['super_admin', 'church_admin', 'pastor', 'media_team']
        if user.role not in allowed_roles:
            return response.Response(
                {"detail": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        storage_key = request.data.get('storage_key')
        sermon_id = request.data.get('sermon_id')
        asset_type = request.data.get('asset_type', 'video')

        if not storage_key:
            return response.Response(
                {"detail": "storage_key is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.role != 'super_admin' and user.branch:
            if str(user.branch.id) not in storage_key:
                return response.Response(
                    {"detail": "Cross-tenant asset completion prohibited."},
                    status=status.HTTP_403_FORBIDDEN
                )

        exists = StorageManager.exists(storage_key)
        metadata = MediaMetadataService.extract_metadata(storage_key)

        if sermon_id:
            try:
                sermon = Sermon.objects.get(pk=sermon_id)
                if user.role != 'super_admin' and sermon.branch != user.branch:
                    return response.Response(
                        {"detail": "Cross-tenant sermon modification denied."},
                        status=status.HTTP_403_FORBIDDEN
                    )

                if asset_type == 'thumbnail':
                    sermon.thumbnail.name = storage_key
                elif asset_type == 'audio':
                    sermon.audio_file.name = storage_key
                else:
                    sermon.video_file.name = storage_key

                sermon._disable_processing = True
                sermon.save()

                import threading
                thread = threading.Thread(target=process_sermon_media, args=(sermon.id,))
                thread.daemon = True
                thread.start()

                serializer = SermonSerializer(sermon)
                return response.Response(
                    serializer.data, status=status.HTTP_200_OK
                )
            except Sermon.DoesNotExist:
                return response.Response(
                    {"detail": "Sermon not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

        return response.Response({
            "status": "verified",
            "storage_key": storage_key,
            "exists": exists,
            "metadata": metadata
        }, status=status.HTTP_200_OK)


class SermonPodcastFeedView(APIView):
    """
    Public RSS 2.0 iTunes-compliant podcast XML feed endpoint.
    Distributes published sermon audio broadcasts.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        from django.http import HttpResponse
        from xml.sax.saxutils import escape

        sermons = Sermon.objects.filter(
            status='Published'
        ).order_by('-sermon_date')

        xml_items = []
        for s in sermons:
            audio_url = s.audio_url if hasattr(s, 'audio_url') else ""
            if not audio_url and s.audio_file:
                audio_url = StorageManager.get_file_url(s.audio_file.name)
            if not audio_url:
                continue

            pub_date = s.sermon_date.strftime("%a, %d %b %Y 00:00:00 GMT")
            title = escape(s.title)
            desc = escape(s.description or s.title)
            speaker = escape(s.speaker or "Church Nexus")

            item_xml = f"""    <item>
      <title>{title}</title>
      <description>{desc}</description>
      <pubDate>{pub_date}</pubDate>
      <guid isPermaLink="false">{s.id}</guid>
      <enclosure url="{audio_url}" length="1048576" type="audio/mpeg" />
      <itunes:author>{speaker}</itunes:author>
      <itunes:duration>30:00</itunes:duration>
    </item>"""
            xml_items.append(item_xml)

        items_str = "\n".join(xml_items)
        base_url = request.build_absolute_uri('/')
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>Church Nexus Sermons Podcast</title>
    <link>{base_url}</link>
    <description>Weekly sermon messages and broadcasts.</description>
    <language>en-us</language>
    <itunes:author>Church Nexus Ministry</itunes:author>
    <itunes:category text="Religion &amp; Spirituality" />
{items_str}
  </channel>
</rss>"""

        return HttpResponse(xml_content, content_type="application/xml")
