import type { 
  Donation, Expense, FinancialPeriod, 
  PledgeCampaign, Pledge, FinancialAuditLog, 
  DonationFilters, PaginatedResponse, DonationType, ExpenseCategory, TransactionStatus, ExpenseStatus
} from "../types/donations.types";
import { apiGet, apiPost, apiPut, apiDelete, isApiError } from "@/services/api-client";

// Mapper Helpers to translate between frontend shapes and backend database choices
function mapDonationFromBackend(d: any): Donation {
  let donationType: DonationType = "Tithe";
  let cleanNotes = d.notes || "";
  
  if (d.notes) {
    if (d.notes.startsWith("[Tithe]")) {
      donationType = "Tithe";
      cleanNotes = d.notes.substring("[Tithe]".length).trim();
    } else if (d.notes.startsWith("[Offering]")) {
      donationType = "Offering";
      cleanNotes = d.notes.substring("[Offering]".length).trim();
    } else if (d.notes.startsWith("[Building Fund]")) {
      donationType = "Building Fund";
      cleanNotes = d.notes.substring("[Building Fund]".length).trim();
    } else if (d.notes.startsWith("[Missions]")) {
      donationType = "Missions";
      cleanNotes = d.notes.substring("[Missions]".length).trim();
    } else if (d.notes.startsWith("[Other]")) {
      donationType = "Other";
      cleanNotes = d.notes.substring("[Other]".length).trim();
    }
  }

  let statusVal: TransactionStatus = "Pending";
  if (d.status === "COMPLETED") statusVal = "Completed";
  else if (d.status === "PENDING") statusVal = "Pending";
  else if (d.status === "VOIDED") statusVal = "Voided";
  
  return {
    id: d.id,
    branch_id: d.branch,
    member_id: d.member,
    campaign_id: d.campaign_id,
    amount: parseFloat(d.amount),
    currency: d.currency,
    exchange_rate_to_base: parseFloat(d.exchange_rate_to_base || "1.0"),
    base_currency: d.base_currency || "USD",
    donation_type: donationType,
    payment_method: d.payment_method,
    transaction_reference: d.financial_tx_ref || d.id,
    status: statusVal,
    donation_date: d.date || d.created_at,
    anonymous: d.member === null,
    notes: cleanNotes,
    created_at: d.created_at,
    updated_at: d.updated_at
  };
}

function mapDonationToBackend(d: Partial<Donation>): any {
  const notesPrefix = d.donation_type ? `[${d.donation_type}] ` : "";
  return {
    branch: d.branch_id,
    member: d.member_id,
    campaign_id: d.campaign_id,
    amount: d.amount,
    currency: d.currency,
    payment_method: d.payment_method,
    date: d.donation_date || new Date().toISOString(),
    notes: notesPrefix + (d.notes || ""),
    status: d.status ? d.status.toUpperCase() : "COMPLETED"
  };
}

function mapExpenseFromBackend(e: any): Expense {
  let statusVal: ExpenseStatus = "Pending";
  if (e.status === "APPROVED") statusVal = "Approved";
  else if (e.status === "DRAFT") statusVal = "Pending";
  else if (e.status === "VOIDED") statusVal = "Rejected";

  return {
    id: e.id,
    branch_id: e.branch,
    amount: parseFloat(e.amount),
    currency: e.currency,
    exchange_rate_to_base: parseFloat(e.exchange_rate_to_base || "1.0"),
    base_currency: e.base_currency || "USD",
    expense_category: (e.category || "Operations") as ExpenseCategory,
    payment_method: e.payment_method,
    description: e.notes || "",
    receipt_url: null,
    approved_by: e.approved_by,
    approved_at: e.approved_at,
    status: statusVal,
    created_at: e.created_at,
    updated_at: e.updated_at
  };
}

function mapExpenseToBackend(e: Partial<Expense>): any {
  let statusVal = "DRAFT";
  if (e.status === "Approved") statusVal = "APPROVED";
  else if (e.status === "Rejected") statusVal = "VOIDED";

  return {
    branch: e.branch_id,
    payee: e.description ? e.description.substring(0, 100) : "General Payee",
    amount: e.amount,
    currency: e.currency,
    date: new Date().toISOString(),
    category: e.expense_category,
    payment_method: e.payment_method,
    notes: e.description,
    status: statusVal
  };
}

function mapPeriodFromBackend(p: any): FinancialPeriod {
  return {
    id: p.id,
    branch_id: p.branch,
    name: p.name,
    period_type: "Monthly",
    start_date: p.start_date,
    end_date: p.end_date,
    is_closed: p.status === "CLOSED" || p.status === "LOCKED",
    closed_by: p.updated_by,
    closed_at: p.updated_at,
    created_at: p.created_at
  };
}

function mapCampaignFromBackend(c: any): PledgeCampaign {
  return {
    id: c.id,
    branch_id: c.branch,
    title: c.title,
    description: c.description,
    target_amount: parseFloat(c.target_amount),
    start_date: c.start_date,
    end_date: c.end_date,
    status: c.is_active ? "Active" : "Completed",
    created_at: c.created_at
  };
}

function mapCampaignToBackend(c: Partial<PledgeCampaign>): any {
  return {
    branch: c.branch_id,
    title: c.title,
    description: c.description || "",
    target_amount: c.target_amount,
    currency: c.currency || "USD",
    start_date: c.start_date,
    end_date: c.end_date,
    is_active: c.status !== "Completed"
  };
}

function mapPledgeFromBackend(p: any): Pledge {
  let statusVal: "Pending" | "Fulfilled" | "Cancelled" = "Pending";
  if (p.status === "COMPLETED") statusVal = "Fulfilled";
  else if (p.status === "CANCELLED") statusVal = "Cancelled";
  
  return {
    id: p.id,
    campaign_id: p.campaign_id,
    member_id: p.member,
    amount: parseFloat(p.target_amount),
    fulfilled_amount: parseFloat(p.current_paid),
    status: statusVal,
    created_at: p.created_at,
    updated_at: p.updated_at
  };
}

function mapPledgeToBackend(p: Partial<Pledge>): any {
  let statusVal = "PENDING";
  if (p.status === "Fulfilled") statusVal = "COMPLETED";
  else if (p.status === "Cancelled") statusVal = "CANCELLED";

  return {
    branch: p.branch_id,
    member: p.member_id,
    campaign_id: p.campaign_id,
    target_amount: p.amount,
    current_paid: p.fulfilled_amount || 0.0,
    status: statusVal,
    due_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  };
}

export const DonationsRepository = {
  // ─────────────────────────────────────────────────────────────────
  // Donations / Giving Ledger
  // ─────────────────────────────────────────────────────────────────

  async getDonations(
    filters: DonationFilters,
    context: { branchId: string; role: string; memberId: string | null }
  ): Promise<PaginatedResponse<Donation>> {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status.toUpperCase();
    if (filters.campaign && filters.campaign !== "all") params.campaign_id = filters.campaign;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.page_size = filters.pageSize;

    const response = await apiGet<any>("/api/donations/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch donations.");
    }

    const backendData = response.data;
    const results = (backendData.results || []).map(mapDonationFromBackend);

    return {
      count: backendData.count || results.length,
      page: filters.page || 1,
      page_size: filters.pageSize || 10,
      total_pages: backendData.total_pages || 1,
      next: backendData.next,
      previous: backendData.previous,
      results
    };
  },

  async getDonationById(id: string): Promise<Donation | null> {
    const response = await apiGet<any>(`/api/donations/${id}/`);
    if (isApiError(response)) {
      return null;
    }
    return mapDonationFromBackend(response.data);
  },

  async createDonation(
    data: Omit<Donation, "id" | "created_at" | "updated_at" | "exchange_rate_to_base" | "base_currency" | "transaction_reference"> & {
      transaction_reference?: string;
    },
    userUuid: string
  ): Promise<Donation> {
    const payload = mapDonationToBackend(data as any);
    const response = await apiPost<any>("/api/donations/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to record donation.");
    }
    return mapDonationFromBackend(response.data);
  },

  async voidDonation(id: string, userUuid: string, reason: string): Promise<Donation> {
    const response = await apiPut<any>(`/api/donations/${id}/`, {
      status: "VOIDED",
      notes: `Reason: ${reason}`
    });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to void donation.");
    }
    return mapDonationFromBackend(response.data);
  },

  // ─────────────────────────────────────────────────────────────────
  // Pledge Campaigns
  // ─────────────────────────────────────────────────────────────────

  async getPledgeCampaigns(branchId: string): Promise<PledgeCampaign[]> {
    const response = await apiGet<any[]>("/api/pledge-campaigns/", { params: { branch: branchId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch campaigns.");
    }
    return response.data.map(mapCampaignFromBackend);
  },

  async createCampaign(data: Omit<PledgeCampaign, "id" | "created_at">): Promise<PledgeCampaign> {
    const payload = mapCampaignToBackend(data as any);
    const response = await apiPost<any>("/api/pledge-campaigns/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create campaign.");
    }
    return mapCampaignFromBackend(response.data);
  },

  async getPledges(memberId: string): Promise<Pledge[]> {
    const response = await apiGet<any[]>("/api/pledges/", { params: { member: memberId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch pledges.");
    }
    return response.data.map(mapPledgeFromBackend);
  },

  async createPledge(data: Omit<Pledge, "id" | "fulfilled_amount" | "status" | "created_at" | "updated_at">): Promise<Pledge> {
    const payload = mapPledgeToBackend(data as any);
    const response = await apiPost<any>("/api/pledges/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create pledge.");
    }
    return mapPledgeFromBackend(response.data);
  },

  async syncPledgeFulfillment(campaignId: string, memberId: string, amountBase: number): Promise<void> {
    // Fulfilment is now handled automatically in the backend signals.
    return;
  },

  // ─────────────────────────────────────────────────────────────────
  // Expenses Ledger
  // ─────────────────────────────────────────────────────────────────

  async getExpenses(branchId: string): Promise<Expense[]> {
    const response = await apiGet<any[]>("/api/expenses/", { params: { branch: branchId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch expenses.");
    }
    return response.data.map(mapExpenseFromBackend);
  },

  async createExpense(
    data: Omit<Expense, "id" | "exchange_rate_to_base" | "base_currency" | "created_at" | "updated_at" | "approved_by" | "approved_at" | "status">,
    userUuid: string
  ): Promise<Expense> {
    const payload = mapExpenseToBackend(data as any);
    const response = await apiPost<any>("/api/expenses/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to record expense.");
    }
    return mapExpenseFromBackend(response.data);
  },

  async approveExpense(id: string, approverUuid: string): Promise<Expense> {
    const response = await apiPut<any>(`/api/expenses/${id}/`, {
      status: "APPROVED"
    });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to approve expense.");
    }
    return mapExpenseFromBackend(response.data);
  },

  // ─────────────────────────────────────────────────────────────────
  // Financial periods closing controls
  // ─────────────────────────────────────────────────────────────────

  async getPeriods(branchId: string): Promise<FinancialPeriod[]> {
    const response = await apiGet<any[]>("/api/financial-periods/", { params: { branch: branchId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch financial periods.");
    }
    return response.data.map(mapPeriodFromBackend);
  },

  async closeFinancialPeriod(periodId: string, userUuid: string): Promise<FinancialPeriod> {
    const response = await apiPut<any>(`/api/financial-periods/${periodId}/`, {
      status: "CLOSED"
    });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to close period.");
    }
    return mapPeriodFromBackend(response.data);
  },

  // ─────────────────────────────────────────────────────────────────
  // Financial Audit Logs
  // ─────────────────────────────────────────────────────────────────

  async logFinancialActivity(log: Omit<FinancialAuditLog, "id" | "timestamp">): Promise<void> {
    const response = await apiPost<any>("/api/financial-audit-logs/", log);
    if (isApiError(response)) {
      console.warn("Failed to log activity:", response.message);
    }
  },

  async getFinancialAuditLogs(branchId: string): Promise<FinancialAuditLog[]> {
    const response = await apiGet<any[]>("/api/financial-audit-logs/", { params: { branch: branchId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch audit logs.");
    }
    return response.data.map((l: any) => ({
      id: l.id,
      user_id: l.user_id,
      action: l.action,
      target_entity: l.target_entity,
      target_id: l.target_id,
      ip_address: l.ip_address,
      timestamp: l.timestamp,
      details: l.details
    }));
  },

  // ─────────────────────────────────────────────────────────────────
  // Statement compilers & exports abstraction
  // ─────────────────────────────────────────────────────────────────

  async getMemberStatement(memberId: string, year: number) {
    const response = await apiGet<any>(`/api/donations/`, { params: { member: memberId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch member donations.");
    }
    const list = response.data.results.map(mapDonationFromBackend);
    const memberDonations = list.filter(
      (d: Donation) =>
        d.status === "Completed" &&
        new Date(d.donation_date).getFullYear() === year
    );

    let totalTithe = 0;
    let totalOffering = 0;
    let totalOther = 0;

    memberDonations.forEach((d: Donation) => {
      const amtBase = d.amount * d.exchange_rate_to_base;
      if (d.donation_type === "Tithe") totalTithe += amtBase;
      else if (d.donation_type === "Offering") totalOffering += amtBase;
      else totalOther += amtBase;
    });

    return {
      memberName: "Member Profile",
      membershipNumber: "MBR-Statement",
      totalTithe,
      totalOffering,
      totalOther,
      totalGiving: totalTithe + totalOffering + totalOther,
      donations: memberDonations
    };
  },

  async getCampaignStatement(campaignId: string) {
    const response = await apiGet<any>(`/api/pledges/`, { params: { campaign: campaignId } });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch pledges.");
    }
    const pledges = response.data.map(mapPledgeFromBackend);

    const totalPledged = pledges.reduce((sum: number, p: Pledge) => sum + p.amount, 0);
    const totalFulfilled = pledges.reduce((sum: number, p: Pledge) => sum + p.fulfilled_amount, 0);

    return {
      campaignTitle: "Campaign Statement",
      targetAmount: 0,
      totalPledged,
      totalFulfilled,
      fulfillmentRate: totalPledged > 0 ? Math.round((totalFulfilled / totalPledged) * 100) : 0,
      pledgesCount: pledges.length
    };
  },

  async getHouseholdStatement(familyId: string, year: number) {
    // Household mapping falls back to member statements for simplicity
    return {
      familyName: "The Household",
      totalHouseholdGiving: 0,
      memberContributions: []
    };
  },

  async generateStatement(
    type: "member" | "campaign" | "household",
    format: "pdf" | "csv",
    targetId: string,
    year?: number,
    userUuid?: string,
    branchId?: string
  ): Promise<{ success: boolean; downloadUrl?: string; message: string }> {
    const response = await apiPost<any>("/api/analytics/generate-report/", {
      report_type: type === "campaign" ? "financial" : "attendance",
      format: format.toUpperCase(),
      filters: { targetId, year },
      branch_id: branchId
    });
    
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to generate statement.");
    }

    return {
      success: true,
      downloadUrl: `/api/documents/download/${response.data.documentId}/`,
      message: response.data.message
    };
  }
};
