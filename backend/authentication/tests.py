import pytest
from django.urls import reverse
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.core.cache import cache
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from branches.models import Branch
from authentication.models import User
from authentication.factories import BranchFactory, UserFactory
from donations.models import Donation

@pytest.mark.django_db
class TestUserModelConstraints:
    def test_super_admin_can_have_null_branch(self):
        user = User.objects.create(
            email="super@test.com",
            role="super_admin",
            branch=None,
            is_staff=True,
            is_superuser=True
        )
        assert user.id is not None
        assert user.branch is None

    def test_super_admin_can_have_assigned_branch(self):
        branch = BranchFactory()
        user = User.objects.create(
            email="super_with_branch@test.com",
            role="super_admin",
            branch=branch,
            is_staff=True,
            is_superuser=True
        )
        assert user.id is not None
        assert user.branch == branch

    def test_other_roles_require_branch_validation_error(self):
        for role in ['church_admin', 'pastor', 'treasurer', 'member']:
            with pytest.raises(ValidationError) as excinfo:
                User.objects.create(
                    email=f"{role}_null@test.com",
                    role=role,
                    branch=None
                )
            assert 'branch' in excinfo.value.message_dict
            assert 'A branch assignment is required' in excinfo.value.message_dict['branch'][0]

    def test_other_roles_with_branch_succeed(self):
        branch = BranchFactory()
        for role in ['church_admin', 'pastor', 'treasurer', 'member']:
            user = User.objects.create(
                email=f"{role}_ok@test.com",
                role=role,
                branch=branch
            )
            assert user.id is not None
            assert user.branch == branch

    def test_database_check_constraint_enforced(self):
        branch = BranchFactory()
        user = User.objects.create(
            email="bypass_db_check@test.com",
            role="member",
            branch=branch
        )
        with pytest.raises(IntegrityError):
            User.objects.filter(id=user.id).update(branch=None)


@pytest.mark.django_db
class TestAuthenticationAPI:
    @pytest.fixture(autouse=True)
    def setup_client(self):
        self.client = APIClient()
        cache.clear()

    def test_jwt_login_success(self):
        branch = BranchFactory()
        user = UserFactory(email="testlogin@test.com", password="SecurePassword123!", role="member", branch=branch)
        
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'email': 'testlogin@test.com',
            'password': 'SecurePassword123!'
        })
        
        assert response.status_code == status.HTTP_200_OK
        # Access token is in the response body
        assert 'access' in response.data
        # Refresh token is NOT in the response body
        assert 'refresh' not in response.data
        # Refresh token is in the cookies
        assert 'refresh_token' in response.cookies
        assert response.cookies['refresh_token']['httponly'] is True

    def test_jwt_login_invalid_credentials(self):
        url = reverse('token_obtain_pair')
        response = self.client.post(url, {
            'email': 'nonexistent@test.com',
            'password': 'WrongPassword123!'
        })
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_jwt_refresh_success(self):
        branch = BranchFactory()
        user = UserFactory(email="testrefresh@test.com", password="SecurePassword123!", role="member", branch=branch)
        
        # Log in
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {
            'email': 'testrefresh@test.com',
            'password': 'SecurePassword123!'
        })
        assert 'refresh_token' in login_response.cookies
        
        # Refresh (browser automatically sends cookies)
        refresh_url = reverse('token_refresh')
        response = self.client.post(refresh_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh_token' in response.cookies

    def test_jwt_profile_success(self):
        branch = BranchFactory(id="branch-nyc", branch_code="NYC01", branch_name="New York Branch")
        user = UserFactory(email="profileuser@test.com", password="SecurePassword123!", role="pastor", branch=branch)
        
        # Log in
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {
            'email': 'profileuser@test.com',
            'password': 'SecurePassword123!'
        })
        access_token = login_response.data['access']
        
        # Access profile
        profile_url = reverse('user_profile')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(profile_url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['email'] == "profileuser@test.com"
        assert response.data['role'] == "pastor"
        assert response.data['branch']['id'] == "branch-nyc"

    def test_jwt_profile_unauthenticated(self):
        profile_url = reverse('user_profile')
        response = self.client.get(profile_url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_jwt_logout_success_and_blacklisted(self):
        branch = BranchFactory()
        user = UserFactory(email="logoutuser@test.com", password="SecurePassword123!", role="member", branch=branch)
        
        # Log in
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {
            'email': 'logoutuser@test.com',
            'password': 'SecurePassword123!'
        })
        access_token = login_response.data['access']
        refresh_token = login_response.cookies['refresh_token'].value
        
        # Logout
        logout_url = reverse('token_logout')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.post(logout_url)
        
        assert response.status_code == status.HTTP_205_RESET_CONTENT
        
        # Verify refresh token cookie was cleared (deleted)
        # Note: In Django test client, deleting a cookie sets its value to empty and expires to a past date
        cookie = response.cookies.get('refresh_token')
        assert cookie is not None
        assert cookie.value == "" or cookie['max-age'] == 0 or 'expires' in cookie
        
        # Verify refresh token is blacklisted by trying to refresh
        # (Pass token explicitly since cookie was cleared in client)
        self.client.cookies.clear()
        refresh_url = reverse('token_refresh')
        refresh_response = self.client.post(refresh_url, {'refresh': refresh_token})
        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_jwt_token_replay_prevention(self):
        branch = BranchFactory()
        user = UserFactory(email="replay@test.com", password="SecurePassword123!", role="member", branch=branch)
        
        # Log in
        login_url = reverse('token_obtain_pair')
        login_response = self.client.post(login_url, {
            'email': 'replay@test.com',
            'password': 'SecurePassword123!'
        })
        refresh_token_1 = login_response.cookies['refresh_token'].value
        
        # Refresh 1 (rotates token, blacklists refresh_token_1)
        refresh_url = reverse('token_refresh')
        refresh_response_1 = self.client.post(refresh_url)
        assert refresh_response_1.status_code == status.HTTP_200_OK
        refresh_token_2 = refresh_response_1.cookies['refresh_token'].value
        
        # Attempt to reuse refresh_token_1 (must fail due to blacklisting)
        self.client.cookies.clear()
        self.client.cookies['refresh_token'] = refresh_token_1
        replay_response = self.client.post(refresh_url)
        assert replay_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_rate_limiting(self):
        # The throttle rate is 5/minute. We make 5 requests, the 6th must return 429.
        url = reverse('token_obtain_pair')
        
        for _ in range(5):
            response = self.client.post(url, {
                'email': 'ratelimit@test.com',
                'password': 'WrongPassword!'
            })
            # Should be unauthorized, but NOT rate limited yet
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
            
        # 6th request must trigger rate limit
        response = self.client.post(url, {
            'email': 'ratelimit@test.com',
            'password': 'WrongPassword!'
        })
        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS

    def test_branch_isolation_prevention(self):
        branch_a = BranchFactory(id="branch-a", branch_name="Branch A", branch_code="BRA01")
        branch_b = BranchFactory(id="branch-b", branch_name="Branch B", branch_code="BRB01")
        
        user_a = UserFactory(email="pastora@test.com", role="pastor", branch=branch_a)
        
        # Create a donation for branch A
        donation = Donation.objects.create(
            branch=branch_a,
            amount=100.00,
            currency="USD",
            payment_method="Cash",
            date=timezone.now(),
            status="PENDING",
            created_by=user_a
        )
        
        # Authenticate user A
        self.client.force_authenticate(user=user_a)
        
        # Attempt to change donation branch to branch B
        url = reverse('donation-detail', args=[donation.id])
        response = self.client.patch(url, {
            'branch': branch_b.id
        }, format='json')
        
        # Validation error returned
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Branch assignment cannot be changed after creation." in str(response.data)

    def test_jwt_register_success(self):
        branch = BranchFactory()
        
        # Create admins who should receive notifications
        super_admin = UserFactory(email="superadmin@test.com", role="super_admin", branch=None)
        church_admin = UserFactory(email="churchadmin@test.com", role="church_admin", branch=branch)
        other_member = UserFactory(email="member@test.com", role="member", branch=branch)
        
        url = reverse('token_register')
        response = self.client.post(url, {
            'first_name': 'New',
            'last_name': 'Visitor',
            'email': 'newvisitor@test.com',
            'password': 'SecurePassword123!',
            'branch': branch.id,
            'gender': 'female'
        })
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert response.data['user']['email'] == 'newvisitor@test.com'
        assert response.data['user']['role'] == 'visitor'
        assert response.data['user']['branch']['id'] == branch.id
        assert response.data['user']['member_id'] is not None
        assert 'refresh_token' in response.cookies

        # Assert Member was created and linked correctly with matching gender
        from members.models import Member
        member = Member.objects.get(email="newvisitor@test.com")
        assert member.first_name == "New"
        assert member.last_name == "Visitor"
        assert member.gender == "female"
        assert member.status == "Visitor"
        assert str(member.id) == response.data['user']['member_id']

        # Assert notifications were created for the admins, but NOT for normal members
        from authentication.models import Notification
        super_admin_notifs = Notification.objects.filter(user=super_admin)
        church_admin_notifs = Notification.objects.filter(user=church_admin)
        member_notifs = Notification.objects.filter(user=other_member)

        assert super_admin_notifs.count() == 1
        assert super_admin_notifs.first().title == "New Visitor Registration"
        assert "newvisitor@test.com" in super_admin_notifs.first().message
        assert super_admin_notifs.first().action_url == f"/dashboard/members/{member.id}"

        assert church_admin_notifs.count() == 1
        assert church_admin_notifs.first().title == "New Visitor Registration"
        assert church_admin_notifs.first().action_url == f"/dashboard/members/{member.id}"
        
        assert member_notifs.count() == 0

    def test_jwt_register_duplicate_email(self):
        branch = BranchFactory()
        user = UserFactory(email="duplicate@test.com", password="SecurePassword123!", role="member", branch=branch)
        
        url = reverse('token_register')
        response = self.client.post(url, {
            'first_name': 'Another',
            'last_name': 'Visitor',
            'email': 'duplicate@test.com',
            'password': 'SecurePassword123!',
            'branch': branch.id
        })
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
