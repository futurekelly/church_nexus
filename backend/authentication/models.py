import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ValidationError

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'super_admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('church_admin', 'Church Admin'),
        ('pastor', 'Pastor'),
        ('treasurer', 'Treasurer'),
        ('member', 'Member'),
        ('visitor', 'Visitor'),
    )

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    member_id = models.CharField(max_length=50, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def clean(self):
        super().clean()
        if self.role != 'super_admin' and self.branch is None:
            raise ValidationError({
                'branch': 'A branch assignment is required for all roles except Super Admin.'
            })

    def save(self, *args, **kwargs):
        self.full_clean(exclude=['password'])
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        constraints = [
            models.CheckConstraint(
                check=models.Q(role='super_admin') | models.Q(branch__isnull=False),
                name='check_branch_assignment_by_role'
            )
        ]


class Notification(models.Model):
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )
    STATUS_CHOICES = (
        ('Sent', 'Sent'),
        ('Failed', 'Failed'),
        ('Pending', 'Pending'),
    )
    CHANNEL_CHOICES = (
        ('In-App', 'In-App'),
        ('Email', 'Email'),
        ('SMS', 'SMS'),
        ('Push', 'Push'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    priority = models.CharField(max_length=15, choices=PRIORITY_CHOICES, default='Medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Sent')
    read = models.BooleanField(default=False)
    
    # Analytics Tracking
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Mobile Deep-Link Support
    action_url = models.CharField(max_length=500, null=True, blank=True)
    delivery_channel = models.CharField(max_length=15, choices=CHANNEL_CHOICES, default='In-App')
    branch = models.ForeignKey('branches.Branch', on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} for {self.user.email}"


class Announcement(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Scheduled', 'Scheduled'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    )
    AUDIENCE_CHOICES = (
        ('Global', 'Global'),
        ('Branch', 'Branch'),
        ('Leaders', 'Leaders'),
        ('Members', 'Members'),
        ('Visitors', 'Visitors'),
        ('Custom', 'Custom'),
    )
    PRIORITY_CHOICES = (
        ('Normal', 'Normal'),
        ('High', 'High'),
        ('Urgent', 'Urgent'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Draft')
    audience_scope = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='Global')
    branch = models.ForeignKey('branches.Branch', on_delete=models.SET_NULL, null=True, blank=True, related_name='announcements')
    target_roles = models.JSONField(default=list, blank=True) # Array of string roles, e.g. ["Pastor", "Treasurer"]
    priority = models.CharField(max_length=15, choices=PRIORITY_CHOICES, default='Normal')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_announcements')
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q

@receiver(post_save, sender=User)
def create_visitor_registration_notification(sender, instance, created, **kwargs):
    if created and instance.role == 'visitor':
        admins = User.objects.filter(
            Q(role='super_admin') | 
            Q(role='church_admin', branch=instance.branch)
        )
        for admin in admins:
            Notification.objects.create(
                user=admin,
                title="New Visitor Registration",
                message=f"{instance.first_name} {instance.last_name} ({instance.email}) registered and is pending approval.",
                priority="High",
                delivery_channel="In-App",
                action_url=f"/admin/authentication/user/{instance.pk}/change/",
                branch=instance.branch
            )


