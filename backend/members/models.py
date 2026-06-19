import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

def default_communication_preferences():
    return {"email": True, "sms": True, "in_app": True}

class Member(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
    )
    
    MARITAL_STATUS_CHOICES = (
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Widowed', 'Widowed'),
        ('Divorced', 'Divorced'),
    )

    STATUS_CHOICES = (
        ('Visitor', 'Visitor'),
        ('New Convert', 'New Convert'),
        ('Member', 'Member'),
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Transferred', 'Transferred'),
        ('Deceased', 'Deceased'),
    )

    MEMBER_TYPE_CHOICES = (
        ('Regular', 'Regular'),
        ('Leader', 'Leader'),
        ('Clergy', 'Clergy'),
    )

    BAPTISM_STATUS_CHOICES = (
        ('Not Baptized', 'Not Baptized'),
        ('Water Baptized', 'Water Baptized'),
        ('Holy Spirit Baptized', 'Holy Spirit Baptized'),
    )

    SALVATION_STATUS_CHOICES = (
        ('Born Again', 'Born Again'),
        ('Seeking', 'Seeking'),
    )

    DONOR_STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
        ('Guest', 'Guest'),
        ('Non-Donor', 'Non-Donor'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='members')
    family = models.ForeignKey('Family', on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    
    membership_number = models.CharField(max_length=50, unique=True, editable=False)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_of_birth = models.DateField(null=True, blank=True)
    marriage_anniversary_date = models.DateField(null=True, blank=True)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, default='Single')
    occupation = models.CharField(max_length=255, null=True, blank=True)
    education_level = models.CharField(max_length=255, null=True, blank=True)
    national_id_passport = models.CharField(max_length=100, null=True, blank=True)
    
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=50)
    address = models.TextField(blank=True, default='')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Visitor')
    member_type = models.CharField(max_length=20, choices=MEMBER_TYPE_CHOICES, default='Regular')
    
    # Spiritual details
    baptism_status = models.CharField(max_length=30, choices=BAPTISM_STATUS_CHOICES, default='Not Baptized')
    baptism_date = models.DateField(null=True, blank=True)
    baptism_place = models.CharField(max_length=255, null=True, blank=True)
    baptism_officiant = models.CharField(max_length=255, null=True, blank=True)
    
    salvation_status = models.CharField(max_length=20, choices=SALVATION_STATUS_CHOICES, default='Seeking')
    salvation_date = models.DateField(null=True, blank=True)
    join_date = models.DateField(default=timezone.now)
    
    # Emergency Contacts
    emergency_name = models.CharField(max_length=255, null=True, blank=True)
    emergency_relationship = models.CharField(max_length=100, null=True, blank=True)
    emergency_phone = models.CharField(max_length=50, null=True, blank=True)
    
    # Notes & Legacy
    pastoral_notes = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)  # Backward compatibility
    role = models.CharField(max_length=50, null=True, blank=True)  # Backward compatibility
    ministries = models.JSONField(default=list, blank=True)  # List of strings
    
    # Metadata & Custom Fields
    custom_fields = models.JSONField(default=dict, blank=True)
    communication_preferences = models.JSONField(
        default=default_communication_preferences,
        blank=True
    )
    
    # Giving & Pledges Integration
    donor_status = models.CharField(max_length=20, choices=DONOR_STATUS_CHOICES, default='Non-Donor')
    recurring_giving_opt_in = models.BooleanField(default=False)
    
    # Soft Delete & Auditing
    is_archived = models.BooleanField(default=False)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_members'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_members'
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_members'
    )

    def save(self, *args, **kwargs):
        # Generate sequential membership number if not set
        if not self.membership_number:
            year = self.join_date.year if self.join_date else timezone.now().year
            prefix = f"MBR-{year}-"
            
            last_member = Member.objects.filter(membership_number__startswith=prefix).order_by('-membership_number').first()
            if last_member:
                try:
                    last_seq = int(last_member.membership_number.split('-')[-1])
                except ValueError:
                    last_seq = 0
            else:
                last_seq = 0
                
            self.membership_number = f"{prefix}{str(last_seq + 1).zfill(6)}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.membership_number})"


class Family(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='families')
    name = models.CharField(max_length=255)
    head_of_household = models.ForeignKey(
        'Member',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_families'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_families'
    )

    def __str__(self):
        return self.name


class FamilyRelationship(models.Model):
    RELATIONSHIP_TYPES = (
        ('Spouse', 'Spouse'),
        ('Parent', 'Parent'),
        ('Child', 'Child'),
        ('Sibling', 'Sibling'),
        ('Guardian', 'Guardian'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='relationships_from')
    to_member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='relationships_to')
    relationship_type = models.CharField(max_length=20, choices=RELATIONSHIP_TYPES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_relationships'
    )

    def clean(self):
        if self.from_member == self.to_member:
            raise ValidationError("Cannot define a self-referencing relationship.")
            
        # Prevent duplicate relationship links regardless of direction
        exists = FamilyRelationship.objects.filter(
            models.Q(from_member=self.from_member, to_member=self.to_member) |
            models.Q(from_member=self.to_member, to_member=self.from_member)
        ).exclude(id=self.id).exists()
        
        if exists:
            raise ValidationError("A relationship already exists between these members.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.from_member} is {self.relationship_type} of {self.to_member}"


class MemberLifecycleTimeline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey('Member', on_delete=models.CASCADE, related_name='lifecycle_timeline')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='lifecycle_changes'
    )
    changed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.member} transitioned from {self.previous_status} to {self.new_status}"

