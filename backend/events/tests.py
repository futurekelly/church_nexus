import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from branches.models import Branch
from events.models import Event, EventRegistration, EventCheckIn, EventResource, ResourceBooking
from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory
from events.factories import (
    EventFactory,
    EventRegistrationFactory,
    EventCheckInFactory,
    EventResourceFactory,
    ResourceBookingFactory
)

@pytest.mark.django_db
class TestEventsAPI:
    @pytest.fixture(autouse=True)
    def setup(self):
        self.client = APIClient()
        self.branch_a = BranchFactory(id="branch-a", branch_name="Branch A", branch_code="BRA01")
        self.branch_b = BranchFactory(id="branch-b", branch_name="Branch B", branch_code="BRB01")
        
        # Users
        self.super_admin = UserFactory(email="super@test.com", role="super_admin", branch=None)
        self.pastor_a = UserFactory(email="pastor_a@test.com", role="pastor", branch=self.branch_a)
        self.pastor_b = UserFactory(email="pastor_b@test.com", role="pastor", branch=self.branch_b)
        
        # Core Members
        self.member_a1 = MemberFactory(branch=self.branch_a)
        self.member_a2 = MemberFactory(branch=self.branch_a)
        
        # Events
        self.event_a1 = EventFactory(branch=self.branch_a, title="Event A1")
        self.event_a2 = EventFactory(branch=self.branch_a, title="Event A2")
        self.event_b1 = EventFactory(branch=self.branch_b, title="Event B1")

    def test_branch_isolation_events(self):
        # Pastor A must only see events in Branch A
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('event-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']['results']
        assert len(results) == 2
        for item in results:
            assert item['branch'] == self.branch_a.id

        # Super Admin sees all
        self.client.force_authenticate(user=self.super_admin)
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()['data']['results']) == 3

    def test_event_lifecycle_transitions(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('event-detail', args=[self.event_a1.id])
        
        # Try invalid direct transition (Draft -> Completed) -> blocks
        resp1 = self.client.patch(url, {'status': 'Completed'}, format='json')
        assert resp1.status_code == status.HTTP_400_BAD_REQUEST

        # Valid sequence: Draft -> Published -> Open -> Closed -> Completed -> Archived
        resp_pub = self.client.patch(url, {'status': 'Published'}, format='json')
        assert resp_pub.status_code == status.HTTP_200_OK
        
        resp_open = self.client.patch(url, {'status': 'Open'}, format='json')
        assert resp_open.status_code == status.HTTP_200_OK

        resp_close = self.client.patch(url, {'status': 'Closed'}, format='json')
        assert resp_close.status_code == status.HTTP_200_OK

        resp_comp = self.client.patch(url, {'status': 'Completed'}, format='json')
        assert resp_comp.status_code == status.HTTP_200_OK

        resp_arch = self.client.patch(url, {'status': 'Archived'}, format='json')
        assert resp_arch.status_code == status.HTTP_200_OK

    def test_capacity_limit_and_waitlist_fifo(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('eventregistration-list')
        
        # Update event capacity to 1
        self.event_a1.capacity = 1
        self.event_a1.waitlist_enabled = True
        self.event_a1.status = 'Published'
        self.event_a1.save()

        # Registration 1 (Attending) -> REGISTERED
        resp1 = self.client.post(url, {
            'event_id': self.event_a1.id,
            'member_id': self.member_a1.id,
            'status': 'REGISTERED'
        }, format='json')
        assert resp1.status_code == status.HTTP_201_CREATED
        assert resp1.json()['data']['status'] == 'REGISTERED'

        # Registration 2 (Attending) -> WAITLISTED (capacity full)
        resp2 = self.client.post(url, {
            'event_id': self.event_a1.id,
            'member_id': self.member_a2.id,
            'status': 'REGISTERED'
        }, format='json')
        assert resp2.status_code == status.HTTP_201_CREATED
        assert resp2.json()['data']['status'] == 'WAITLISTED'

        # Cancel Registration 1 -> Registration 2 promoted to PROMOTED
        reg1_id = resp1.json()['data']['id']
        reg2_id = resp2.json()['data']['id']
        
        url_cancel = reverse('eventregistration-detail', args=[reg1_id])
        resp_cancel = self.client.patch(url_cancel, {'status': 'CANCELLED'}, format='json')
        assert resp_cancel.status_code == status.HTTP_200_OK
        
        reg2 = EventRegistration.objects.get(id=reg2_id)
        assert reg2.status == 'PROMOTED'

    def test_resource_booking_overlap_conflict(self):
        self.client.force_authenticate(user=self.pastor_a)
        resource = EventResourceFactory(branch=self.branch_a)
        
        now = timezone.now()
        start1 = now + timezone.timedelta(days=1, hours=9)
        end1 = now + timezone.timedelta(days=1, hours=12)
        start2 = now + timezone.timedelta(days=1, hours=10)
        end2 = now + timezone.timedelta(days=1, hours=11)

        # Successful booking 1 (Approved status)
        booking1 = ResourceBookingFactory(
            event=self.event_a1,
            resource=resource,
            start_time=start1,
            end_time=end1,
            status='Approved'
        )

        # Attempt overlapping booking 2 -> validation error
        url = reverse('resourcebooking-list')
        resp = self.client.post(url, {
            'event_id': self.event_a2.id,
            'resource_id': resource.id,
            'start_time': start2.isoformat(),
            'end_time': end2.isoformat(),
            'status': 'Pending'
        }, format='json')
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
        assert "Resource is already booked during this time window." in str(resp.json()['errors'])

    def test_attendance_snapshot_on_close_or_complete(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Put event in Open state by transitioning validly
        self.event_a1.status = 'Published'
        self.event_a1.save()
        self.event_a1.status = 'Open'
        self.event_a1.save()

        # Create check-in registration
        reg = EventRegistrationFactory(event=self.event_a1, member=self.member_a1, status='REGISTERED')
        
        # Check in the member
        url_checkin = reverse('eventregistration-check-in', args=[reg.id])
        resp_ci = self.client.post(url_checkin, {'check_in_method': 'QR_CODE'}, format='json')
        assert resp_ci.status_code == status.HTTP_200_OK

        # Transition event status from Open to Closed
        url_event = reverse('event-detail', args=[self.event_a1.id])
        resp_event = self.client.patch(url_event, {'status': 'Closed'}, format='json')
        assert resp_event.status_code == status.HTTP_200_OK
        
        self.event_a1.refresh_from_db()
        assert self.event_a1.attendance_snapshot is not None
        assert self.event_a1.snapshot_generated_at is not None
        
        snapshot = self.event_a1.attendance_snapshot
        assert snapshot['total_registrations'] == 1
        assert snapshot['total_checked_in'] == 1
        assert snapshot['attendees'][0]['attendance_status'] == 'checked_in'

    def test_check_in_auditing(self):
        self.client.force_authenticate(user=self.pastor_a)
        reg = EventRegistrationFactory(event=self.event_a1, member=self.member_a1)

        url = reverse('eventregistration-check-in', args=[reg.id])
        response = self.client.post(url, {
            'check_in_method': 'SELF_SERVICE'
        }, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        reg.refresh_from_db()
        assert reg.attendance_status == 'checked_in'
        
        check_in = EventCheckIn.objects.filter(registration=reg).last()
        assert check_in is not None
        assert check_in.check_in_method == 'SELF_SERVICE'
        assert check_in.checked_in_by == self.pastor_a
