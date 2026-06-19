import uuid
from django.db import models

class PerformanceKPISnapshot(models.Model):
    REPORTING_PERIOD_CHOICES = (
        ('Daily', 'Daily'),
        ('Weekly', 'Weekly'),
        ('Monthly', 'Monthly'),
        ('Quarterly', 'Quarterly'),
        ('Yearly', 'Yearly'),
        ('Custom', 'Custom'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    branch = models.ForeignKey('branches.Branch', on_delete=models.PROTECT, related_name='kpi_snapshots')
    
    reporting_period = models.CharField(max_length=20, choices=REPORTING_PERIOD_CHOICES, db_index=True)
    start_date = models.DateField(db_index=True)
    end_date = models.DateField(db_index=True)
    
    # Aggregated KPIs
    total_giving_ytd = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    giving_growth_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    avg_weekly_attendance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    attendance_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_members = models.IntegerField(default=0)
    members_growth_rate = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    
    # Audit trail metadata
    metadata = models.JSONField(default=dict)  # Stores source modules, timestamp, calculation methods
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-end_date']
        constraints = [
            models.UniqueConstraint(
                fields=['branch', 'reporting_period', 'start_date', 'end_date'],
                name='unique_branch_period_range_snapshot'
            )
        ]

    def __str__(self):
        return f"{self.reporting_period} Snapshot ({self.start_date} to {self.end_date}) - {self.branch.branch_name}"
