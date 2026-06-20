import pytest
import os
from django.core import mail
from django.core.management import call_command
from django.conf import settings

@pytest.mark.django_db
def test_send_test_email_management_command():
    # Verify the management command runs successfully and sends an email.
    # Django's test runner automatically redirects email to locmem outbox.
    assert len(mail.outbox) == 0
    
    # Run command
    call_command('send_test_email', recipient='test_recipient@example.com')
    
    # Verify email was captured in outbox
    assert len(mail.outbox) == 1
    email = mail.outbox[0]
    assert email.subject == 'Church Nexus SMTP Test Email'
    assert 'test_recipient@example.com' in email.to
    # Standard fallback from setting or environment
    assert email.from_email in [settings.DEFAULT_FROM_EMAIL, 'futurekelly360@gmail.com']

def test_settings_email_backend_logic():
    # Test our settings logic directly based on presence of env variables.
    # We import the settings module directly to bypass the test runner's locmem override.
    import church_nexus.settings as cn_settings
    
    user = os.environ.get('EMAIL_HOST_USER', '')
    password = os.environ.get('EMAIL_HOST_PASSWORD', '')
    
    # We inspect the global settings backend
    if user and password:
        assert cn_settings.EMAIL_BACKEND == 'django.core.mail.backends.smtp.EmailBackend'
    else:
        assert cn_settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend'

