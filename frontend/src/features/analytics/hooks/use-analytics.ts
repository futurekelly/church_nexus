"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AnalyticsRepository } from "../repositories/analytics.repository";
import type {
  PerformanceKPISnapshot,
  AttendanceAnalytics,
  GivingAnalytics,
  DemographicsData
} from "../types/analytics.types";

export function useAnalytics() {
  const { user, role } = useAuth();
  const userBranchId = (user as any)?.branch_id || "branch-001";
  const userUuid = user ? String(user.id) : "guest-uuid";

  const [period, setPeriod] = useState<"Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly" | "Custom">("Monthly");
  const [customRange, setCustomRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0]
  });

  // Selected branch: "all" represents global aggregated, or specific branch
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    role === "super_admin" ? "all" : userBranchId
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [snapshot, setSnapshot] = useState<PerformanceKPISnapshot | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceAnalytics | null>(null);
  const [givingData, setGivingData] = useState<GivingAnalytics | null>(null);
  const [demographicsData, setDemographicsData] = useState<DemographicsData | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const context = {
        branchId: selectedBranchId,
        role: role || "member",
        memberId: (user as any)?.member_id || (user as any)?.memberId || null
      };

      // Fetch snapshot (generated inside repository snapshot layer)
      const snap = isRefresh 
        ? await AnalyticsRepository.refreshKPISnapshot(period, customRange, context)
        : await AnalyticsRepository.getKPISnapshot(period, customRange, context);
      
      setSnapshot(snap);

      // Fetch chart aggregates
      const [att, giv, demo] = await Promise.all([
        AnalyticsRepository.getAttendanceAnalytics(period, customRange, { branchId: selectedBranchId, role: role || "member" }),
        AnalyticsRepository.getGivingAnalytics(period, customRange, { branchId: selectedBranchId, role: role || "member" }),
        AnalyticsRepository.getDemographics({ branchId: selectedBranchId, role: role || "member" })
      ]);

      setAttendanceData(att);
      setGivingData(giv);
      setDemographicsData(demo);
    } catch (err: any) {
      console.error("Error loading analytics data:", err);
      setError(err?.message || "Failed to load reporting analytics data");
    } finally {
      setLoading(false);
    }
  }, [period, customRange, selectedBranchId, role, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const exportReport = useCallback(async (
    reportType: "financial" | "attendance" | "demographic",
    format: "PDF" | "CSV"
  ) => {
    try {
      const activeBranch = selectedBranchId === "all" ? userBranchId : selectedBranchId;
      return await AnalyticsRepository.generateReport(
        reportType,
        format,
        {
          period,
          customStart: period === "Custom" ? customRange.start : undefined,
          customEnd: period === "Custom" ? customRange.end : undefined
        },
        userUuid,
        activeBranch
      );
    } catch (err: any) {
      console.error("Failed to generate report export:", err);
      throw new Error(err?.message || "Report generation failed");
    }
  }, [period, customRange, selectedBranchId, userBranchId, userUuid]);

  return {
    loading,
    error,
    snapshot,
    attendanceData,
    givingData,
    demographicsData,
    period,
    setPeriod,
    customRange,
    setCustomRange,
    selectedBranchId,
    setSelectedBranchId,
    refresh,
    exportReport
  };
}
