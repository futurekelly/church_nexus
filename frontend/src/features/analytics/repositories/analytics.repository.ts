import type {
  PerformanceKPISnapshot,
  AttendanceAnalytics,
  GivingAnalytics,
  DemographicsData
} from "../types/analytics.types";
import { apiGet, apiPost, isApiError } from "@/services/api-client";

export const AnalyticsRepository = {
  /**
   * Retrieves the pre-calculated KPI snapshot or triggers dynamic calculation.
   * Scopes queries to the branch of the active user session.
   */
  async getKPISnapshot(
    period: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom",
    customRange?: { start: string; end: string },
    context: { branchId: string; role: string; memberId: string | null } = { branchId: "branch-001", role: "super_admin", memberId: null }
  ): Promise<PerformanceKPISnapshot> {
    const params: any = {
      period,
      branch_id: context.branchId
    };
    if (customRange) {
      params.start_date = customRange.start;
      params.end_date = customRange.end;
    }

    const response = await apiGet<PerformanceKPISnapshot>("/api/analytics/kpi-snapshot/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch KPI snapshot.");
    }
    return response.data;
  },

  /**
   * Helper to force clear snapshot cache / refresh.
   */
  async refreshKPISnapshot(
    period: "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom",
    customRange?: { start: string; end: string },
    context?: { branchId: string; role: string; memberId: string | null }
  ): Promise<PerformanceKPISnapshot> {
    const resolvedContext = context || { branchId: "all", role: "super_admin", memberId: null };
    const params: any = {
      period,
      branch_id: resolvedContext.branchId,
      force_refresh: true
    };
    if (customRange) {
      params.start_date = customRange.start;
      params.end_date = customRange.end;
    }

    const response = await apiGet<PerformanceKPISnapshot>("/api/analytics/kpi-snapshot/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to refresh KPI snapshot.");
    }
    return response.data;
  },

  /**
   * Aggregates time-series attendance statistics over time.
   */
  async getAttendanceAnalytics(
    period: string,
    customRange?: { start: string; end: string },
    context: { branchId: string; role: string } = { branchId: "branch-001", role: "super_admin" }
  ): Promise<AttendanceAnalytics> {
    const params: any = {
      period,
      branch_id: context.branchId
    };
    if (customRange) {
      params.start_date = customRange.start;
      params.end_date = customRange.end;
    }

    const response = await apiGet<AttendanceAnalytics>("/api/analytics/attendance/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch attendance analytics.");
    }
    return response.data;
  },

  /**
   * Aggregates giving categories and expenses over time.
   */
  async getGivingAnalytics(
    period: string,
    customRange?: { start: string; end: string },
    context: { branchId: string; role: string } = { branchId: "branch-001", role: "super_admin" }
  ): Promise<GivingAnalytics> {
    const params: any = {
      period,
      branch_id: context.branchId
    };
    if (customRange) {
      params.start_date = customRange.start;
      params.end_date = customRange.end;
    }

    const response = await apiGet<GivingAnalytics>("/api/analytics/giving/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch giving analytics.");
    }
    return response.data;
  },

  /**
   * Compiles demographic splits (Age bands, gender splits, marital status split).
   */
  async getDemographics(
    context: { branchId: string; role: string } = { branchId: "branch-001", role: "super_admin" }
  ): Promise<DemographicsData> {
    const params = {
      branch_id: context.branchId
    };
    const response = await apiGet<DemographicsData>("/api/analytics/demographics/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch demographics data.");
    }
    return response.data;
  },

  /**
   * Triggers background report generation task in the Document center.
   */
  async generateReport(
    reportType: "financial" | "attendance" | "demographic",
    format: "PDF" | "CSV",
    filters: { period: string; customStart?: string; customEnd?: string },
    userUuid: string,
    branchId: string
  ): Promise<{ success: boolean; documentId: string; message: string }> {
    const payload = {
      report_type: reportType,
      format,
      filters,
      branch_id: branchId
    };

    const response = await apiPost<any>("/api/analytics/generate-report/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to request report generation.");
    }
    return {
      success: response.data.success,
      documentId: response.data.documentId,
      message: response.data.message
    };
  }
};
