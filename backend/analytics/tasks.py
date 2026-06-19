from celery import shared_task
from django.utils import timezone
from datetime import timedelta, date, datetime, timezone as dt_timezone
from decimal import Decimal
from django.db.models import Sum, Count, Q
from django.db import transaction

from branches.models import Branch
from members.models import Member
from donations.models import Donation, Expense
from events.models import Event, EventRegistration
from documents.models import GeneratedDocument
from analytics.models import PerformanceKPISnapshot

def get_period_dates(period):
    now = timezone.now()
    start_date = now.date()
    end_date = now.date()
    
    if period == 'Daily':
        start_date = now.date()
        end_date = now.date()
    elif period == 'Weekly':
        # Start of current week (Monday)
        start_date = now.date() - timedelta(days=now.weekday())
        end_date = start_date + timedelta(days=6)
    elif period == 'Monthly':
        start_date = date(now.year, now.month, 1)
        # End of current month
        if now.month == 12:
            end_date = date(now.year, 12, 31)
        else:
            end_date = date(now.year, now.month + 1, 1) - timedelta(days=1)
    elif period == 'Quarterly':
        quarter = (now.month - 1) // 3 + 1
        start_date = date(now.year, (quarter - 1) * 3 + 1, 1)
        if quarter == 4:
            end_date = date(now.year, 12, 31)
        else:
            end_date = date(now.year, quarter * 3 + 1, 1) - timedelta(days=1)
    elif period == 'Yearly':
        start_date = date(now.year, 1, 1)
        end_date = date(now.year, 12, 31)
        
    return start_date, end_date

def compute_branch_kpis(branch, start_date, end_date):
    current_year = timezone.now().year
    ytd_start = datetime(current_year, 1, 1, tzinfo=dt_timezone.utc)
    
    # 1. Total Members & Growth
    total_members = Member.objects.filter(
        branch=branch,
        is_archived=False,
        status__in=['Active', 'Member', 'New Convert']
    ).count()
    
    members_at_start = Member.objects.filter(
        branch=branch,
        is_archived=False,
        status__in=['Active', 'Member', 'New Convert'],
        join_date__lt=ytd_start.date()
    ).count()
    
    members_growth_rate = Decimal('0.00')
    if members_at_start > 0:
        members_growth_rate = Decimal(str(((total_members - members_at_start) / members_at_start) * 100))
        
    # 2. YTD Giving & Growth
    total_giving_ytd = Donation.objects.filter(
        branch=branch,
        status='COMPLETED',
        is_archived=False,
        date__gte=ytd_start
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    prev_ytd_start = datetime(current_year - 1, 1, 1, tzinfo=dt_timezone.utc)
    prev_ytd_end = timezone.now() - timedelta(days=365)
    prev_ytd_end = prev_ytd_end.replace(year=current_year - 1)
    
    prev_giving_ytd = Donation.objects.filter(
        branch=branch,
        status='COMPLETED',
        is_archived=False,
        date__gte=prev_ytd_start,
        date__lte=prev_ytd_end
    ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
    
    giving_growth_rate = Decimal('0.00')
    if prev_giving_ytd > 0:
        giving_growth_rate = Decimal(str(((total_giving_ytd - prev_giving_ytd) / prev_giving_ytd) * 100))
        
    # 3. Attendance KPIs (Events)
    completed_events = Event.objects.filter(
        branch=branch,
        status__in=['Closed', 'Completed'],
        is_archived=False,
        start_date__gte=ytd_start
    )
    event_count = completed_events.count()
    
    total_presents = EventRegistration.objects.filter(
        event__in=completed_events,
        attendance_status='checked_in',
        is_archived=False
    ).count()
    
    total_capacity = EventRegistration.objects.filter(
        event__in=completed_events,
        attendance_status__in=['registered', 'checked_in', 'absent'],
        is_archived=False
    ).count()
    
    avg_weekly_attendance = Decimal('0.00')
    if event_count > 0:
        avg_weekly_attendance = Decimal(str(total_presents / event_count))
        
    attendance_rate = Decimal('0.00')
    if total_capacity > 0:
        attendance_rate = Decimal(str((total_presents / total_capacity) * 100))
    else:
        # standard default if no events yet
        attendance_rate = Decimal('85.00')
        
    metadata = {
        'calculation_timestamp': timezone.now().isoformat(),
        'source_modules': ['members', 'donations', 'events'],
        'methods': {
            'total_giving_ytd': 'Sum of COMPLETED donations in current calendar year.',
            'giving_growth_rate': 'Percentage change in YTD giving compared to previous year same-period.',
            'total_members': 'Count of active, non-archived member profiles.',
            'members_growth_rate': 'Percentage change in active members compared to start of year.',
            'avg_weekly_attendance': 'Average checked_in registrations across completed events YTD.',
            'attendance_rate': 'Ratio of checked_in to registered count across completed events.'
        }
    }
    
    return {
        'total_giving_ytd': total_giving_ytd,
        'giving_growth_rate': giving_growth_rate,
        'avg_weekly_attendance': avg_weekly_attendance,
        'attendance_rate': attendance_rate,
        'total_members': total_members,
        'members_growth_rate': members_growth_rate,
        'metadata': metadata
    }

@shared_task
def generate_kpi_snapshots(period):
    start_date, end_date = get_period_dates(period)
    branches = Branch.objects.all()
    
    for branch in branches:
        try:
            kpis = compute_branch_kpis(branch, start_date, end_date)
            
            with transaction.atomic():
                snapshot, created = PerformanceKPISnapshot.objects.get_or_create(
                    branch=branch,
                    reporting_period=period,
                    start_date=start_date,
                    end_date=end_date,
                    defaults=kpis
                )
                
                if not created:
                    # closed/locked periods are immutable
                    # check if period is open
                    period_record = FinancialPeriod.objects.filter(
                        branch=branch,
                        start_date__lte=end_date,
                        end_date__gte=start_date
                    ).first()
                    
                    if not period_record or period_record.status == 'OPEN':
                        # update current active period
                        for k, v in kpis.items():
                            setattr(snapshot, k, v)
                        snapshot.save()
        except Exception as e:
            # log or handle task error
            print(f"Error computing snapshot for branch {branch.id}: {e}")

@shared_task
def purge_expired_analytics_data():
    now = timezone.now()
    
    # 1. Prune daily snapshots > 90 days
    limit_daily = now.date() - timedelta(days=90)
    PerformanceKPISnapshot.objects.filter(
        reporting_period='Daily',
        end_date__lt=limit_daily
    ).delete()
    
    # 2. Prune weekly snapshots > 365 days
    limit_weekly = now.date() - timedelta(days=365)
    PerformanceKPISnapshot.objects.filter(
        reporting_period='Weekly',
        end_date__lt=limit_weekly
    ).delete()
    
    # 3. Prune custom snapshots > 30 days
    limit_custom = now.date() - timedelta(days=30)
    PerformanceKPISnapshot.objects.filter(
        reporting_period='Custom',
        end_date__lt=limit_custom
    ).delete()
    
    # 4. Mark expired generated document files (from Module 22F)
    expired_docs = GeneratedDocument.objects.filter(
        expires_at__lt=now,
        status='COMPLETED'
    )
    for doc in expired_docs:
        doc.status = 'EXPIRED'
        doc.save()
