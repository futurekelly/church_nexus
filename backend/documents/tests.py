import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from decimal import Decimal
import os
from django.conf import settings

from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory
from donations.models import Donation
from documents.models import DocumentTemplate, GeneratedDocument, DocumentAuditLog
from documents.tasks import generate_document_task

@pytest.mark.django_db
class TestDocumentsAPI:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.branch = BranchFactory(id="br-doc", branch_name="Branch Documents", branch_code="BRDOC")
        
        # Users
        self.super_admin = UserFactory(email="super_admin@test.com", role="super_admin", branch=None)
        self.member_user = UserFactory(email="member@test.com", role="member", branch=self.branch)
        self.treasurer_user = UserFactory(email="treasurer@test.com", role="treasurer", branch=self.branch)
        
        # Core Member profile
        self.member_profile = MemberFactory(branch=self.branch)
        
        # Seed simple completed donation for statement compilation
        Donation.objects.create(
            branch=self.branch,
            member=self.member_profile,
            amount=Decimal('500.00'),
            currency='USD',
            payment_method='Bank Transfer',
            date=timezone.now(),
            status='COMPLETED'
        )

        # Initial Document Template
        self.template = DocumentTemplate.objects.create(
            branch=self.branch,
            name="Member Giving Statement",
            category="statement",
            document_type="STATEMENT_MEMBER",
            html_layout="<div class='title'>Statement</div><p>Member: {{ member_name }} ({{ member_number }})</p><div class='total-box'>Total: {{ total_giving }} USD</div>",
            stylesheet_tokens={'primary_color': '#FF0000'}
        )

    def test_template_versioning(self):
        self.client.force_authenticate(user=self.super_admin)
        url = reverse('documenttemplate-detail', args=[self.template.id])
        
        payload = {
            'html_layout': "<div class='title'>Updated Layout</div><p>Total: {{ total_giving }}</p>",
            'stylesheet_tokens': {'primary_color': '#0000FF'}
        }
        
        # Update template layout -> should trigger version increment
        response = self.client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_200_OK or response.status_code == status.HTTP_204_NO_CONTENT
        
        # Verify old version is now inactive
        self.template.refresh_from_db()
        assert not self.template.is_active
        
        # Verify new version exists and has version 2
        new_version = DocumentTemplate.objects.get(
            branch=self.branch,
            document_type=self.template.document_type,
            is_active=True
        )
        assert new_version.version == 2
        assert new_version.previous_version == self.template
        assert new_version.html_layout == payload['html_layout']

    def test_template_editing_role_restriction(self):
        # Members are blocked from editing template layouts
        self.client.force_authenticate(user=self.member_user)
        url = reverse('documenttemplate-detail', args=[self.template.id])
        
        payload = {
            'html_layout': "Unpermitted update text"
        }
        response = self.client.patch(url, payload, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_async_generation_and_integrity_verification(self):
        self.client.force_authenticate(user=self.treasurer_user)
        url = reverse('generateddocument-request-document')
        
        payload = {
            'branch_id': str(self.branch.id),
            'document_type': 'STATEMENT_MEMBER',
            'format': 'PDF',
            'source_type': 'member',
            'source_id': str(self.member_profile.id),
            'retention_policy': '7_DAYS'
        }
        
        # 1. Request document generation -> Status: PENDING
        response = self.client.post(url, payload, format='json')
        assert response.status_code == status.HTTP_201_CREATED
        doc_id = response.json()['data']['id']
        assert response.json()['data']['status'] == 'PENDING'
        
        # 2. Execute Celery compilation task synchronously
        generate_document_task(doc_id)
        
        # 3. Verify document updates
        doc = GeneratedDocument.objects.get(id=doc_id)
        assert doc.status == 'COMPLETED'
        assert doc.file_url is not None
        assert doc.sha256_hash is not None
        assert len(doc.sha256_hash) == 64 # SHA-256 standard hex length
        assert doc.render_context_snapshot is not None
        assert doc.render_context_snapshot['total_giving'] == '500.00'
        assert doc.render_context_snapshot['member_name'] == f"{self.member_profile.first_name} {self.member_profile.last_name}"

    def test_document_immutability(self):
        self.client.force_authenticate(user=self.treasurer_user)
        
        # Create completed document
        doc = GeneratedDocument.objects.create(
            branch=self.branch,
            document_type='STATEMENT_MEMBER',
            format='PDF',
            template_version=1,
            source_type='member',
            source_id=str(self.member_profile.id),
            status='COMPLETED',
            requested_by=self.treasurer_user
        )
        
        url = reverse('generateddocument-detail', args=[doc.id])
        response = self.client.patch(url, {'status': 'FAILED'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Completed documents are immutable" in str(response.json()['errors'])

    def test_download_token_security(self):
        self.client.force_authenticate(user=self.treasurer_user)
        
        # Create completed document with a mock file to read
        doc = GeneratedDocument.objects.create(
            branch=self.branch,
            document_type='STATEMENT_MEMBER',
            format='PDF',
            template_version=1,
            source_type='member',
            source_id=str(self.member_profile.id),
            status='COMPLETED',
            file_url='/media/generated_documents/mock.pdf',
            requested_by=self.treasurer_user
        )
        
        # Write dummy file to disk
        os.makedirs(os.path.join(settings.MEDIA_ROOT, 'generated_documents'), exist_ok=True)
        file_path = os.path.join(settings.MEDIA_ROOT, 'generated_documents', f'{doc.id}.pdf')
        with open(file_path, 'wb') as f:
            f.write(b"Mock PDF content")

        # 1. Request Download Token
        token_url = reverse('generateddocument-generate-download-token', args=[doc.id])
        token_response = self.client.post(token_url, {}, format='json')
        assert token_response.status_code == status.HTTP_200_OK
        token_str = token_response.json()['token']
        
        # 2. Download file using token -> Succeeds
        download_url = reverse('secure-download') + f"?token={token_str}"
        download_response = self.client.get(download_url)
        assert download_response.status_code == status.HTTP_200_OK
        assert download_response.getvalue() == b"Mock PDF content"
        
        # 3. Attempt reuse of same token -> Fails (One-use only)
        reuse_response = self.client.get(download_url)
        assert reuse_response.status_code == status.HTTP_400_BAD_REQUEST
        assert "expired or has already been used" in reuse_response.json()['message']

        # 4. Verify audit trail populated
        audit = DocumentAuditLog.objects.filter(document=doc, action='DOWNLOAD').last()
        assert audit is not None
        assert audit.user == self.treasurer_user
        
        # Cleanup dummy file
        if os.path.exists(file_path):
            os.remove(file_path)
