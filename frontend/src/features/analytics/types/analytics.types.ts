export interface KPIAuditMetadata {
  sourceModules: string[];
  aggregationTimestamp: string;
  calculationMethod: string;
}

export interface PerformanceKPISnapshot {
  id: string;
  branch_id: string;
  reporting_period: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";
  start_date: string;
  end_date: string;
  
  // Aggregated KPIs
  totalGivingYTD: number;
  givingGrowthRate: number;
  avgWeeklyAttendance: number;
  attendanceRate: number;
  totalMembers: number;
  membersGrowthRate: number;

  // Verification Audit trails
  metadata: {
    totalGivingYTD: KPIAuditMetadata;
    givingGrowthRate: KPIAuditMetadata;
    avgWeeklyAttendance: KPIAuditMetadata;
    attendanceRate: KPIAuditMetadata;
    totalMembers: KPIAuditMetadata;
    membersGrowthRate: KPIAuditMetadata;
  };
}

export interface AttendanceAnalytics {
  labels: string[]; // dates/weeks/months
  attendingCounts: number[];
  noShowCounts: number[];
  waitlistCounts: number[];
  ratePercentage: number;
}

export interface GivingAnalytics {
  labels: string[];
  titheAmounts: number[];
  offeringAmounts: number[];
  otherAmounts: number[];
  expenseAmounts: number[];
  netMargin: number;
}

export interface DemographicsData {
  ageBands: { name: string; value: number }[];
  genderSplits: { name: string; value: number }[];
  maritalStatus: { name: string; value: number }[];
}

export interface AnalyticsReportFilter {
  period: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom";
  customStart?: string;
  customEnd?: string;
}
