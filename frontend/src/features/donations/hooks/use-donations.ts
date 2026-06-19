"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { 
  Donation, PledgeCampaign, Pledge, Expense, 
  FinancialPeriod, FinancialAuditLog 
} from "../types/donations.types";
import { DonationsRepository } from "../repositories/donations.repository";

export function useDonations() {
  const { user, role } = useAuth();
  const branchId = (user as any)?.branch_id || "branch-001";
  const userUuid = String(user?.id || "unknown-user");
  const userMemberId = (user as any)?.member_id || (user as any)?.memberId || null;

  const [donations, setDonations] = useState<(Donation & { type: Donation["donation_type"]; reference_number: string; donor_name: string; donor_email?: string | null })[]>([]);
  const [campaigns, setCampaigns] = useState<PledgeCampaign[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [periods, setPeriods] = useState<FinancialPeriod[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([]);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch campaigns for branch
      const camps = await DonationsRepository.getPledgeCampaigns(branchId);
      
      // Calculate raised_amount for each campaign dynamically to satisfy the UI
      const allDonsResponse = await DonationsRepository.getDonations(
        { search: "", type: "all", method: "all", status: "all", campaign: "all", dateRange: "all" },
        { branchId, role: "Super Admin", memberId: null }
      );
      
      const allDons = allDonsResponse.results;
      
      const campaignsWithRaised = camps.map(c => {
        const campaignDonations = allDons.filter(d => d.campaign_id === c.id && d.status === "Completed");
        const raised = campaignDonations.reduce((sum, d) => sum + d.amount * d.exchange_rate_to_base, 0);
        return {
          ...c,
          name: c.title,
          target_date: c.end_date,
          raised_amount: raised,
          status: raised >= c.target_amount ? ("Fulfilled" as const) : c.status
        };
      });

      setCampaigns(campaignsWithRaised);

      // 2. Fetch donations (with role-based filtration enforced in repo)
      const donsResponse = await DonationsRepository.getDonations(
        { search: "", type: "all", method: "all", status: "all", campaign: "all", dateRange: "all", pageSize: 1000 },
        { branchId, role: role || "Visitor", memberId: userMemberId }
      );
      
      // Map legacy fields for backwards compatibility
      const mappedDons = donsResponse.results.map(d => ({
        ...d,
        type: d.donation_type,
        reference_number: d.transaction_reference,
        donor_name: d.anonymous ? "Anonymous" : (d.guest_name || "Member Contribution")
      }));
      setDonations(mappedDons as any);

      // 3. Fetch expenses
      const exps = await DonationsRepository.getExpenses(branchId);
      setExpenses(exps);

      // 4. Fetch periods
      const pers = await DonationsRepository.getPeriods(branchId);
      setPeriods(pers);

      // 5. Fetch audit logs
      const audits = await DonationsRepository.getFinancialAuditLogs(branchId);
      setAuditLogs(audits);
    } catch (err) {
      console.error("Error loading donations data in hook:", err);
    }
  }, [branchId, role, userMemberId]);

  useEffect(() => {
    loadData();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail &&
        [
          "church-mock-donations",
          "church-mock-expenses",
          "church-mock-financial-periods",
          "church-mock-pledge-campaigns",
          "church-mock-pledges"
        ].includes(customEvent.detail.key)
      ) {
        loadData();
      }
    };

    window.addEventListener("local-storage-update", handleStorageUpdate);
    return () => {
      window.removeEventListener("local-storage-update", handleStorageUpdate);
    };
  }, [loadData]);

  // Record a new donation
  const addDonation = useCallback(async (donationData: {
    member_id: string | null;
    donor_name: string;
    donor_email?: string;
    amount: number;
    type: Donation["donation_type"];
    payment_method: Donation["payment_method"];
    notes?: string;
    campaign_id?: string;
  }) => {
    const result = await DonationsRepository.createDonation({
      branch_id: branchId,
      member_id: donationData.member_id,
      amount: donationData.amount,
      currency: "TZS",
      donation_type: donationData.type,
      payment_method: donationData.payment_method,
      status: "Completed",
      donation_date: new Date().toISOString(),
      anonymous: !donationData.donor_name || donationData.donor_name === "Anonymous",
      notes: donationData.notes || null,
      guest_name: donationData.donor_name || null,
      guest_email: donationData.donor_email || null,
      campaign_id: donationData.campaign_id || null
    }, userUuid);

    await loadData();
    return {
      ...result,
      type: result.donation_type,
      reference_number: result.transaction_reference,
      donor_name: result.anonymous ? "Anonymous" : (result.guest_name || "Member Contribution")
    };
  }, [branchId, userUuid, loadData]);

  // Void a donation
  const voidDonation = useCallback(async (id: string, reason: string) => {
    const result = await DonationsRepository.voidDonation(id, userUuid, reason);
    await loadData();
    return result;
  }, [userUuid, loadData]);

  // Create an expense
  const addExpense = useCallback(async (expenseData: Omit<Expense, "id" | "exchange_rate_to_base" | "base_currency" | "created_at" | "updated_at" | "approved_by" | "approved_at" | "status">) => {
    const result = await DonationsRepository.createExpense({
      ...expenseData,
      branch_id: branchId
    }, userUuid);
    await loadData();
    return result;
  }, [branchId, userUuid, loadData]);

  // Approve an expense
  const approveExpense = useCallback(async (id: string) => {
    const result = await DonationsRepository.approveExpense(id, userUuid);
    await loadData();
    return result;
  }, [userUuid, loadData]);

  // Close period
  const closePeriod = useCallback(async (id: string) => {
    const result = await DonationsRepository.closeFinancialPeriod(id, userUuid);
    await loadData();
    return result;
  }, [userUuid, loadData]);

  const getDonationById = useCallback(async (id: string) => {
    const result = await DonationsRepository.getDonationById(id);
    if (!result) return null;
    return {
      ...result,
      type: result.donation_type,
      reference_number: result.transaction_reference,
      donor_name: result.anonymous ? "Anonymous" : (result.guest_name || "Member Contribution")
    };
  }, []);

  const getReceiptForDonation = useCallback((donationId: string) => {
    const donation = donations.find(d => d.id === donationId);
    return {
      id: `rec-${donationId}`,
      donation_id: donationId,
      receipt_number: donation ? `REC-2026-${donation.id.slice(-3).toUpperCase()}` : `REC-2026-TMP`,
      issued_at: donation ? donation.created_at : new Date().toISOString(),
    };
  }, [donations]);

  return {
    donations,
    campaigns,
    expenses,
    periods,
    auditLogs,
    addDonation,
    voidDonation,
    addExpense,
    approveExpense,
    closePeriod,
    getDonationById,
    getReceiptForDonation,
    getMemberStatement: DonationsRepository.getMemberStatement,
    getHouseholdStatement: DonationsRepository.getHouseholdStatement,
    getCampaignStatement: DonationsRepository.getCampaignStatement,
    generateStatement: DonationsRepository.generateStatement
  };
}
