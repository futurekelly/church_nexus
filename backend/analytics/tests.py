import pytest
from decimal import Decimal
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta

from branches.models import Branch
from authentication.models import User
from members.models import Member
from donations.models import Donation, Expense
from events.models import Event, EventRegistration
from analytics.models import PerformanceKPISnapshot  # noqa: F401

@pytest.fixture
def setup_analytics_data(db):
    branch_a = Branch.objects.create(id="br-a", branch_name="Branch Alpha", branch_code="BRA")
    branch_b = Branch.objects.create(id="br-b", branch_name="Branch Beta", branch_code="BRB")
    
    # Users
    super_admin = User.objects.create_user(
        email="super@test.com", password="password123", role="super_admin", branch=None
    )
    admin_a = User.objects.create_user(
        email="admina@test.com", password="password123", role="church_admin", branch=branch_a
    )
    admin_b = User.objects.create_user(
        email="adminb@test.com", password="password123", role="church_admin", branch=branch_b
    )
    
    # Members for demographics (dob/gender/marital)
    # Branch A: 1 child, 1 youth, 1 senior. 2 males, 1 female.
    now_year = timezone.now().year
    Member.objects.create(
        branch=branch_a, first_name="C1", last_name="L1", email="c1@test.com",
        gender="male", date_of_birth=date(now_year - 8, 1, 1), marital_status="Single", status="Active"
    )
    Member.objects.create(
        branch=branch_a, first_name="Y1", last_name="L2", email="y1@test.com",
        gender="female", date_of_birth=date(now_year - 22, 1, 1), marital_status="Single", status="Active"
    )
    Member.objects.create(
        branch=branch_a, first_name="S1", last_name="L3", email="s1@test.com",
        gender="male", date_of_birth=date(now_year - 65, 1, 1), marital_status="Married", status="Active"
    )
    
    # Financial data (Donations and Expenses)
    Donation.objects.create(
        branch=branch_a, amount=Decimal('500.00'), currency='USD',
        payment_method='Bank Transfer', date=timezone.now(), status='COMPLETED', notes='Tithe for General fund'
    )
    Donation.objects.create(
        branch=branch_a, amount=Decimal('300.00'), currency='USD',
        payment_method='Cash', date=timezone.now() - timedelta(days=10), status='COMPLETED', notes='General offering'
    )
    Expense.objects.create(
        branch=branch_a, payee="Utility Co", amount=Decimal('100.00'), currency='USD',
        date=timezone.now(), category='Utilities', payment_method='Bank Transfer', status='APPROVED'
    )
    
    # Events and Registrations
    event = Event.objects.create(
        branch=branch_a, title="Sunday Service", event_type="Sunday Service",
        start_date=timezone.now() - timedelta(days=2), end_date=timezone.now() - timedelta(days=2),
        location="Main hall", organizer="Pastor", status="Completed"
    )
    # 2 checkins, 1 absent
    EventRegistration.objects.create(
        event=event, status='REGISTERED', attendance_status='checked_in',
        registration_date=timezone.now(), visitor_name="Vis1", visitor_email="v1@test.com"
    )
    EventRegistration.objects.create(
        event=event, status='REGISTERED', attendance_status='checked_in',
        registration_date=timezone.now(), visitor_name="Vis2", visitor_email="v2@test.com"
    )
    EventRegistration.objects.create(
        event=event, status='REGISTERED', attendance_status='absent',
        registration_date=timezone.now(), visitor_name="Vis3", visitor_email="v3@test.com"
    )
    
    return {
        'branch_a': branch_a,
        'branch_b': branch_b,
        'super_admin': super_admin,
        'admin_a': admin_a,
        'admin_b': admin_b,
        'event': event
    }

@pytest.mark.django_db
def test_kpi_snapshot_view_branch_isolation(setup_analytics_data):
    client = APIClient()
    
    # Authenticate as admin_a (should only see Branch Alpha metrics)
    client.force_authenticate(user=setup_analytics_data['admin_a'])
    
    response = client.get('/api/analytics/kpi-snapshot/', {'period': 'Monthly'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['branch_id'] == setup_analytics_data['branch_a'].id
    assert response.data['totalMembers'] == 3
    assert response.data['totalGivingYTD'] == 800.0
    
    # Try to explicitly request Branch Beta's data (must still return Alpha due to branch isolation)
    response = client.get('/api/analytics/kpi-snapshot/', {'period': 'Monthly', 'branch_id': setup_analytics_data['branch_b'].id})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['branch_id'] == setup_analytics_data['branch_a'].id # isolated to branch_a!
    
    # Authenticate as super_admin (can view branch_b or aggregated all)
    client.force_authenticate(user=setup_analytics_data['super_admin'])
    response = client.get('/api/analytics/kpi-snapshot/', {'period': 'Monthly', 'branch_id': 'all'})
    assert response.status_code == status.HTTP_200_OK
    assert response.data['branch_id'] == 'all'
    assert response.data['totalMembers'] == 3 # sum of all active
    assert response.data['totalGivingYTD'] == 800.0


@pytest.mark.django_db
def test_attendance_analytics_view(setup_analytics_data):
    client = APIClient()
    client.force_authenticate(user=setup_analytics_data['admin_a'])
    
    response = client.get('/api/analytics/attendance/', {'period': 'Weekly'})
    assert response.status_code == status.HTTP_200_OK
    assert 'labels' in response.data
    assert len(response.data['attendingCounts']) > 0
    # Last week bin should capture our checked_in count
    assert sum(response.data['attendingCounts']) == 2
    assert sum(response.data['noShowCounts']) == 1


@pytest.mark.django_db
def test_giving_analytics_view(setup_analytics_data):
    client = APIClient()
    client.force_authenticate(user=setup_analytics_data['admin_a'])
    
    response = client.get('/api/analytics/giving/', {'period': 'Weekly'})
    assert response.status_code == status.HTTP_200_OK
    assert sum(response.data['titheAmounts']) == 500.0 # general tithe Notes
    assert sum(response.data['offeringAmounts']) == 300.0 # general offering Notes
    assert sum(response.data['expenseAmounts']) == 100.0
    assert response.data['netMargin'] == 700.0 # 800 - 100


@pytest.mark.django_db
def test_demographics_view(setup_analytics_data):
    client = APIClient()
    client.force_authenticate(user=setup_analytics_data['admin_a'])
    
    response = client.get('/api/analytics/demographics/')
    assert response.status_code == status.HTTP_200_OK
    
    # verify age bands counts
    age_bands = response.data['ageBands']
    children = next(x for x in age_bands if 'Children' in x['name'])
    youth = next(x for x in age_bands if 'Youth' in x['name'])
    senior = next(x for x in age_bands if 'Senior' in x['name'])
    
    assert children['value'] == 1
    assert youth['value'] == 1
    assert senior['value'] == 1
    
    # gender splits
    gender = response.data['genderSplits']
    male = next(x for x in gender if x['name'] == 'Male')
    female = next(x for x in gender if x['name'] == 'Female')
    assert male['value'] == 2
    assert female['value'] == 1
