import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.test import APIClient
from testimonies.models import Testimony
from authentication.factories import BranchFactory, UserFactory

@pytest.mark.django_db
class TestTestimonyModel:
    def test_testimony_default_status(self):
        branch = BranchFactory()
        user = UserFactory(branch=branch)
        testimony = Testimony.objects.create(
            branch=branch,
            author_user=user,
            author_name="John Doe",
            title="My Healing",
            content="God healed me of fever.",
            category="Healing"
        )
        assert testimony.status == 'Pending'
        assert testimony.is_featured is False
        assert testimony.views == 0

    def test_featured_restriction_on_unapproved(self):
        branch = BranchFactory()
        testimony = Testimony(
            branch=branch,
            author_name="John Doe",
            title="Featured Test",
            content="Test testimony.",
            status='Pending',
            is_featured=True
        )
        # Verify that validation raises error if is_featured is True on unapproved status
        with pytest.raises(ValidationError):
            testimony.clean()

    def test_status_transitions(self):
        branch = BranchFactory()
        testimony = Testimony.objects.create(
            branch=branch,
            author_name="John Doe",
            title="Transition Test",
            content="Test content.",
            status='Pending'
        )

        # Pending -> Approved (Allowed)
        testimony.status = 'Approved'
        testimony.clean()
        testimony.save()

        # Approved -> Rejected (Not allowed)
        testimony.status = 'Rejected'
        with pytest.raises(ValidationError):
            testimony.clean()

        # Reset and try Approved -> Archived (Allowed)
        testimony.status = 'Approved'
        testimony.save()
        testimony.status = 'Archived'
        testimony.clean()
        testimony.save()

        # Archived -> Pending (Allowed)
        testimony.status = 'Pending'
        testimony.clean()
        testimony.save()

        # Pending -> Rejected (Allowed)
        testimony.status = 'Rejected'
        testimony.clean()
        testimony.save()

        # Rejected -> Archived (Allowed)
        testimony.status = 'Archived'
        testimony.clean()
        testimony.save()


@pytest.mark.django_db
class TestTestimoniesAPI:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.branch_a = BranchFactory(id="branch-a", branch_name="Branch A")
        self.branch_b = BranchFactory(id="branch-b", branch_name="Branch B")

        # Roles
        self.super_admin = UserFactory(email="super@test.com", role="super_admin", branch=None)
        self.pastor_a = UserFactory(email="pastor_a@test.com", role="pastor", branch=self.branch_a)
        self.member_a1 = UserFactory(email="member_a1@test.com", role="member", branch=self.branch_a)
        self.member_a2 = UserFactory(email="member_a2@test.com", role="member", branch=self.branch_a)
        self.member_b1 = UserFactory(email="member_b1@test.com", role="member", branch=self.branch_b)

        # Create Testimonies
        self.testimony_approved_a = Testimony.objects.create(
            branch=self.branch_a,
            author_user=self.member_a1,
            author_name="Member A1",
            title="Approved A",
            content="Content A",
            status='Approved'
        )
        self.testimony_pending_a = Testimony.objects.create(
            branch=self.branch_a,
            author_user=self.member_a1,
            author_name="Member A1",
            title="Pending A",
            content="Content A pending",
            status='Pending'
        )
        self.testimony_rejected_a = Testimony.objects.create(
            branch=self.branch_a,
            author_user=self.member_a2,
            author_name="Member A2",
            title="Rejected A",
            content="Content A rejected",
            status='Rejected',
            rejection_reason="Need more details."
        )
        self.testimony_approved_b = Testimony.objects.create(
            branch=self.branch_b,
            author_user=self.member_b1,
            author_name="Member B1",
            title="Approved B",
            content="Content B",
            status='Approved'
        )

    def test_public_user_visibility(self):
        # Unauthenticated users see only Approved testimonies (A and B)
        url = reverse('testimony-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']
        assert len(results) == 2
        for t in results:
            assert t['status'] == 'Approved'

    def test_member_visibility(self):
        # Member A1 should see:
        # 1. Approved testimonies (Approved A and Approved B)
        # 2. Their own testimonies (Approved A and Pending A)
        # Total distinct: Approved A, Approved B, Pending A -> 3 testimonies
        self.client.force_authenticate(user=self.member_a1)
        url = reverse('testimony-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']
        assert len(results) == 3
        titles = [t['title'] for t in results]
        assert "Approved A" in titles
        assert "Approved B" in titles
        assert "Pending A" in titles
        assert "Rejected A" not in titles

    def test_moderator_visibility_branch_isolation(self):
        # Pastor A should see all testimonies in Branch A (Approved A, Pending A, Rejected A)
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('testimony-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']
        assert len(results) == 3
        for t in results:
            assert t['branch'] == self.branch_a.id

    def test_super_admin_global_visibility(self):
        # Super Admin sees all testimonies in the system (Approved A, Pending A, Rejected A, Approved B)
        self.client.force_authenticate(user=self.super_admin)
        url = reverse('testimony-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']
        assert len(results) == 4

    def test_member_cannot_modify_protected_fields(self):
        # Member trying to patch status or feature
        self.client.force_authenticate(user=self.member_a1)
        url = reverse('testimony-detail', args=[self.testimony_pending_a.id])
        
        # 1. Try to approve own testimony -> blocked
        response = self.client.patch(url, {'status': 'Approved'}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # 2. Try to feature own testimony -> blocked
        response = self.client.patch(url, {'is_featured': True}, format='json')
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_moderator_can_approve_and_feature(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('testimony-detail', args=[self.testimony_pending_a.id])
        
        # Approve
        response = self.client.patch(url, {'status': 'Approved'}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.json()['data']['status'] == 'Approved'

        # Feature
        response = self.client.patch(url, {'is_featured': True}, format='json')
        assert response.status_code == status.HTTP_200_OK
        assert response.json()['data']['is_featured'] is True

    def test_moderator_can_reject_with_reason(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('testimony-detail', args=[self.testimony_pending_a.id])
        
        # Reject with reason
        response = self.client.patch(url, {
            'status': 'Rejected',
            'rejection_reason': 'Need clarification on the healing timeline.'
        }, format='json')
        assert response.status_code == status.HTTP_200_OK
        data = response.json()['data']
        assert data['status'] == 'Rejected'
        assert data['rejection_reason'] == 'Need clarification on the healing timeline.'

    def test_anonymous_representation_masking(self):
        # Create an anonymous testimony in Branch A
        anon_testimony = Testimony.objects.create(
            branch=self.branch_a,
            author_user=self.member_a1,
            author_name="Member A1",
            author_email="a1@test.com",
            title="Secret Grace",
            content="God did something private.",
            status='Approved',
            is_anonymous=True
        )

        url = reverse('testimony-detail', args=[anon_testimony.id])

        # 1. Author user views it -> can see real details
        self.client.force_authenticate(user=self.member_a1)
        response = self.client.get(url)
        data = response.json()['data']
        assert data['author_name'] == 'Member A1'
        assert data['author_email'] == 'a1@test.com'

        # 2. Another member views it -> masked
        self.client.force_authenticate(user=self.member_a2)
        response = self.client.get(url)
        data = response.json()['data']
        assert data['author_name'] == 'Anonymous Member'
        assert data['author_email'] is None

        # 3. Moderator views it -> can see real details
        self.client.force_authenticate(user=self.pastor_a)
        response = self.client.get(url)
        data = response.json()['data']
        assert data['author_name'] == 'Member A1'
        assert data['author_email'] == 'a1@test.com'

    def test_increment_view_endpoint(self):
        # Atomic counter endpoint
        url_approved = reverse('testimony-increment-view', args=[self.testimony_approved_a.id])
        url_pending = reverse('testimony-increment-view', args=[self.testimony_pending_a.id])

        # 1. Try to increment approved testimony views -> OK
        response = self.client.post(url_approved)
        assert response.status_code == status.HTTP_200_OK
        self.testimony_approved_a.refresh_from_db()
        assert self.testimony_approved_a.views == 1

        # 2. Try to increment pending testimony views -> Fails (404)
        response = self.client.post(url_pending)
        assert response.status_code == status.HTTP_404_NOT_FOUND
        self.testimony_pending_a.refresh_from_db()
        assert self.testimony_pending_a.views == 0
