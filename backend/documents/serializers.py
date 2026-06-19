from rest_framework import serializers
from documents.models import DocumentTemplate, GeneratedDocument, DocumentAuditLog

class DocumentTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentTemplate
        fields = [
            'id', 'branch', 'name', 'category', 'document_type', 
            'html_layout', 'stylesheet_tokens', 'version', 'is_active', 
            'previous_version', 'generated_count', 'download_count', 
            'last_downloaded_at', 'created_at', 'updated_at'
        ]
        read_only_fields = (
            'id', 'version', 'previous_version', 'generated_count', 
            'download_count', 'last_downloaded_at', 'created_at', 'updated_at'
        )

    def validate(self, attrs):
        # Prevent manual changes to version
        return attrs


class GeneratedDocumentSerializer(serializers.ModelSerializer):
    requested_by_email = serializers.EmailField(source='requested_by.email', read_only=True)

    class Meta:
        model = GeneratedDocument
        fields = [
            'id', 'branch', 'document_type', 'format', 'template_version',
            'source_type', 'source_id', 'file_url', 'status', 'expires_at',
            'retention_policy', 'download_count', 'last_downloaded_at',
            'render_context_snapshot', 'sha256_hash', 'is_archived',
            'requested_by', 'requested_by_email', 'requested_at', 
            'completed_at', 'filter_metadata'
        ]
        read_only_fields = (
            'id', 'template_version', 'file_url', 'status', 'expires_at',
            'download_count', 'last_downloaded_at', 'render_context_snapshot',
            'sha256_hash', 'requested_by', 'requested_at', 'completed_at'
        )

    def validate(self, attrs):
        if self.instance and self.instance.status == 'COMPLETED':
            raise serializers.ValidationError("Completed documents are immutable and cannot be modified.")
        return attrs


class DocumentAuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = DocumentAuditLog
        fields = ['id', 'user', 'user_email', 'action', 'document', 'ip_address', 'details', 'timestamp']
        read_only_fields = ['id', 'timestamp']
