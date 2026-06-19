from rest_framework import viewsets, status, decorators, permissions
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.http import FileResponse, Http404
import os
from django.conf import settings

from documents.models import DocumentTemplate, GeneratedDocument, DownloadToken, DocumentAuditLog
from documents.serializers import DocumentTemplateSerializer, GeneratedDocumentSerializer, DocumentAuditLogSerializer
from documents.tasks import generate_document_task

class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission restriction: writing templates restricted to Super Admin or Church Admin.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ['super_admin', 'church_admin']


class DocumentTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentTemplateSerializer
    queryset = DocumentTemplate.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSuperAdmin]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'super_admin':
            return qs
        return qs.filter(branch=user.branch)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        original = self.get_object()
        with transaction.atomic():
            # Mark the current version as inactive
            original.is_active = False
            original.save()
            
            # Create a new version row to preserve history
            new_template = DocumentTemplate.objects.create(
                branch=original.branch,
                name=serializer.validated_data.get('name', original.name),
                category=serializer.validated_data.get('category', original.category),
                document_type=original.document_type,
                html_layout=serializer.validated_data.get('html_layout', original.html_layout),
                stylesheet_tokens=serializer.validated_data.get('stylesheet_tokens', original.stylesheet_tokens),
                version=original.version + 1,
                is_active=True,
                previous_version=original,
                created_by=self.request.user
            )
            
            # Audit log
            DocumentAuditLog.objects.create(
                user=self.request.user,
                action='GENERATE',
                document=GeneratedDocument.objects.filter(document_type=original.document_type).first() or GeneratedDocument.objects.create(
                    branch=original.branch,
                    document_type=original.document_type,
                    format='PDF',
                    source_type='template',
                    source_id=str(original.id),
                    requested_by=self.request.user,
                    status='COMPLETED'
                ),
                ip_address=self.request.META.get('REMOTE_ADDR', '127.0.0.1'),
                details=f"Template {original.name} updated to version {new_template.version}"
            )


class GeneratedDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = GeneratedDocumentSerializer
    queryset = GeneratedDocument.objects.filter(is_archived=False)

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        
        # Scoping by branch
        if user.role != 'super_admin':
            qs = qs.filter(branch=user.branch)

        # Role-based visibility
        if user.role == 'Member':
            # Members can only view documents they requested or relate to them
            qs = qs.filter(requested_by=user)
        elif user.role == 'Treasurer':
            # Treasurers can only view financial statements/receipts
            qs = qs.filter(document_type__in=['STATEMENT_MEMBER', 'REPORT_FINANCE', 'STATEMENT_HOUSEHOLD'])

        return qs

    @decorators.action(detail=False, methods=['post'], url_path='request')
    def request_document(self, request):
        """
        Action to request a document and trigger async Celery generation.
        """
        user = request.user
        branch_id = request.data.get('branch_id') or (str(user.branch.id) if user.branch else None)
        doc_type = request.data.get('document_type')
        fmt = request.data.get('format', 'PDF')
        src_type = request.data.get('source_type')
        src_id = request.data.get('source_id')
        ret_policy = request.data.get('retention_policy', '7_DAYS')
        meta = request.data.get('filter_metadata', {})

        if not branch_id or not doc_type or not src_type or not src_id:
            return Response(
                {"success": False, "message": "Missing required fields."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Enforce period retention policies dates
        expires_at = None
        if ret_policy == '7_DAYS':
            expires_at = timezone.now() + timezone.timedelta(days=7)
        elif ret_policy == '30_DAYS':
            expires_at = timezone.now() + timezone.timedelta(days=30)

        # 2. Check for active templates
        template = DocumentTemplate.objects.filter(
            branch_id=branch_id,
            document_type=doc_type,
            is_active=True
        ).first()
        tpl_ver = template.version if template else 1

        # 3. Create document request
        doc = GeneratedDocument.objects.create(
            branch_id=branch_id,
            document_type=doc_type,
            format=fmt,
            template_version=tpl_ver,
            source_type=src_type,
            source_id=src_id,
            status='PENDING',
            expires_at=expires_at,
            retention_policy=ret_policy,
            requested_by=user,
            filter_metadata=meta
        )

        # 4. Trigger Celery Task
        generate_document_task.delay(doc.id)

        # Audit log creation request
        DocumentAuditLog.objects.create(
            user=user,
            action='GENERATE',
            document=doc,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details=f"Requested document type {doc_type} generation (ID: {doc.id})"
        )

        serializer = self.get_serializer(doc)
        return Response({
            "success": True,
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    @decorators.action(detail=True, methods=['post'], url_path='token')
    def generate_download_token(self, request, pk=None):
        """
        Creates a one-use download token valid for 5 minutes.
        """
        doc = self.get_object()
        if doc.status != 'COMPLETED' or not doc.file_url:
            return Response(
                {"success": False, "message": "Document is not compiled and ready for download."},
                status=status.HTTP_400_BAD_REQUEST
            )

        token = DownloadToken.objects.create(
            document=doc,
            expires_at=timezone.now() + timezone.timedelta(minutes=5)
        )

        return Response({
            "success": True,
            "token": str(token.token),
            "expires_at": token.expires_at
        }, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=['post'], url_path='cancel')
    def cancel_document(self, request, pk=None):
        doc = self.get_object()
        if doc.status not in ['PENDING', 'PROCESSING']:
            return Response(
                {"success": False, "message": "Only pending or processing documents can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        doc.status = 'CANCELLED'
        doc.save()

        # Audit log
        DocumentAuditLog.objects.create(
            user=request.user,
            action='CANCEL',
            document=doc,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details="Cancelled document generation request"
        )

        return Response({"success": True, "message": "Document generation request cancelled."}, status=status.HTTP_200_OK)

    @decorators.action(detail=True, methods=['post'], url_path='revoke')
    def revoke_document(self, request, pk=None):
        doc = self.get_object()
        doc.is_archived = True
        doc.save()

        # Audit log
        DocumentAuditLog.objects.create(
            user=request.user,
            action='REVOKE',
            document=doc,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details="Revoked / archived generated document"
        )

        return Response({"success": True, "message": "Document revoked and archived."}, status=status.HTTP_200_OK)


class DownloadFileView(viewsets.ViewSet):
    """
    Separate view enforcing token validation for secure downloads.
    """
    permission_classes = [permissions.AllowAny] # Tokens are pre-authorized

    def retrieve_file(self, request):
        token_str = request.query_params.get('token')
        if not token_str:
            return Response({"success": False, "message": "Download token is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Validate token
        token = get_object_or_404(DownloadToken, token=token_str)
        if not token.is_valid():
            return Response({"success": False, "message": "Token is expired or has already been used."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Mark token as used
        token.used_at = timezone.now()
        token.save()

        # 3. Retrieve document and stream file
        doc = token.document
        file_path = os.path.join(settings.MEDIA_ROOT, 'generated_documents', f'{doc.id}.pdf')

        if not os.path.exists(file_path):
            raise Http404("Compiled document file does not exist on disk.")

        # 4. Increment download counts
        doc.download_count += 1
        doc.last_downloaded_at = timezone.now()
        doc.save()

        # Update templates stats
        template = DocumentTemplate.objects.filter(
            branch=doc.branch,
            document_type=doc.document_type,
            is_active=True
        ).first()
        if template:
            template.download_count += 1
            template.last_downloaded_at = timezone.now()
            template.save()

        # 5. Audit Log download action
        DocumentAuditLog.objects.create(
            user=doc.requested_by, # Audit belongs to requester
            action='DOWNLOAD',
            document=doc,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1'),
            details=f"Downloaded file {doc.file_url} using secure token"
        )

        # Stream file safely
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{doc.document_type}_{doc.id}.pdf"'
        return response
