import pytest
from django.core import mail
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        email='testreset@example.com',
        password='OriginalPassword123!',
        first_name='Test',
        last_name='User',
        role='member',
        branch_id='hq-branch'
    )

@pytest.mark.django_db
def test_password_reset_request_success(api_client, test_user):
    # Verify requesting a password reset sends an email containing the reset token
    assert len(mail.outbox) == 0
    
    response = api_client.post(
        '/api/auth/password-reset/',
        {'email': 'testreset@example.com'},
        format='json'
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert len(mail.outbox) == 1
    
    email = mail.outbox[0]
    assert 'testreset@example.com' in email.to
    assert 'Reset your Church Nexus password' in email.subject
    assert 'uid=' in email.body
    assert 'token=' in email.body

@pytest.mark.django_db
def test_password_reset_request_nonexistent_email(api_client):
    # Security: requesting a reset for a non-existent email should return 200 OK without sending mail
    assert len(mail.outbox) == 0
    
    response = api_client.post(
        '/api/auth/password-reset/',
        {'email': 'nonexistent@example.com'},
        format='json'
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert len(mail.outbox) == 0

@pytest.mark.django_db
def test_password_reset_confirm_success(api_client, test_user):
    # Verify confirming a password reset with a valid token changes the password
    uid = urlsafe_base64_encode(force_bytes(test_user.pk))
    token = default_token_generator.make_token(test_user)
    
    response = api_client.post(
        '/api/auth/password-reset/confirm/',
        {
            'uid': uid,
            'token': token,
            'new_password': 'NewSecurePassword123!'
        },
        format='json'
    )
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['detail'] == 'Password has been reset successfully.'
    
    # Reload user and check if password is changed
    test_user.refresh_from_db()
    assert test_user.check_password('NewSecurePassword123!')
    assert not test_user.check_password('OriginalPassword123!')

@pytest.mark.django_db
def test_password_reset_confirm_invalid_token(api_client, test_user):
    # Verify confirming with an invalid token fails
    uid = urlsafe_base64_encode(force_bytes(test_user.pk))
    
    response = api_client.post(
        '/api/auth/password-reset/confirm/',
        {
            'uid': uid,
            'token': 'invalid-token-value',
            'new_password': 'NewSecurePassword123!'
        },
        format='json'
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data
    
    # Password should not have changed
    test_user.refresh_from_db()
    assert test_user.check_password('OriginalPassword123!')

@pytest.mark.django_db
def test_password_reset_confirm_invalid_uid(api_client, test_user):
    # Verify confirming with an invalid base64 UID fails
    token = default_token_generator.make_token(test_user)
    
    response = api_client.post(
        '/api/auth/password-reset/confirm/',
        {
            'uid': 'invaliduid123',
            'token': token,
            'new_password': 'NewSecurePassword123!'
        },
        format='json'
    )
    
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert 'error' in response.data
