import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.test import APIClient
from django.utils import timezone
from .models import VisitorProfile, FollowUpTicket, ContactHistoryLog
from authentication.factories import BranchFactory, UserFactory
from members.models import Member
from authentication.models import User

@pytest.mark.django_db
class TestFollowUpModels:
    def test_visitor_profile_membership_number_generation(self):
        branch = BranchFactory()
        visitor = VisitorProfile.objects.create(
            branch=branch,
            first_name="Jane",
            last_name="Doe",
            email="jane.doe@test.com",
            phone_number="+254700000000",
            gender="female",
            date_joined=timezone.now()
        )
        assert visitor.membership_number.startswith(f"VST-{timezone.now().year}-")
        assert len(visitor.membership_number) > 10

    def test_follow_up_ticket_default_status(self):
        branch = BranchFactory()
        visitor = VisitorProfile.objects.create(
            branch=branch,
            first_name="Jane",
            last_name="Doe",
            phone_number="+254700000000",
            gender="female"
        )
        ticket = FollowUpTicket.objects.create(
            branch=branch,
            visitor=visitor,
            notes="Initial notes"
        )
        assert ticket.status == "New"
        assert ticket.is_completed is False

    def test_assigned_pastor_branch_validation(self):
        branch_a = BranchFactory()
        branch_b = BranchFactory()
        visitor = VisitorProfile.objects.create(
            branch=branch_a,
            first_name="Jane",
            last_name="Doe",
            phone_number="+254700000000",
            gender="female"
        )
        pastor_b = UserFactory(branch=branch_b, role='pastor')
        
        ticket = FollowUpTicket(
            branch=branch_a,
            visitor=visitor,
            assigned_pastor=pastor_b
        )
        # Should raise Validation error because pastor belongs to branch_b
        with pytest.raises(ValidationError):
            ticket.clean()

    def test_fsm_status_transitions(self):
        branch = BranchFactory()
        visitor = VisitorProfile.objects.create(
            branch=branch,
            first_name="Jane",
            last_name="Doe",
            phone_number="+254700000000",
            gender="female"
        )
        ticket = FollowUpTicket.objects.create(
            branch=branch,
            visitor=visitor,
            status='New'
        )
        
        # New -> Contacted is valid
        ticket.status = 'Contacted'
        ticket.save()
        assert ticket.status == 'Contacted'
        assert ticket.is_completed is False

        # Contacted -> Integrated is invalid (must go to Following Up first)
        ticket.status = 'Integrated'
        with pytest.raises(ValidationError):
            ticket.clean()

        # Contacted -> Following Up is valid
        ticket.status = 'Following Up'
        ticket.save()
        
        # Following Up -> Integrated is valid
        ticket.status = 'Integrated'
        ticket.save()
        assert ticket.status == 'Integrated'
        assert ticket.is_completed is True
        assert ticket.integrated_at is not None

        # Integrated -> New is invalid (terminal state)
        ticket.status = 'New'
        with pytest.raises(ValidationError):
            ticket.clean()


@pytest.mark.django_db
class TestFollowUpAPI:
    @pytest.fixture(autouse=True)
    def setup_method(self):
        self.client = APIClient()
        self.branch_a = BranchFactory()
        self.branch_b = BranchFactory()
        
        # Users
        self.super_admin = UserFactory(role='super_admin', branch=None)
        self.pastor_a = UserFactory(role='pastor', branch=self.branch_a)
        self.pastor_b = UserFactory(role='pastor', branch=self.branch_b)
        self.member_a = UserFactory(role='member', branch=self.branch_a)

    def test_unauthenticated_blocked(self):
        url = reverse('ticket-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_member_blocked(self):
        self.client.force_authenticate(user=self.member_a)
        url = reverse('ticket-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_pastor_list_branch_isolated(self):
        # Create visitors and tickets in branch A and branch B
        vis_a = VisitorProfile.objects.create(branch=self.branch_a, first_name="A", last_name="Vis", gender="male")
        vis_b = VisitorProfile.objects.create(branch=self.branch_b, first_name="B", last_name="Vis", gender="female")
        
        tkt_a = FollowUpTicket.objects.create(branch=self.branch_a, visitor=vis_a)
        tkt_b = FollowUpTicket.objects.create(branch=self.branch_b, visitor=vis_b)

        # Authenticate as Pastor A
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('ticket-list')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # Should only see branch A tickets
        assert len(response.data) == 1
        assert response.data[0]['id'] == str(tkt_a.id)

        # Attempt to access ticket B directly - should return 404 for isolation safety
        detail_url = reverse('ticket-detail', kwargs={'pk': tkt_b.id})
        response = self.client.get(detail_url)
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_manual_visitor_registration_auto_creates_ticket(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('visitor-list')
        data = {
            "first_name": "Test",
            "last_name": "Guest",
            "email": "guest@test.com",
            "phone_number": "+254711111111",
            "gender": "male",
            "first_time_visitor": True,
            "invited_by": "Friend",
            "notes": "Intake notes"
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verify ticket was created automatically
        assert FollowUpTicket.objects.filter(visitor__email="guest@test.com").exists()
        ticket = FollowUpTicket.objects.get(visitor__email="guest@test.com")
        assert ticket.status == "New"
        assert ticket.source == "Manual"
        assert ticket.notes == "Intake notes"

    def test_duplicate_email_within_branch_prevented(self):
        self.client.force_authenticate(user=self.pastor_a)
        VisitorProfile.objects.create(
            branch=self.branch_a,
            first_name="Dup",
            last_name="Visitor",
            email="dup@test.com",
            phone_number="+2547111",
            gender="male"
        )
        url = reverse('visitor-list')
        data = {
            "first_name": "Dup2",
            "last_name": "Visitor2",
            "email": "dup@test.com",
            "phone_number": "+2547222",
            "gender": "female"
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "email" in response.data

    def test_log_interaction_updates_status(self):
        self.client.force_authenticate(user=self.pastor_a)
        vis = VisitorProfile.objects.create(branch=self.branch_a, first_name="A", last_name="Vis", gender="male")
        ticket = FollowUpTicket.objects.create(branch=self.branch_a, visitor=vis, status="New")
        
        url = reverse('ticket-log-interaction', kwargs={'pk': ticket.id})
        data = {
            "interaction_type": "Call",
            "notes": "Called Jane, very friendly",
            "contact_date": timezone.now().isoformat()
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        
        # Verify log entry
        assert ContactHistoryLog.objects.filter(ticket=ticket).exists()
        
        # Verify ticket status auto-updated to Contacted
        ticket.refresh_from_db()
        assert ticket.status == "Contacted"

    def test_integrate_promotion_workflow(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Setup visitor with online account
        visitor_user = User.objects.create_user(
            email="visitor@example.com",
            password="Password123!",
            first_name="Jane",
            last_name="Visitor",
            branch=self.branch_a,
            role="visitor"
        )
        
        vis = VisitorProfile.objects.create(
            branch=self.branch_a,
            first_name="Jane",
            last_name="Visitor",
            email="visitor@example.com",
            phone_number="+254733333333",
            gender="female"
        )
        ticket = FollowUpTicket.objects.create(
            branch=self.branch_a,
            visitor=vis,
            status="Following Up"
        )
        
        url = reverse('ticket-integrate', kwargs={'pk': ticket.id})
        response = self.client.post(url, {"notes": "Promotion class completed"})
        assert response.status_code == status.HTTP_200_OK
        
        # Verify Member was created/activated
        assert Member.objects.filter(email="visitor@example.com").exists()
        member = Member.objects.get(email="visitor@example.com")
        assert member.status == "Active"
        
        # Verify User role promoted to member
        visitor_user.refresh_from_db()
        assert visitor_user.role == "member"
        assert visitor_user.member_id == str(member.id)
        
        # Verify ticket integrated
        ticket.refresh_from_db()
        assert ticket.status == "Integrated"
        assert ticket.is_completed is True
        assert ticket.integrated_at is not None

    def test_analytics_kpis(self):
        # Seed test data for Branch A
        vis1 = VisitorProfile.objects.create(branch=self.branch_a, first_name="V1", last_name="V", gender="male")
        vis2 = VisitorProfile.objects.create(branch=self.branch_a, first_name="V2", last_name="V", gender="female")
        vis3 = VisitorProfile.objects.create(branch=self.branch_a, first_name="V3", last_name="V", gender="male")

        tkt1 = FollowUpTicket.objects.create(branch=self.branch_a, visitor=vis1, status="New", assigned_pastor=self.pastor_a)
        tkt2 = FollowUpTicket.objects.create(branch=self.branch_a, visitor=vis2, status="Contacted", assigned_pastor=self.pastor_a)
        tkt3 = FollowUpTicket.objects.create(branch=self.branch_a, visitor=vis3, status="Integrated", integrated_at=timezone.now())

        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('analytics')
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        
        assert response.data['new_visitors'] == 1
        assert response.data['contacted_visitors'] == 1
        assert response.data['integrated_visitors'] == 1
        assert response.data['conversion_rate'] == 33.3 # 1 out of 3 total
        assert len(response.data['tickets_by_pastor']) == 1
        assert response.data['tickets_by_pastor'][0]['ticket_count'] == 2 # tkt1 and tkt2 assigned to pastor_a
