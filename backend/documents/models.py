import uuid
from django.db import models
from django.conf import settings

class DocumentTemplate(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='document_templates', db_index=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100) # statement, receipt, certificate, report
    document_type = models.CharField(max_length=100, db_index=True) # STATEMENT_MEMBER, etc.
    html_layout = models.TextField()
    stylesheet_tokens = models.JSONField(default=dict, blank=True)
    
    # Versioning
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    previous_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_versions')
    
    # Stats
    generated_count = models.IntegerField(default=0)
    download_count = models.IntegerField(default=0)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_templates')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - v{self.version} ({self.branch.branch_code})"


class GeneratedDocument(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='generated_documents', db_index=True)
    document_type = models.CharField(max_length=100, db_index=True)
    format = models.CharField(max_length=10) # PDF, CSV
    template_version = models.IntegerField(default=1)
    
    # Context sources
    source_type = models.CharField(max_length=100) # member, campaign, household, analytics
    source_id = models.CharField(max_length=100, db_index=True)
    
    file_url = models.CharField(max_length=500, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    
    # Expiration and Retention
    expires_at = models.DateTimeField(null=True, blank=True)
    retention_policy = models.CharField(max_length=30) # 7_DAYS, 30_DAYS, INDEFINITE
    
    # Performance & Integrity
    download_count = models.IntegerField(default=0)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)
    render_context_snapshot = models.JSONField(null=True, blank=True)
    sha256_hash = models.CharField(max_length=64, null=True, blank=True)
    
    is_archived = models.BooleanField(default=False, db_index=True)
    
    # Audit & Requests
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='requested_documents')
    requested_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    filter_metadata = models.JSONField(null=True, blank=True)

    class Meta:
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.document_type} - {self.status} ({self.id})"


class DownloadToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    document = models.ForeignKey(GeneratedDocument, on_delete=models.CASCADE, related_name='download_tokens')
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        from django.utils import timezone
        return self.used_at is None and self.expires_at > timezone.now()

    def __str__(self):
        return f"Token for {self.document.id} (Expires: {self.expires_at})"


class DocumentAuditLog(models.Model):
    ACTION_CHOICES = (
        ('GENERATE', 'Generate'),
        ('DOWNLOAD', 'Download'),
        ('CANCEL', 'Cancel'),
        ('REVOKE', 'Revoke'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='document_audits')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    document = models.ForeignKey(GeneratedDocument, on_delete=models.CASCADE, related_name='audits')
    ip_address = models.CharField(max_length=50)
    details = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.user.email} - {self.action} on {self.document.id}"
