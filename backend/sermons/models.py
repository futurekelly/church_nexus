import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify
from django.core.exceptions import ValidationError
from .validators import validate_thumbnail, validate_audio, validate_video


class SermonSeries(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(
        'branches.Branch', on_delete=models.CASCADE,
        related_name='sermon_series', db_index=True
    )
    title = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, db_index=True)
    description = models.TextField(blank=True)
    cover_image = models.ImageField(
        upload_to='sermons/series_covers/', null=True, blank=True,
        validators=[validate_thumbnail]
    )
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Sermon Series"
        ordering = ['-start_date', '-created_at']
        unique_together = ['branch', 'slug']

    def clean(self):
        super().clean()
        if not self.slug and self.title:
            self.slug = slugify(self.title)

    def save(self, *args, **kwargs):
        if not self.slug and self.title:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        branch_str = self.branch.name if self.branch else 'No Branch'
        return f"{self.title} ({branch_str})"


class Sermon(models.Model):
    STATUS_CHOICES = (
        ('Draft', 'Draft'),
        ('Published', 'Published'),
        ('Archived', 'Archived'),
    )

    CATEGORY_CHOICES = (
        ('Faith', 'Faith & Belief'),
        ('Grace', 'Grace & Mercy'),
        ('Hope', 'Hope & Future'),
        ('Salvation', 'Salvation & Redemption'),
        ('Family', 'Family & Relationships'),
        ('Love', 'Love & Fellowship'),
        ('Prayer', 'Prayer & Intercession'),
        ('Worship', 'Worship & Praise'),
        ('Leadership', 'Leadership & Service'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey(
        'branches.Branch', on_delete=models.PROTECT,
        related_name='sermons', db_index=True
    )
    series = models.ForeignKey(
        SermonSeries, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='sermons', db_index=True
    )
    part_number = models.PositiveIntegerField(null=True, blank=True)

    title = models.CharField(max_length=255)
    description = models.TextField()
    scripture_reference = models.CharField(
        max_length=255, null=True, blank=True
    )
    sermon_date = models.DateField(default=timezone.now, db_index=True)
    status = models.CharField(
        max_length=15, choices=STATUS_CHOICES, default='Draft', db_index=True
    )

    # Media Attachments
    thumbnail = models.ImageField(
        upload_to='sermons/thumbnails/', null=True, blank=True,
        validators=[validate_thumbnail]
    )
    video_url = models.URLField(max_length=500, null=True, blank=True)
    audio_url = models.URLField(max_length=500, null=True, blank=True)
    video_file = models.FileField(
        upload_to='sermons/videos/', null=True, blank=True,
        validators=[validate_video]
    )
    audio_file = models.FileField(
        upload_to='sermons/audio/', null=True, blank=True,
        validators=[validate_audio]
    )

    speaker = models.CharField(max_length=255, db_index=True)
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, db_index=True
    )
    featured = models.BooleanField(default=False, db_index=True)
    views_count = models.PositiveIntegerField(default=0, db_index=True)
    notes = models.TextField(null=True, blank=True)  # Markdown study notes
    tags = models.JSONField(default=list, blank=True)  # List of string tokens

    # Audit tracking
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_sermons'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        super().clean()

        # Enforce that only Published sermons can be marked as Featured
        if self.featured and self.status != 'Published':
            raise ValidationError({
                'featured': 'Only Published sermons can be marked as Featured.'
            })

        # Multi-tenant isolation: prevent mutation of branch ownership
        if not self._state.adding:
            try:
                db_instance = Sermon.objects.get(pk=self.pk)
                if db_instance.branch_id != self.branch_id:
                    if not getattr(self, '_bypass_branch_immutable', False):
                        raise ValidationError({
                            'branch': 'Branch ownership is immutable once set.'
                        })
            except Sermon.DoesNotExist:
                pass

    def save(self, *args, **kwargs):
        self.full_clean()

        # Enforce exactly one featured sermon per branch
        if self.featured:
            Sermon.objects.filter(
                branch=self.branch, featured=True
            ).exclude(pk=self.pk).update(featured=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.speaker} ({self.sermon_date})"
