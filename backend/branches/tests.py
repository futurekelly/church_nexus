import pytest
from rest_framework import status
from rest_framework.test import APIClient
from branches.models import Branch, Inquiry
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def hq_branch(db):
    return Branch.objects.get(id='hq-branch')

@pytest.fixture
def test_user(db, hq_branch):
    return User.objects.create_user(
        email='admin@example.com',
        password='Password123!',
        first_name='Admin',
        last_name='User',
        role='church_admin',
        branch=hq_branch
    )

@pytest.mark.django_db
def test_public_inquiry_submission_success(api_client, hq_branch):
    # Verify anonymous user can submit inquiries
    assert Inquiry.objects.count() == 0
    
    response = api_client.post(
        '/api/inquiries/',
        {
            'branch': hq_branch.id,
            'name': 'Visitor Name',
            'email': 'visitor@example.com',
            'subject': 'Inquiry Subject',
            'message': 'This is a test message.'
        },
        format='json'
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    assert Inquiry.objects.count() == 1
    inquiry = Inquiry.objects.first()
    assert inquiry.name == 'Visitor Name'
    assert inquiry.subject == 'Inquiry Subject'

@pytest.mark.django_db
def test_get_inquiries_permission_denied_anonymous(api_client):
    # Verify anonymous user cannot fetch inquiries list
    response = api_client.get('/api/inquiries/')
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_get_inquiries_success_authenticated(api_client, test_user, hq_branch):
    # Create an inquiry for the branch
    Inquiry.objects.create(
        branch=hq_branch,
        name='Tester',
        email='tester@example.com',
        subject='Questions',
        message='Need info.'
    )
    
    # Authenticate client
    api_client.force_authenticate(user=test_user)
    response = api_client.get('/api/inquiries/')
    
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['name'] == 'Tester'

