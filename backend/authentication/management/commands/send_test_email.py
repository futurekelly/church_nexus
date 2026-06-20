from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Sends a test email to verify the SMTP email configuration.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--recipient',
            type=str,
            default='futurekelly360@gmail.com',
            help='The recipient email address (default: futurekelly360@gmail.com)'
        )

    def handle(self, *args, **options):
        recipient = options['recipient']
        
        self.stdout.write(f"Attempting to send test email to {recipient}...")
        self.stdout.write(f"Using EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
        self.stdout.write(f"Using EMAIL_HOST: {getattr(settings, 'EMAIL_HOST', 'N/A')}")
        self.stdout.write(f"Using DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
        
        try:
            subject = 'Church Nexus SMTP Test Email'
            message = (
                'Hello!\n\n'
                'This is a test email sent from the Church Nexus SaaS backend to verify '
                'that the SMTP/Gmail email configuration is working correctly.\n\n'
                'If you received this, the configuration is working successfully!\n'
            )
            
            # Send the email
            sent_count = send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )
            
            if sent_count > 0:
                self.stdout.write(self.style.SUCCESS(f"Successfully sent test email to {recipient}!"))
            else:
                self.stdout.write(self.style.WARNING("Email send returned 0 (no email sent)."))
                
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to send test email: {str(e)}"))
