import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone

class ConnectGroup(models.Model):
    CATEGORY_CHOICES = (
        ('Home Fellowship', 'Home Fellowship'),
        ('Connect Group', 'Connect Group'),
        ('Bible Study', 'Bible Study'),
        ('Ministry Cell', 'Ministry Cell'),
    )

    FREQUENCY_CHOICES = (
        ('Weekly', 'Weekly'),
        ('Bi-Weekly', 'Bi-Weekly'),
        ('Monthly', 'Monthly'),
    )

    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='connect_groups', db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    leader = models.ForeignKey('members.Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='led_groups', db_index=True)
    assistant_leader = models.ForeignKey('members.Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='assistant_led_groups', db_index=True)
    
    location_name = models.CharField(max_length=255)
    location_address = models.TextField(blank=True, default='')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    frequency = models.CharField(max_length=50, choices=FREQUENCY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active', db_index=True)
    max_members = models.IntegerField(null=True, blank=True)
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_connectgroups')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_connectgroups')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class GroupMember(models.Model):
    ROLE_CHOICES = (
        ('Leader', 'Leader'),
        ('Assistant', 'Assistant'),
        ('Host', 'Host'),
        ('Member', 'Member'),
        ('Visitor', 'Visitor'),
    )

    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ConnectGroup, on_delete=models.CASCADE, related_name='members', db_index=True)
    member = models.ForeignKey('members.Member', on_delete=models.SET_NULL, null=True, blank=True, related_name='group_memberships', db_index=True)
    
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50)
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='Member', db_index=True)
    joined_at = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active', db_index=True)
    
    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_groupmembers')
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_groupmembers')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_groupmembers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in {self.group.name}"


class GroupAttendance(models.Model):
    SOURCE_CHOICES = (
        ('GROUP', 'Group Session'),
        ('EVENT_SYNC', 'Event Synchronization'),
        ('IMPORT', 'Import'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ConnectGroup, on_delete=models.CASCADE, related_name='attendance_logs', db_index=True)
    meeting_date = models.DateField(db_index=True)
    submitted_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_attendances')
    submitted_at = models.DateTimeField(auto_now_add=True)
    visitor_count = models.IntegerField(default=0)
    study_topic = models.CharField(max_length=255, blank=True, null=True)
    offering_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True, null=True)
    
    # Event integration
    linked_event_id = models.UUIDField(null=True, blank=True, db_index=True)
    attendance_source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default='GROUP', db_index=True)
    
    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_groupattendances')
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_groupattendances')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_groupattendances')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['group', 'meeting_date'],
                condition=models.Q(is_archived=False),
                name='unique_group_active_meeting_date'
            )
        ]

    def __str__(self):
        return f"Attendance for {self.group.name} on {self.meeting_date}"


class GroupAttendanceAttendee(models.Model):
    STATUS_CHOICES = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Excused', 'Excused'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance = models.ForeignKey(GroupAttendance, on_delete=models.CASCADE, related_name='attendees', db_index=True)
    member = models.ForeignKey(GroupMember, on_delete=models.CASCADE, related_name='attendance_records', db_index=True)
    attended = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.member.name} - {self.status}"


class GroupPrayerRequest(models.Model):
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Answered', 'Answered'),
        ('Archived', 'Archived'),
    )

    VISIBILITY_CHOICES = (
        ('PRIVATE', 'Private'),
        ('GROUP_LEADERS', 'Group Leaders'),
        ('GROUP_MEMBERS', 'Group Members'),
        ('BRANCH', 'Branch'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ConnectGroup, on_delete=models.CASCADE, related_name='prayer_requests', db_index=True)
    submitted_by_name = models.CharField(max_length=255)
    request_text = models.TextField()
    is_anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active', db_index=True)
    visibility_level = models.CharField(max_length=30, choices=VISIBILITY_CHOICES, default='PRIVATE', db_index=True)
    
    # Soft Delete fields
    is_archived = models.BooleanField(default=False, db_index=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    archived_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='archived_groupprayerrequests')
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_groupprayerrequests')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_groupprayerrequests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Prayer request from {self.submitted_by_name} in {self.group.name}"


class StudyOutline(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    theme = models.CharField(max_length=255)
    scripture_references = models.JSONField(default=list)
    introduction = models.TextField()
    discussion_questions = models.JSONField(default=list)
    application = models.TextField()
    
    # Versioning fields
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    previous_version = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='next_versions')
    
    # Audit fields
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_studyoutlines')
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_studyoutlines')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (v{self.version})"
