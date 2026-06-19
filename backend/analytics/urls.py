from django.urls import path
from analytics.views import (
    KPISnapshotView,
    AttendanceAnalyticsView,
    GivingAnalyticsView,
    DemographicsView,
    GenerateReportView
)

urlpatterns = [
    path('analytics/kpi-snapshot/', KPISnapshotView.as_view(), name='analytics_kpi_snapshot'),
    path('analytics/attendance/', AttendanceAnalyticsView.as_view(), name='analytics_attendance'),
    path('analytics/giving/', GivingAnalyticsView.as_view(), name='analytics_giving'),
    path('analytics/demographics/', DemographicsView.as_view(), name='analytics_demographics'),
    path('analytics/generate-report/', GenerateReportView.as_view(), name='analytics_generate_report'),
]
