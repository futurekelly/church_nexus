from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import datetime, timedelta, date
from decimal import Decimal
from django.db.models import Sum
from django.shortcuts import get_object_or_404

from branches.models import Branch
from members.models import Member
from donations.models import Donation, Expense
from events.models import Event, EventRegistration
from documents.models import GeneratedDocument, DocumentTemplate
from analytics.models import PerformanceKPISnapshot
from analytics.serializers import PerformanceKPISnapshotSerializer
from analytics.tasks import compute_branch_kpis

# Helper to generate time bins
def generate_bins(period, start_date=None, end_date=None):
    now = timezone.now().date()
    bins = []
    
    if period == 'Daily':
        # Last 7 days
        for i in range(6, -1, -1):
            day = now - timedelta(days=i)
            bins.append({
                'label': day.strftime('%b %d'),
                'start': day,
                'end': day
            })
    elif period == 'Weekly':
        # Last 6 weeks (Monday-Sunday)
        monday = now - timedelta(days=now.weekday())
        for i in range(5, -1, -1):
            start = monday - timedelta(weeks=i)
            end = start + timedelta(days=6)
            bins.append({
                'label': f"Wk {start.day}/{start.month}",
                'start': start,
                'end': end
            })
    elif period in ['Monthly', 'Quarterly', 'Yearly']:
        # Last 6 months
        for i in range(5, -1, -1):
            month = now.month - i
            year = now.year
            while month <= 0:
                month += 12
                year -= 1
            start = date(year, month, 1)
            if month == 12:
                end = date(year, 12, 31)
            else:
                end = date(year, month + 1, 1) - timedelta(days=1)
            bins.append({
                'label': start.strftime('%b %y'),
                'start': start,
                'end': end
            })
    elif period == 'Custom' and start_date and end_date:
        total_days = (end_date - start_date).days
        chunk_days = max(1, total_days // 6)
        for i in range(6):
            c_start = start_date + timedelta(days=i * chunk_days)
            c_end = c_start + timedelta(days=chunk_days - 1) if i < 5 else end_date
            bins.append({
                'label': f"{c_start.day}/{c_start.month} - {c_end.day}/{c_end.month}",
                'start': c_start,
                'end': c_end
            })
    else:
        # Fallback last 6 months
        for i in range(5, -1, -1):
            month = now.month - i
            year = now.year
            while month <= 0:
                month += 12
                year -= 1
            start = date(year, month, 1)
            if month == 12:
                end = date(year, 12, 31)
            else:
                end = date(year, month + 1, 1) - timedelta(days=1)
            bins.append({
                'label': start.strftime('%b'),
                'start': start,
                'end': end
            })
            
    return bins

class KPISnapshotView(APIView):
    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'Monthly')
        branch_id = request.query_params.get('branch_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Enforce branch isolation
        if user.role != 'super_admin':
            branch = user.branch
        else:
            if branch_id and branch_id != 'all':
                branch = get_object_or_404(Branch, pk=branch_id)
            else:
                branch = None # Super admin viewing all aggregated

        # Parse dates
        start_date = None
        end_date = None
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str[:10], '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str[:10], '%Y-%m-%d').date()
            except ValueError:
                pass

        if not start_date or not end_date:
            from analytics.tasks import get_period_dates
            start_date, end_date = get_period_dates(period)

        # 1. Fetch cached snapshot if available (only for specific branch)
        if branch:
            snapshot = PerformanceKPISnapshot.objects.filter(
                branch=branch,
                reporting_period=period,
                start_date=start_date,
                end_date=end_date
            ).first()
            if snapshot:
                serializer = PerformanceKPISnapshotSerializer(snapshot)
                # Map snake_case database fields to camelCase expected by the frontend
                data = serializer.data
                return Response({
                    'id': data['id'],
                    'branch_id': data['branch'],
                    'reporting_period': data['reporting_period'],
                    'start_date': data['start_date'],
                    'end_date': data['end_date'],
                    'totalGivingYTD': float(data['total_giving_ytd']),
                    'givingGrowthRate': float(data['giving_growth_rate']),
                    'avgWeeklyAttendance': float(data['avg_weekly_attendance']),
                    'attendanceRate': float(data['attendance_rate']),
                    'totalMembers': data['total_members'],
                    'membersGrowthRate': float(data['members_growth_rate']),
                    'metadata': data['metadata']
                })

        # 2. Dynamic aggregation (for Custom, missing cache, or global aggregated views)
        if branch:
            kpis = compute_branch_kpis(branch, start_date, end_date)
            # Cache it if open period
            from finance.models import FinancialPeriod
            period_record = FinancialPeriod.objects.filter(
                branch=branch,
                start_date__lte=end_date,
                end_date__gte=start_date
            ).first()
            if not period_record or period_record.status == 'OPEN':
                PerformanceKPISnapshot.objects.update_or_create(
                    branch=branch,
                    reporting_period=period,
                    start_date=start_date,
                    end_date=end_date,
                    defaults=kpis
                )
            # Format output mapping
            return Response({
                'id': f"dyn-{branch.id}",
                'branch_id': branch.id,
                'reporting_period': period,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'totalGivingYTD': float(kpis['total_giving_ytd']),
                'givingGrowthRate': float(kpis['giving_growth_rate']),
                'avgWeeklyAttendance': float(kpis['avg_weekly_attendance']),
                'attendanceRate': float(kpis['attendance_rate']),
                'totalMembers': kpis['total_members'],
                'membersGrowthRate': float(kpis['members_growth_rate']),
                'metadata': kpis['metadata']
            })
        else:
            # Aggregate across all branches
            branches = Branch.objects.all()
            total_giving = Decimal('0.00')
            members_sum = 0
            attendance_rate_sum = Decimal('0.00')
            avg_weekly_sum = Decimal('0.00')
            count = 0
            
            for b in branches:
                kpis = compute_branch_kpis(b, start_date, end_date)
                total_giving += kpis['total_giving_ytd']
                members_sum += kpis['total_members']
                attendance_rate_sum += kpis['attendance_rate']
                avg_weekly_sum += kpis['avg_weekly_attendance']
                count += 1
                
            avg_attendance_rate = (attendance_rate_sum / count) if count > 0 else Decimal('85.00')
            avg_weekly_attendance = (avg_weekly_sum / count) if count > 0 else Decimal('0.00')
            
            return Response({
                'id': "dyn-all",
                'branch_id': "all",
                'reporting_period': period,
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat(),
                'totalGivingYTD': float(total_giving),
                'givingGrowthRate': 0.0, # aggregate growth comparison complex
                'avgWeeklyAttendance': float(avg_weekly_attendance),
                'attendanceRate': float(avg_attendance_rate),
                'totalMembers': members_sum,
                'membersGrowthRate': 0.0,
                'metadata': {
                    'calculation_timestamp': timezone.now().isoformat(),
                    'source_modules': ['members', 'donations', 'events'],
                    'method': 'Aggregated sum/avg across all branches.'
                }
            })


class AttendanceAnalyticsView(APIView):
    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'Weekly')
        branch_id = request.query_params.get('branch_id')
        
        start_date = None
        end_date = None
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str[:10], '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str[:10], '%Y-%m-%d').date()
            except ValueError:
                pass

        bins = generate_bins(period, start_date, end_date)

        # Filter branches
        if user.role != 'super_admin':
            branches = [user.branch]
        else:
            if branch_id and branch_id != 'all':
                branches = [get_object_or_404(Branch, pk=branch_id)]
            else:
                branches = list(Branch.objects.all())

        labels = []
        attending_counts = []
        no_show_counts = []
        waitlist_counts = []

        for b in bins:
            labels.append(b['label'])
            
            # Query completed events for this bin range and branches
            events = Event.objects.filter(
                branch__in=branches,
                status__in=['Closed', 'Completed'],
                is_archived=False,
                start_date__date__gte=b['start'],
                start_date__date__lte=b['end']
            )

            presents = EventRegistration.objects.filter(
                event__in=events,
                attendance_status='checked_in',
                is_archived=False
            ).count()

            absents = EventRegistration.objects.filter(
                event__in=events,
                attendance_status='absent',
                is_archived=False
            ).count()

            waitlisted = EventRegistration.objects.filter(
                event__in=events,
                status='WAITLISTED',
                is_archived=False
            ).count()

            attending_counts.append(presents)
            no_show_counts.append(absents)
            waitlist_counts.append(waitlisted)

        total_attending = sum(attending_counts)
        total_no_shows = sum(no_show_counts)
        total_waitlists = sum(waitlist_counts)
        total_capacity = total_attending + total_no_shows + total_waitlists
        
        rate_percentage = (total_attending / total_capacity * 100) if total_capacity > 0 else 85.5

        return Response({
            'labels': labels,
            'attendingCounts': attending_counts,
            'noShowCounts': no_show_counts,
            'waitlistCounts': waitlist_counts,
            'ratePercentage': rate_percentage
        })


class GivingAnalyticsView(APIView):
    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'Weekly')
        branch_id = request.query_params.get('branch_id')

        start_date = None
        end_date = None
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str[:10], '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str[:10], '%Y-%m-%d').date()
            except ValueError:
                pass

        bins = generate_bins(period, start_date, end_date)

        # Filter branches
        if user.role != 'super_admin':
            branches = [user.branch]
        else:
            if branch_id and branch_id != 'all':
                branches = [get_object_or_404(Branch, pk=branch_id)]
            else:
                branches = list(Branch.objects.all())

        labels = []
        tithe_amounts = []
        offering_amounts = []
        other_amounts = []
        expense_amounts = []

        for b in bins:
            labels.append(b['label'])

            # Donations
            donations = Donation.objects.filter(
                branch__in=branches,
                status='COMPLETED',
                is_archived=False,
                date__date__gte=b['start'],
                date__date__lte=b['end']
            )

            t_sum = Decimal('0.00')
            o_sum = Decimal('0.00')
            oth_sum = Decimal('0.00')

            for d in donations:
                if d.campaign_id:
                    o_sum += d.amount
                elif 'tithe' in d.notes.lower():
                    t_sum += d.amount
                elif 'offering' in d.notes.lower():
                    o_sum += d.amount
                else:
                    t_sum += d.amount # default fallback

            # Expenses
            expenses = Expense.objects.filter(
                branch__in=branches,
                status='APPROVED',
                is_archived=False,
                date__date__gte=b['start'],
                date__date__lte=b['end']
            )
            e_sum = expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            tithe_amounts.append(float(t_sum))
            offering_amounts.append(float(o_sum))
            other_amounts.append(float(oth_sum))
            expense_amounts.append(float(e_sum))

        total_giving = sum(tithe_amounts) + sum(offering_amounts) + sum(other_amounts)
        total_expenses = sum(expense_amounts)
        net_margin = total_giving - total_expenses

        return Response({
            'labels': labels,
            'titheAmounts': tithe_amounts,
            'offeringAmounts': offering_amounts,
            'otherAmounts': other_amounts,
            'expenseAmounts': expense_amounts,
            'netMargin': net_margin
        })


class DemographicsView(APIView):
    def get(self, request):
        user = request.user
        branch_id = request.query_params.get('branch_id')

        # Filter branches
        if user.role != 'super_admin':
            branches = [user.branch]
        else:
            if branch_id and branch_id != 'all':
                branches = [get_object_or_404(Branch, pk=branch_id)]
            else:
                branches = list(Branch.objects.all())

        members = Member.objects.filter(
            branch__in=branches,
            is_archived=False,
            status__in=['Active', 'Member', 'New Convert']
        )

        children = 0
        youth = 0
        adult = 0
        senior = 0
        
        male = 0
        female = 0
        
        marital_counts = {
            'Single': 0,
            'Married': 0,
            'Divorced': 0,
            'Widowed': 0
        }

        current_year = timezone.now().year

        for m in members:
            # Age split
            if m.date_of_birth:
                age = current_year - m.date_of_birth.year
                if age < 12:
                    children += 1
                elif age <= 30:
                    youth += 1
                elif age <= 60:
                    adult += 1
                else:
                    senior += 1
            else:
                adult += 1

            # Gender split
            g = (m.gender or '').lower()
            if g == 'male':
                male += 1
            elif g == 'female':
                female += 1

            # Marital split
            status_val = m.marital_status or 'Single'
            if status_val in marital_counts:
                marital_counts[status_val] += 1
            else:
                marital_counts['Single'] += 1

        return Response({
            'ageBands': [
                {'name': 'Children (<12)', 'value': children},
                {'name': 'Youth (12-30)', 'value': youth},
                {'name': 'Adult (31-60)', 'value': adult},
                {'name': 'Senior (>60)', 'value': senior}
            ],
            'genderSplits': [
                {'name': 'Male', 'value': male},
                {'name': 'Female', 'value': female}
            ],
            'maritalStatus': [
                {'name': k, 'value': v} for k, v in marital_counts.items()
            ]
        })


class GenerateReportView(APIView):
    def post(self, request):
        user = request.user
        report_type = request.data.get('report_type') # financial, attendance, demographic
        doc_format = request.data.get('format', 'PDF') # PDF, CSV
        filters = request.data.get('filters', {})

        branch_id = request.data.get('branch_id') or user.branch.id
        branch = get_object_or_404(Branch, pk=branch_id)

        # Enforce branch isolation
        if user.role != 'super_admin' and branch != user.branch:
            return Response(
                {"success": False, "message": "Permission denied."},
                status=status.HTTP_403_FORBIDDEN
            )

        doc_type_map = {
            'financial': 'REPORT_FINANCE',
            'attendance': 'REPORT_ATTENDANCE',
            'demographic': 'REPORT_DEMOGRAPHIC'
        }
        
        doc_type = doc_type_map.get(report_type, 'REPORT_FINANCE')

        # Retrieve active template
        template = DocumentTemplate.objects.filter(
            branch=branch,
            document_type=doc_type,
            is_active=True
        ).first()

        # If no template exists, fetch/create a default template
        if not template:
            # Let's seed a default template to prevent crashes
            template = DocumentTemplate.objects.create(
                branch=branch,
                name=f"Default {doc_type} Template",
                category='report',
                document_type=doc_type,
                html_layout="<html><body><h1>Analytics Report</h1>{{content}}</body></html>",
                is_active=True,
                created_by=user
            )

        # Create GeneratedDocument record
        expires_at = timezone.now() + timedelta(days=7) # Default 7 days retention
        new_doc = GeneratedDocument.objects.create(
            branch=branch,
            document_type=doc_type,
            format=doc_format,
            template_version=template.version,
            source_type='analytics',
            source_id=f"analytics-{report_type}-{int(timezone.now().timestamp())}",
            status='PENDING',
            expires_at=expires_at,
            retention_policy='7_DAYS',
            requested_by=user,
            filter_metadata=filters
        )

        # Trigger background Celery Task (from Module 22F tasks)
        # We invoke generate_document_task asynchronously
        from documents.tasks import generate_document_task
        generate_document_task.delay(str(new_doc.id))

        return Response({
            'success': True,
            'documentId': str(new_doc.id),
            'message': f"Report generation for type '{report_type}' in format '{doc_format}' successfully queued in Document center."
        }, status=status.HTTP_202_ACCEPTED)
