import pytest
import datetime
from django.urls import reverse
from django.utils import timezone  # noqa: F401
from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.test import APIClient
from .models import Child, Classroom, CheckInLog
from authentication.factories import BranchFactory, UserFactory
from members.factories import MemberFactory

@pytest.mark.django_db
class TestKidsKingdomModels:
    def test_classroom_age_range_validation(self):
        branch = BranchFactory()
        classroom = Classroom(
            branch=branch,
            name="Invalid Room",
            min_age=5,
            max_age=3
        )
        with pytest.raises(ValidationError):
            classroom.clean()

    def test_child_age_calculation(self):
        branch = BranchFactory()
        today = datetime.date.today()
        birth_date = datetime.date(today.year - 4, today.month, today.day)
        child = Child.objects.create(
            branch=branch,
            first_name="Toddler",
            last_name="Boy",
            birth_date=birth_date,
            gender="male"
        )
        assert child.age == 4

    def test_future_birth_date_prevented(self):
        branch = BranchFactory()
        future_date = datetime.date.today() + datetime.timedelta(days=1)
        child = Child(
            branch=branch,
            first_name="Future",
            last_name="Baby",
            birth_date=future_date,
            gender="female"
        )
        with pytest.raises(ValidationError):
            child.clean()

    def test_check_in_branch_validation(self):
        branch_a = BranchFactory()
        branch_b = BranchFactory()

        classroom_a = Classroom.objects.create(branch=branch_a, name="Nursery A", min_age=0, max_age=2)
        child_b = Child.objects.create(
            branch=branch_b,
            first_name="Child",
            last_name="B",
            birth_date=datetime.date.today() - datetime.timedelta(days=365),
            gender="female"
        )
        parent_b = MemberFactory(branch=branch_b)

        # Try to check in a Branch B child into a Branch A classroom under Branch A log
        log = CheckInLog(
            branch=branch_a,
            child=child_b,
            classroom=classroom_a,
            checked_in_by=parent_b
        )
        with pytest.raises(ValidationError):
            log.clean()


@pytest.mark.django_db
class TestKidsKingdomAPI:
    @pytest.fixture(autouse=True)
    def setup_method(self):
        self.client = APIClient()
        self.branch_a = BranchFactory()
        self.branch_b = BranchFactory()

        # Users
        self.super_admin = UserFactory(role='super_admin', branch=None)
        self.pastor_a = UserFactory(role='pastor', branch=self.branch_a)
        self.pastor_b = UserFactory(role='pastor', branch=self.branch_b)
        self.member_a = UserFactory(role='member', branch=self.branch_a) # User login (regular member)

        # Parents
        self.parent_a = MemberFactory(branch=self.branch_a)
        self.parent_b = MemberFactory(branch=self.branch_b)

        # Classrooms in Branch A
        self.nursery_a = Classroom.objects.create(branch=self.branch_a, name="Nursery A", min_age=0, max_age=2)
        self.toddlers_a = Classroom.objects.create(branch=self.branch_a, name="Toddlers A", min_age=3, max_age=4)

        # Children in Branch A
        today = datetime.date.today()
        self.child_1 = Child.objects.create(
            branch=self.branch_a,
            first_name="Baby",
            last_name="One",
            birth_date=datetime.date(today.year - 1, today.month, today.day), # 1 year old
            gender="female"
        )
        self.child_1.parents.add(self.parent_a)

        self.child_3 = Child.objects.create(
            branch=self.branch_a,
            first_name="Toddler",
            last_name="Three",
            birth_date=datetime.date(today.year - 3, today.month, today.day), # 3 years old
            gender="male"
        )
        self.child_3.parents.add(self.parent_a)

        # Child in Branch B
        self.child_b = Child.objects.create(
            branch=self.branch_b,
            first_name="BranchB",
            last_name="Kid",
            birth_date=datetime.date(today.year - 1, today.month, today.day), # 1 year old
            gender="male"
        )
        self.child_b.parents.add(self.parent_b)

    def test_unauthenticated_and_regular_member_blocked(self):
        url = reverse('child-list')
        
        # Anonymous blocked
        response_anon = self.client.get(url)
        assert response_anon.status_code == status.HTTP_401_UNAUTHORIZED

        # Member blocked
        self.client.force_authenticate(user=self.member_a)
        response_member = self.client.get(url)
        assert response_member.status_code == status.HTTP_403_FORBIDDEN

    def test_pastor_list_is_branch_isolated(self):
        self.client.force_authenticate(user=self.pastor_a)

        # List classrooms - Pastor A sees only classrooms in Branch A
        url_rooms = reverse('classroom-list')
        res_rooms = self.client.get(url_rooms)
        assert res_rooms.status_code == status.HTTP_200_OK
        names = [r['name'] for r in res_rooms.data]
        assert "Nursery A" in names
        assert len(names) == 2

        # List children - Pastor A sees only children in Branch A
        url_kids = reverse('child-list')
        res_kids = self.client.get(url_kids)
        assert res_kids.status_code == status.HTTP_200_OK
        first_names = [k['first_name'] for k in res_kids.data]
        assert "Baby" in first_names
        assert "BranchB" not in first_names

    def test_auto_classroom_allocation_during_check_in(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('check-in-check-in')
        
        # Check-in 1-year-old child without specifying classroom_id
        data = {
            "child_id": str(self.child_1.id),
            "checked_in_by_id": str(self.parent_a.id)
        }
        response = self.client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert str(response.data['classroom']) == str(self.nursery_a.id) # Auto allocated to Nursery A
        assert response.data['security_code'].startswith("KK-")
        assert response.data['status'] == "Checked In"

    def test_duplicate_check_in_prevented(self):
        self.client.force_authenticate(user=self.pastor_a)
        url = reverse('check-in-check-in')

        data = {
            "child_id": str(self.child_1.id),
            "checked_in_by_id": str(self.parent_a.id)
        }
        # First check-in
        res1 = self.client.post(url, data)
        assert res1.status_code == status.HTTP_201_CREATED

        # Second check-in (duplicate)
        res2 = self.client.post(url, data)
        assert res2.status_code == status.HTTP_400_BAD_REQUEST
        assert "is already checked in" in res2.data["error"]

    def test_checkout_validation_rules(self):
        self.client.force_authenticate(user=self.pastor_a)
        
        # Perform check-in
        checkin_url = reverse('check-in-check-in')
        checkin_data = {
            "child_id": str(self.child_3.id),
            "checked_in_by_id": str(self.parent_a.id)
        }
        res_in = self.client.post(checkin_url, checkin_data)
        assert res_in.status_code == status.HTTP_201_CREATED
        
        log_id = res_in.data['id']
        security_code = res_in.data['security_code']

        checkout_url = reverse('check-in-check-out', kwargs={'pk': log_id})
        
        # 1. Check out with WRONG security code - should fail
        checkout_data_fail = {
            "security_code": "KK-WRONG",
            "checked_out_by_id": str(self.parent_a.id)
        }
        res_out_fail = self.client.post(checkout_url, checkout_data_fail)
        assert res_out_fail.status_code == status.HTTP_400_BAD_REQUEST
        assert "Invalid security code" in res_out_fail.data["error"]

        # 2. Check out with CORRECT security code - should succeed
        checkout_data_ok = {
            "security_code": security_code,
            "checked_out_by_id": str(self.parent_a.id)
        }
        res_out_ok = self.client.post(checkout_url, checkout_data_ok)
        assert res_out_ok.status_code == status.HTTP_200_OK
        assert res_out_ok.data['status'] == "Checked Out"
        assert str(res_out_ok.data['checked_out_by']) == str(self.parent_a.id)
        assert res_out_ok.data['check_out_time'] is not None
