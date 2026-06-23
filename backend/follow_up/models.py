import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

class VisitorProfile(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='visitors')
    member = models.OneToOneField('members.Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='visitor_profile')
    
    membership_number = models.CharField(max_length=50, unique=True, editable=False)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(null=True, blank=True)
    phone_number = models.CharField(max_length=50)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    date_joined = models.DateTimeField(default=timezone.now)
    
    first_time_visitor = models.BooleanField(default=True)
    invited_by = models.CharField(max_length=100, null=True, blank=True)
    visit_reason = models.TextField(null=True, blank=True)
    spiritual_background = models.CharField(max_length=100, null=True, blank=True)
    prayer_request = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='archived_visitors'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_visitors'
    )

    def save(self, *args, **kwargs):
        # Generate sequential membership number for visitors
        if not self.membership_number:
            year = self.date_joined.year if self.date_joined else timezone.now().year
            prefix = f"VST-{year}-"
            
            last_visitor = VisitorProfile.objects.filter(membership_number__startswith=prefix).order_by('-membership_number').first()
            if last_visitor:
                try:
                    last_seq = int(last_visitor.membership_number.split('-')[-1])
                except ValueError:
                    last_seq = 0
            else:
                last_seq = 0
                
            self.membership_number = f"{prefix}{str(last_seq + 1).zfill(6)}"
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.membership_number})"


class FollowUpTicket(models.Model):
    STATUS_CHOICES = (
        ('New', 'New'),
        ('Contacted', 'Contacted'),
        ('Following Up', 'Following Up'),
        ('Integrated', 'Integrated'),
        ('Inactive', 'Inactive'),
    )

    SOURCE_CHOICES = (
        ('Manual', 'Manual'),
        ('Attendance Absentee', 'Attendance Absentee'),
        ('Attendance Visitor Scan', 'Attendance Visitor Scan'),
        ('Prayer Crisis', 'Prayer Crisis'),
        ('Event RSVP', 'Event RSVP'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='follow_up_tickets')
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='tickets')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New', db_index=True)
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='Manual', db_index=True)
    assigned_pastor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_follow_up_tickets'
    )
    notes = models.TextField(null=True, blank=True)
    is_completed = models.BooleanField(default=False, db_index=True)
    integrated_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_status = self.status

    def clean(self):
        super().clean()
        
        # Enforce that assigned pastor belongs to the same branch (unless super_admin / null)
        if self.assigned_pastor and self.assigned_pastor.role != 'super_admin':
            if self.assigned_pastor.branch != self.branch:
                raise ValidationError({
                    'assigned_pastor': 'Assigned pastor must belong to the same branch as the follow-up ticket.'
                })

        # Validate FSM status transitions if the ticket is already saved in the DB
        if self.pk:
            old_status = self._original_status
            new_status = self.status
            
            if old_status != new_status:
                # Integrated is a terminal state
                if old_status == 'Integrated':
                    raise ValidationError(f"Cannot transition out of terminal state 'Integrated'.")
                
                # Transition rules mapping
                valid_transitions = {
                    'New': ['Contacted', 'Inactive'],
                    'Contacted': ['Following Up', 'Inactive'],
                    'Following Up': ['Integrated', 'Inactive', 'Contacted'],
                    'Inactive': ['New', 'Contacted'],
                }
                
                allowed_next_states = valid_transitions.get(old_status, [])
                if new_status not in allowed_next_states:
                    raise ValidationError(f"Invalid transition from '{old_status}' to '{new_status}'. Allowed states are: {', '.join(allowed_next_states)}")

    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Update completeness flags based on status
        if self.status == 'Integrated':
            self.is_completed = True
            if not self.integrated_at:
                self.integrated_at = timezone.now()
        elif self.status == 'Inactive':
            self.is_completed = True
            self.integrated_at = None
        else:
            self.is_completed = False
            self.integrated_at = None
            
        super().save(*args, **kwargs)
        self._original_status = self.status

    def __str__(self):
        return f"Ticket for {self.visitor.first_name} {self.visitor.last_name} - {self.status}"


class ContactHistoryLog(models.Model):
    INTERACTION_CHOICES = (
        ('Call', 'Call'),
        ('Email', 'Email'),
        ('Meeting', 'Meeting'),
        ('Visit', 'Visit'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visitor = models.ForeignKey(VisitorProfile, on_delete=models.CASCADE, related_name='contact_logs')
    ticket = models.ForeignKey(FollowUpTicket, on_delete=models.CASCADE, related_name='contact_logs', null=True, blank=True)
    interaction_type = models.CharField(max_length=20, choices=INTERACTION_CHOICES)
    notes = models.TextField()
    contact_date = models.DateTimeField(default=timezone.now)
    contacted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='logged_follow_up_interactions'
    )

    def clean(self):
        super().clean()
        # Ensure log and visitor match
        if self.ticket and self.ticket.visitor != self.visitor:
            raise ValidationError("Contact log visitor must match follow-up ticket visitor.")
            
    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.interaction_type} log for {self.visitor.first_name} {self.visitor.last_name} by {self.contacted_by.email}"
