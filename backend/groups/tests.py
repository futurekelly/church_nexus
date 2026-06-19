import pytest
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from branches.models import Branch
from groups.models import ConnectGroup, GroupMember, GroupAttendance, GroupAttendanceAttendee, GroupPrayerRequest, StudyOutline
from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory
from groups.factories import (
    ConnectGroupFactory,
    GroupMemberFactory,
    GroupAttendanceFactory,
    GroupAttendanceAttendeeFactory,
    GroupPrayerRequestFactory,
    StudyOutlineFactory
)

@pytest.mark.django_db
class TestGroupsAPI:
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
        self.member_a1 = MemberFactory(branch=self.branch_a, email="a1@test.com")
        self.member_a2 = MemberFactory(branch=self.branch_a, email="a2@test.com")
        
        # Connect Groups
        self.group_a1 = ConnectGroupFactory(branch=self.branch_a, name="Group A1")
        self.group_a2 = ConnectGroupFactory(branch=self.branch_a, name="Group A2")
        self.group_b1 = ConnectGroupFactory(branch=self.branch_b, name="Group B1")

    def test_branch_isolation_groups(self):
        # Pastor A must only see Connect Groups in Branch A
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('connectgroup-list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        results = response.json()['data']
        assert len(results) == 2
        for item in results:
            assert item['branch'] == self.branch_a.id

        # Super Admin sees all
        self.client.force_authenticate(user=self.super_admin)
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()['data']) == 3

    def test_active_group_limit(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('groupmember-list')

        # Add member to Group A1 (1st active group)
        resp1 = self.client.post(url, {
            'group_id': self.group_a1.id,
            'member_id': self.member_a1.id,
            'name': 'Member A1',
            'phone': '1234567890',
            'role': 'Member',
            'status': 'Active'
        }, format='json')
        assert resp1.status_code == status.HTTP_201_CREATED

        # Add member to Group A2 (2nd active group)
        resp2 = self.client.post(url, {
            'group_id': self.group_a2.id,
            'member_id': self.member_a1.id,
            'name': 'Member A1',
            'phone': '1234567890',
            'role': 'Member',
            'status': 'Active'
        }, format='json')
        assert resp2.status_code == status.HTTP_201_CREATED

        # Attempt to add to a 3rd active group -> validation error
        group_a3 = ConnectGroupFactory(branch=self.branch_a, name="Group A3")
        resp3 = self.client.post(url, {
            'group_id': group_a3.id,
            'member_id': self.member_a1.id,
            'name': 'Member A1',
            'phone': '1234567890',
            'role': 'Member',
            'status': 'Active'
        }, format='json')
        assert resp3.status_code == status.HTTP_400_BAD_REQUEST
        assert "Member cannot belong to more than 2 active Connect Groups simultaneously." in str(resp3.json()['errors'])

    def test_attendance_date_uniqueness(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('groupattendance-list')
        meeting_date = "2026-06-16"

        # Log first attendance record
        resp1 = self.client.post(url, {
            'group_id': self.group_a1.id,
            'meeting_date': meeting_date,
            'visitor_count': 0,
            'study_topic': 'Generosity',
            'attendees': []
        }, format='json')
        assert resp1.status_code == status.HTTP_201_CREATED

        # Attempt to log second attendance record for the same group and date -> blocks
        resp2 = self.client.post(url, {
            'group_id': self.group_a1.id,
            'meeting_date': meeting_date,
            'visitor_count': 1,
            'study_topic': 'Faith',
            'attendees': []
        }, format='json')
        assert resp2.status_code == status.HTTP_400_BAD_REQUEST

    def test_atomic_nested_attendance_serialization(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('groupattendance-list')
        
        # Create group members
        gm1 = GroupMemberFactory(group=self.group_a1)
        gm2 = GroupMemberFactory(group=self.group_a1)

        resp = self.client.post(url, {
            'group_id': self.group_a1.id,
            'meeting_date': "2026-06-16",
            'visitor_count': 3,
            'study_topic': 'Prayer',
            'attendees': [
                {'member_id': gm1.id, 'attended': True, 'status': 'Present', 'notes': 'On time'},
                {'member_id': gm2.id, 'attended': False, 'status': 'Absent', 'notes': 'Sick'}
            ]
        }, format='json')
        
        assert resp.status_code == status.HTTP_201_CREATED
        attendance_id = resp.json()['data']['id']
        
        # Assert database rows
        attendance = GroupAttendance.objects.get(id=attendance_id)
        assert attendance.attendees.count() == 2
        assert attendance.attendees.filter(member=gm1, attended=True, status='Present').exists()
        assert attendance.attendees.filter(member=gm2, attended=False, status='Absent').exists()

    def test_study_outline_global_accessibility(self):
        # Pastor A creates a study outline
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('studyoutline-list')
        resp1 = self.client.post(url, {
            'title': 'Global Curriculum',
            'theme': 'Unity',
            'scripture_references': ['Ephesians 4:1-6'],
            'introduction': 'Walking in unity',
            'discussion_questions': ['How?'],
            'application': 'Apply it'
        }, format='json')
        assert resp1.status_code == status.HTTP_201_CREATED, resp1.json()

        # Pastor B queries outline list -> sees Pastor A's outline (global visibility)
        self.client.force_authenticate(user=self.pastor_b)
        resp2 = self.client.get(url)
        assert resp2.status_code == status.HTTP_200_OK
        results = resp2.json()['data']
        assert any(item['title'] == 'Global Curriculum' for item in results)

    def test_soft_delete_and_restore(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # 1. GroupMember soft delete
        gm = GroupMemberFactory(group=self.group_a1)
        url_gm_archive = reverse('groupmember-archive', args=[gm.id])
        res1 = self.client.post(url_gm_archive)
        assert res1.status_code == status.HTTP_200_OK
        gm.refresh_from_db()
        assert gm.is_archived is True

        # GroupMember physical delete block
        url_gm_detail = reverse('groupmember-detail', args=[gm.id])
        res2 = self.client.delete(url_gm_detail)
        assert res2.status_code == status.HTTP_405_METHOD_NOT_ALLOWED

        # GroupMember restore
        url_gm_restore = reverse('groupmember-restore', args=[gm.id])
        res3 = self.client.post(url_gm_restore)
        assert res3.status_code == status.HTTP_200_OK
        gm.refresh_from_db()
        assert gm.is_archived is False

        # 2. GroupAttendance soft delete
        att = GroupAttendanceFactory(group=self.group_a1)
        url_att_archive = reverse('groupattendance-archive', args=[att.id])
        res4 = self.client.post(url_att_archive)
        assert res4.status_code == status.HTTP_200_OK
        att.refresh_from_db()
        assert att.is_archived is True

        # GroupAttendance restore
        url_att_restore = reverse('groupattendance-restore', args=[att.id])
        res5 = self.client.post(url_att_restore)
        assert res5.status_code == status.HTTP_200_OK
        att.refresh_from_db()
        assert att.is_archived is False

        # 3. GroupPrayerRequest soft delete
        pr = GroupPrayerRequestFactory(group=self.group_a1)
        url_pr_archive = reverse('groupprayerrequest-archive', args=[pr.id])
        res6 = self.client.post(url_pr_archive)
        assert res6.status_code == status.HTTP_200_OK
        pr.refresh_from_db()
        assert pr.is_archived is True

        # GroupPrayerRequest restore
        url_pr_restore = reverse('groupprayerrequest-restore', args=[pr.id])
        res7 = self.client.post(url_pr_restore)
        assert res7.status_code == status.HTTP_200_OK
        pr.refresh_from_db()
        assert pr.is_archived is False
