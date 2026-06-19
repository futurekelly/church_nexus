from django.db import models

class Branch(models.Model):
    BRANCH_TYPES = (
        ('headquarters', 'Headquarters'),
        ('satellite', 'Satellite'),
    )

    id = models.CharField(max_length=50, primary_key=True)
    branch_code = models.CharField(max_length=50, unique=True)
    branch_name = models.CharField(max_length=255)
    branch_type = models.CharField(max_length=20, choices=BRANCH_TYPES, default='satellite')
    
    # Extended fields
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.branch_name} ({self.branch_code})"

    class Meta:
        verbose_name = "Branch"
        verbose_name_plural = "Branches"

