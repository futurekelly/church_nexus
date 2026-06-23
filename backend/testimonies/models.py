import uuid
from django.db import models
from django.core.exceptions import ValidationError

class Testimony(models.Model):
    __test__ = False
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Archived', 'Archived'),
    )

    CATEGORY_CHOICES = (
        ('Healing', 'Healing'),
        ('Provision', 'Provision'),
        ('Restoration', 'Restoration'),
        ('Salvation', 'Salvation'),
        ('Deliverance', 'Deliverance'),
        ('Family', 'Family'),
        ('Education', 'Education'),
        ('Business', 'Business'),
        ('General', 'General'),
    )

    ALLOWED_TRANSITIONS = {
        'Pending': {'Approved', 'Rejected', 'Archived'},
        'Approved': {'Archived'},
        'Rejected': {'Pending', 'Archived'},
        'Archived': {'Pending'},
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonies',
        db_index=True
    )
    author_user = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='testimonies',
        db_index=True
    )
    author_name = models.CharField(max_length=255)
    author_email = models.EmailField(blank=True, null=True)
    is_anonymous = models.BooleanField(default=False)
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='General')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    is_featured = models.BooleanField(default=False)
    rejection_reason = models.TextField(blank=True, default='')
    views = models.IntegerField(default=0)
    image_url = models.URLField(blank=True, null=True, max_length=500)
    video_url = models.URLField(blank=True, null=True, max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Testimonies'

    def clean(self):
        super().clean()
        
        # Enforce that only Approved testimonies can be featured
        if self.is_featured and self.status != 'Approved':
            raise ValidationError({
                'is_featured': 'Only Approved testimonies can be marked as featured.'
            })

        # Enforce status transitions
        if self.pk:
            try:
                original = Testimony.objects.get(pk=self.pk)
                if original.status != self.status:
                    allowed = self.ALLOWED_TRANSITIONS.get(original.status, set())
                    if self.status not in allowed:
                        raise ValidationError({
                            'status': f"Transition from {original.status} to {self.status} is not allowed."
                        })
            except Testimony.DoesNotExist:
                pass

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} by {self.author_name} ({self.status})"
