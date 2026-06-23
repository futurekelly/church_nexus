import uuid
import random
import string
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

def generate_security_code():
    chars = string.ascii_uppercase + string.digits
    code = ''.join(random.choices(chars, k=4))
    return f"KK-{code}"

def generate_unique_security_code(branch):
    today = timezone.localdate()
    while True:
        code = generate_security_code()
        # Avoid collisions for active check-ins on the same day
        if not CheckInLog.objects.filter(
            branch=branch,
            security_code=code,
            status='Checked In',
            check_in_time__date=today
        ).exists():
            return code


class Classroom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='classrooms', db_index=True)
    
    name = models.CharField(max_length=100)
    min_age = models.IntegerField(default=0, help_text="Minimum age in years (inclusive)")
    max_age = models.IntegerField(default=12, help_text="Maximum age in years (inclusive)")
    capacity = models.IntegerField(default=20)
    room_leader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='led_classrooms'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        if self.min_age < 0:
            raise ValidationError({'min_age': 'Minimum age cannot be negative.'})
        if self.max_age < self.min_age:
            raise ValidationError({'max_age': 'Maximum age cannot be less than minimum age.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.min_age}-{self.max_age} yrs)"


class Child(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )
    STATUS_CHOICES = (
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='children', db_index=True)
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField(db_index=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    
    # Parent/Guardian linkage (ManyToManyField to Member model)
    parents = models.ManyToManyField('members.Member', related_name='children', blank=True)
    
    allergy_alerts = models.TextField(null=True, blank=True)
    special_needs = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    status = models.DynamicField = models.CharField(max_length=15, choices=STATUS_CHOICES, default='Active', db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def age(self):
        today = timezone.localdate()
        born = self.birth_date
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

    def clean(self):
        super().clean()
        if self.birth_date and self.birth_date > timezone.localdate():
            raise ValidationError({'birth_date': 'Date of birth cannot be in the future.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.age} yrs)"


class CheckInLog(models.Model):
    STATUS_CHOICES = (
        ('Checked In', 'Checked In'),
        ('Checked Out', 'Checked Out'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='check_in_logs', db_index=True)
    
    child = models.ForeignKey(Child, on_delete=models.CASCADE, related_name='check_in_logs', db_index=True)
    classroom = models.ForeignKey(Classroom, on_delete=models.PROTECT, related_name='check_in_logs', db_index=True)
    
    check_in_time = models.DateTimeField(default=timezone.now, db_index=True)
    check_out_time = models.DateTimeField(null=True, blank=True, db_index=True)
    
    security_code = models.CharField(max_length=10, db_index=True)
    
    # Dropped off / Picked up by Members
    checked_in_by = models.ForeignKey('members.Member', on_delete=models.PROTECT, related_name='checked_in_logs')
    checked_out_by = models.ForeignKey('members.Member', null=True, blank=True, on_delete=models.PROTECT, related_name='checked_out_logs')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Checked In', db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()
        
        # Enforce that child and classroom must belong to the same branch as the check-in log
        if self.child and self.child.branch != self.branch:
            raise ValidationError({'child': 'Child must belong to the same branch as the check-in log.'})
        
        if self.classroom and self.classroom.branch != self.branch:
            raise ValidationError({'classroom': 'Classroom must belong to the same branch as the check-in log.'})
            
        # Verify check-out logic
        if self.status == 'Checked Out':
            if not self.check_out_time:
                self.check_out_time = timezone.now()
            if not self.checked_out_by:
                raise ValidationError({'checked_out_by': 'Who checked the child out must be specified.'})
            if self.check_out_time < self.check_in_time:
                raise ValidationError({'check_out_time': 'Check-out time cannot be before check-in time.'})

    def save(self, *args, **kwargs):
        if not self.security_code:
            self.security_code = generate_unique_security_code(self.branch)
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.child} - {self.classroom.name} ({self.status})"
