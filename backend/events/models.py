import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

class Event(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Scheduled', 'Scheduled'),
        ('Published', 'Published'),
        ('Open', 'Open'),
        ('In Progress', 'In Progress'),
        ('Closed', 'Closed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Archived', 'Archived'),
    )

    EVENT_TYPES = (
        ('Sunday Service', 'Sunday Service'),
        ('Bible Study', 'Bible Study'),
        ('Prayer Meeting', 'Prayer Meeting'),
        ('Youth Meeting', 'Youth Meeting'),
        ('Conference', 'Conference'),
        ('Seminar', 'Seminar'),
        ('Outreach', 'Outreach'),
        ('Livestream Event', 'Livestream Event'),
        ('Special Event', 'Special Event'),
    )

    RECURRENCE_CHOICES = (
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
    )

    ALLOWED_TRANSITIONS = {
        'Draft': {'Published'},
        'Published': {'Open', 'Cancelled'},
        'Open': {'Closed', 'Cancelled'},
        'Closed': {'Completed', 'Cancelled'},
        'Completed': {'Archived'},
        'Cancelled': {'Archived'},
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='events', db_index=True)
    group_id = models.UUIDField(null=True, blank=True, db_index=True)
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES, db_index=True)
    start_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField()
    location = models.CharField(max_length=255)
    organizer = models.CharField(max_length=255)
    capacity = models.IntegerField(default=0)
    waitlist_enabled = models.BooleanField(default=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Draft', db_index=True)
    cover_image = models.CharField(max_length=500, blank=True, default='')

    # Recurrence structure
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=30, choices=RECURRENCE_CHOICES, null=True, blank=True)
    parent_event = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='recurring_instances')

    # Attendance Snapshot fields
    attendance_snapshot = models.JSONField(null=True, blank=True)
    snapshot_generated_at = models.DateTimeField(null=True, blank=True)
    snapshot_version = models.IntegerField(default=1)

    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_events')

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_events')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_events')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date cannot be after end date.")
        
        # Lifecycle Transition Enforcements
        if self.pk:
            try:
                original = Event.objects.get(pk=self.pk)
                if original.status != self.status:
                    allowed = self.ALLOWED_TRANSITIONS.get(original.status, set())
                    if self.status not in allowed:
                        raise ValidationError(f"Transition from {original.status} to {self.status} is not allowed.")
            except Event.DoesNotExist:
                pass

    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Generate attendance snapshot if transitioning to Closed or Completed
        if self.pk:
            try:
                original = Event.objects.get(pk=self.pk)
                if original.status != self.status and self.status in ['Closed', 'Completed']:
                    self.generate_snapshot()
            except Event.DoesNotExist:
                pass

        super().save(*args, **kwargs)

    def generate_snapshot(self):
        registrations = self.registrations.filter(is_archived=False)
        snapshot = {
            'total_registrations': registrations.count(),
            'total_checked_in': registrations.filter(attendance_status='checked_in').count(),
            'total_absent': registrations.filter(attendance_status='absent').count(),
            'attendees': [
                {
                    'registration_id': str(reg.id),
                    'member_id': str(reg.member_id) if reg.member_id else None,
                    'visitor_name': reg.visitor_name,
                    'visitor_email': reg.visitor_email,
                    'status': reg.status,
                    'attendance_status': reg.attendance_status,
                    'checked_in_at': reg.check_ins.filter(is_archived=False).first().checked_in_at.isoformat() if reg.check_ins.filter(is_archived=False).exists() else None
                }
                for reg in registrations
            ]
        }
        self.attendance_snapshot = snapshot
        self.snapshot_generated_at = timezone.now()

    def __str__(self):
        return f"{self.title} ({self.status})"


class EventRegistration(models.Model):
    STATUS_CHOICES = (
        ('REGISTERED', 'Registered'),
        ('WAITLISTED', 'Waitlisted'),
        ('PROMOTED', 'Promoted'),
        ('CANCELLED', 'Cancelled'),
        ('ATTENDED', 'Attended'),
        ('NO_SHOW', 'No Show'),
    )

    ATTENDANCE_STATUS_CHOICES = (
        ('registered', 'Registered'),
        ('checked_in', 'Checked In'),
        ('absent', 'Absent'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='event_registrations')
    member = models.ForeignKey('members.Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='event_registrations')
    
    visitor_name = models.CharField(max_length=255, null=True, blank=True)
    visitor_email = models.EmailField(null=True, blank=True)
    visitor_phone = models.CharField(max_length=50, null=True, blank=True)
    
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='REGISTERED', db_index=True)
    registration_date = models.DateTimeField(default=timezone.now)
    attendance_status = models.CharField(max_length=30, choices=ATTENDANCE_STATUS_CHOICES, default='registered', db_index=True)
    notes = models.TextField(blank=True, null=True)

    # Future QR check-in readiness
    registration_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_eventregistrations')

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_eventregistrations')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_eventregistrations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if not self.member and not self.visitor_name:
            raise ValidationError("Either a member assignment or guest visitor details are required.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        name = f"{self.member.first_name} {self.member.last_name}" if self.member else self.visitor_name
        return f"{name} - {self.event.title} ({self.status})"


class EventCheckIn(models.Model):
    METHOD_CHOICES = (
        ('MANUAL', 'Manual'),
        ('QR_CODE', 'QR Code'),
        ('SELF_SERVICE', 'Self Service'),
        ('IMPORT', 'Import'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    registration = models.ForeignKey(EventRegistration, on_delete=models.CASCADE, related_name='check_ins', db_index=True)
    
    checked_in_at = models.DateTimeField(default=timezone.now, db_index=True)
    checked_in_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='performed_checkins')
    check_in_method = models.CharField(max_length=30, choices=METHOD_CHOICES, default='MANUAL', db_index=True)

    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_eventcheckins')

    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_eventcheckins')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_eventcheckins')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Check-In for {self.registration}"


class EventResource(models.Model):
    RESOURCE_TYPES = (
        ('Venue', 'Venue'),
        ('Equipment', 'Equipment'),
    )

    STATUS_CHOICES = (
        ('Available', 'Available'),
        ('Maintenance', 'Maintenance'),
        ('Reserved', 'Reserved'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='resources', db_index=True)
    name = models.CharField(max_length=255)
    resource_type = models.CharField(max_length=30, choices=RESOURCE_TYPES)
    capacity = models.IntegerField(default=0)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Available', db_index=True)

    def __str__(self):
        return f"{self.name} ({self.resource_type})"


class ResourceBooking(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='resource_bookings', db_index=True)
    resource = models.ForeignKey(EventResource, on_delete=models.CASCADE, related_name='bookings', db_index=True)
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)
    
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_bookings')
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()
        if self.start_time and self.end_time and self.start_time > self.end_time:
            raise ValidationError("Start time cannot be after end time.")
        
        # Conflict Validation: overlapping bookings for the same resource
        if self.status in ['Pending', 'Approved']:
            overlapping = ResourceBooking.objects.filter(
                resource=self.resource,
                status__in=['Pending', 'Approved']
            ).exclude(id=self.id)
            
            # (start_A < end_B) and (end_A > start_B)
            overlap_exists = overlapping.filter(
                start_time__lt=self.end_time,
                end_time__gt=self.start_time
            ).exists()
            
            if overlap_exists:
                raise ValidationError("Resource is already booked during this time window.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.resource.name} booked for {self.event.title}"
