import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from branches.models import Branch  # noqa: F401
from members.models import Member, Family, FamilyRelationship, MemberLifecycleTimeline  # noqa: F401
from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory, FamilyFactory, FamilyRelationshipFactory, MemberLifecycleTimelineFactory  # noqa: F401

@pytest.mark.django_db
class TestMemberAPI:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.branch_a = BranchFactory(id="branch-a", branch_name="Branch A", branch_code="BRA01")
        self.branch_b = BranchFactory(id="branch-b", branch_name="Branch B", branch_code="BRB01")
        
        # Users
        self.super_admin = UserFactory(email="super@test.com", role="super_admin", branch=None)
        self.pastor_a = UserFactory(email="pastor_a@test.com", role="pastor", branch=self.branch_a)
        self.pastor_b = UserFactory(email="pastor_b@test.com", role="pastor", branch=self.branch_b)
        
        # Members
        self.member_a1 = MemberFactory(branch=self.branch_a, email="a1@test.com")
        self.member_a2 = MemberFactory(branch=self.branch_a, email="a2@test.com")
        self.member_b1 = MemberFactory(branch=self.branch_b, email="b1@test.com")

    def test_branch_isolation_pastor(self):
        # Pastor A must only see members of Branch A
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('member-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']['results']
        assert len(results) == 2
        for item in results:
            assert item['branch'] == self.branch_a.id

    def test_branch_isolation_super_admin(self):
        # Super Admin should see all members across all branches
        self.client.force_authenticate(user=self.super_admin)
        url = reverse('member-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']['results']
        assert len(results) == 3

    def test_membership_number_generation(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('member-list')
        
        # Create a new member
        current_year = timezone.now().year
        response = self.client.post(url, {
            'first_name': 'New',
            'last_name': 'Member',
            'gender': 'female',
            'email': 'newmember@test.com',
            'phone_number': '1234567890',
            'marital_status': 'Single',
            'status': 'Member',
            'join_date': timezone.now().date().isoformat()
        })
        
        assert response.status_code == status.HTTP_201_CREATED
        member_data = response.json()['data']
        assert member_data['membership_number'].startswith(f"MBR-{current_year}-")
        
        # Verify sequence is sequential (000001, 000002, etc.)
        seq_num = member_data['membership_number'].split('-')[-1]
        assert len(seq_num) == 6
        assert int(seq_num) > 0

    def test_soft_delete_archive_and_restore(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Soft delete (archive)
        archive_url = reverse('member-archive', args=[self.member_a1.id])
        response = self.client.post(archive_url)
        assert response.status_code == status.HTTP_200_OK
        
        self.member_a1.refresh_from_db()
        assert self.member_a1.is_archived is True
        assert self.member_a1.archived_at is not None
        assert self.member_a1.archived_by == self.pastor_a

        # Hard delete block (destroy endpoint)
        detail_url = reverse('member-detail', args=[self.member_a1.id])
        response = self.client.delete(detail_url)
        assert response.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # Restore
        restore_url = reverse('member-restore', args=[self.member_a1.id])
        response = self.client.post(restore_url)
        assert response.status_code == status.HTTP_200_OK
        
        self.member_a1.refresh_from_db()
        assert self.member_a1.is_archived is False
        assert self.member_a1.archived_at is None
        assert self.member_a1.archived_by is None

    def test_relationship_serialization_reciprocal(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Establish A1 -> Parent -> A2
        relationship = FamilyRelationshipFactory(  # noqa: F841
            from_member=self.member_a1,
            to_member=self.member_a2,
            relationship_type='Parent'
        )

        # Get A1 relationships (direct Parent link)
        rel_url = reverse('member-relationships', args=[self.member_a1.id])
        response = self.client.get(rel_url)
        assert response.status_code == status.HTTP_200_OK
        relationships = response.json()['data']
        assert len(relationships) == 1
        assert relationships[0]['relationship_type'] == 'Parent'
        assert relationships[0]['to_member_id'] == str(self.member_a2.id)

        # Get A2 relationships (reciprocal Child link)
        rel_url_2 = reverse('member-relationships', args=[self.member_a2.id])
        response_2 = self.client.get(rel_url_2)
        assert response_2.status_code == status.HTTP_200_OK
        relationships_2 = response_2.json()['data']
        assert len(relationships_2) == 1
        assert relationships_2[0]['relationship_type'] == 'Child'
        assert relationships_2[0]['to_member_id'] == str(self.member_a1.id)

    def test_lifecycle_timeline_creation(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Update Member A1 status from Member to Inactive
        detail_url = reverse('member-detail', args=[self.member_a1.id])
        response = self.client.patch(detail_url, {
            'status': 'Inactive',
            'status_notes': 'Moving away'
        })
        
        assert response.status_code == status.HTTP_200_OK
        
        # Check timeline entry
        timeline_entry = MemberLifecycleTimeline.objects.filter(member=self.member_a1).last()
        assert timeline_entry is not None
        assert timeline_entry.previous_status == 'Member'
        assert timeline_entry.new_status == 'Inactive'
        assert timeline_entry.changed_by == self.pastor_a
        assert timeline_entry.notes == 'Moving away'

    def test_pagination_and_envelope(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('member-list')
        response = self.client.get(url, {'page': 1, 'page_size': 1})
        
        assert response.status_code == status.HTTP_200_OK
        # Check standard envelope format
        assert response.json()['success'] is True
        assert 'data' in response.json()
        assert 'count' in response.json()['data']
        assert 'results' in response.json()['data']
        assert len(response.json()['data']['results']) == 1

    def test_audit_fields(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('member-list')
        
        response = self.client.post(url, {
            'first_name': 'Audit',
            'last_name': 'Test',
            'gender': 'male',
            'email': 'audittest@test.com',
            'phone_number': '1234567890',
            'marital_status': 'Single',
            'status': 'Member',
            'join_date': timezone.now().date().isoformat()
        })
        
        assert response.status_code == status.HTTP_201_CREATED
        member_id = response.json()['data']['id']
        
        member = Member.objects.get(id=member_id)
        assert member.created_by == self.pastor_a
        
        # Update and verify updated_by
        detail_url = reverse('member-detail', args=[member_id])
        response = self.client.patch(detail_url, {'first_name': 'AuditUpdated'})
        assert response.status_code == status.HTTP_200_OK
        
        member.refresh_from_db()
        assert member.updated_by == self.pastor_a

