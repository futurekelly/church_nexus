"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { DonationRecord, PledgeCampaign, DonationReceipt } from "../types/donations.types";
import { MOCK_DONATIONS, MOCK_CAMPAIGNS, MOCK_RECEIPTS } from "../data/mock-donations";

const DONATIONS_KEY = "church-mock-donations";
const CAMPAIGNS_KEY = "church-mock-pledges";
const RECEIPTS_KEY = "church-mock-receipts";

export function useDonations() {
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [campaigns, setCampaigns] = useState<PledgeCampaign[]>([]);
  const [receipts, setReceipts] = useState<DonationReceipt[]>([]);

  // Reload data from localStorage
  const reloadData = useCallback(() => {
    if (typeof window === "undefined") return;

    // Load Donations
    const storedDonations = localStorage.getItem(DONATIONS_KEY);
    let loadedDonations: DonationRecord[] = [];
    if (storedDonations) {
      try {
        loadedDonations = JSON.parse(storedDonations);
      } catch {
        loadedDonations = MOCK_DONATIONS;
      }
    } else {
      localStorage.setItem(DONATIONS_KEY, JSON.stringify(MOCK_DONATIONS));
      loadedDonations = MOCK_DONATIONS;
    }
    setDonations(loadedDonations);

    // Load Campaigns
    const storedCampaigns = localStorage.getItem(CAMPAIGNS_KEY);
    let loadedCampaigns: PledgeCampaign[] = [];
    if (storedCampaigns) {
      try {
        loadedCampaigns = JSON.parse(storedCampaigns);
      } catch {
        loadedCampaigns = MOCK_CAMPAIGNS;
      }
    } else {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(MOCK_CAMPAIGNS));
      loadedCampaigns = MOCK_CAMPAIGNS;
    }
    setCampaigns(loadedCampaigns);

    // Load Receipts
    const storedReceipts = localStorage.getItem(RECEIPTS_KEY);
    let loadedReceipts: DonationReceipt[] = [];
    if (storedReceipts) {
      try {
        loadedReceipts = JSON.parse(storedReceipts);
      } catch {
        loadedReceipts = MOCK_RECEIPTS;
      }
    } else {
      localStorage.setItem(RECEIPTS_KEY, JSON.stringify(MOCK_RECEIPTS));
      loadedReceipts = MOCK_RECEIPTS;
    }
    setReceipts(loadedReceipts);
  }, []);

  useEffect(() => {
    reloadData();
    
    // Listen for storage events or custom updates
    if (typeof window !== "undefined") {
      const handleUpdate = () => reloadData();
      window.addEventListener("church-donations-update", handleUpdate);
      return () => {
        window.removeEventListener("church-donations-update", handleUpdate);
      };
    }
  }, [reloadData]);

  // Trigger global update event
  const triggerUpdate = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("church-donations-update"));
    }
  }, []);

  // Record a new donation
  const addDonation = useCallback((donationData: {
    member_id: string | null;
    donor_name: string;
    donor_email?: string;
    amount: number;
    type: DonationRecord["type"];
    payment_method: DonationRecord["payment_method"];
    notes?: string;
    campaign_id?: string; // Optional campaign target
  }) => {
    const nextId = `don-${Date.now()}`;
    const refPrefix = donationData.payment_method === "M-Pesa" ? "MP-" : 
                      donationData.payment_method === "Card" ? "CRD-" :
                      donationData.payment_method === "Bank Transfer" ? "BK-" : "CSH-";
    
    const referenceNumber = `${refPrefix}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newDonation: DonationRecord = {
      id: nextId,
      member_id: donationData.member_id,
      donor_name: donationData.donor_name,
      donor_email: donationData.donor_email,
      amount: donationData.amount,
      type: donationData.type,
      payment_method: donationData.payment_method,
      status: "Completed",
      notes: donationData.notes,
      created_at: new Date().toISOString(),
      reference_number: referenceNumber,
    };

    // 1. Save donation
    const updatedDonations = [newDonation, ...donations];
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(updatedDonations));

    // 2. Generate and save Receipt
    const receiptNumStr = String(receipts.length + 1).padStart(3, "0");
    const newReceipt: DonationReceipt = {
      id: `rec-${nextId}`,
      donation_id: nextId,
      receipt_number: `REC-2026-${receiptNumStr}`,
      issued_at: newDonation.created_at,
    };
    const updatedReceipts = [newReceipt, ...receipts];
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(updatedReceipts));

    // 3. Increment campaign if campaign_id is provided or matches campaign type
    let updatedCampaigns = [...campaigns];
    const targetCampaignId = donationData.campaign_id || 
      (donationData.type === "Building Fund" ? "camp-building" : 
       donationData.type === "Outreach" ? "camp-youth" : undefined);

    if (targetCampaignId) {
      updatedCampaigns = campaigns.map((campaign) => {
        if (campaign.id === targetCampaignId) {
          const newRaised = campaign.raised_amount + donationData.amount;
          return {
            ...campaign,
            raised_amount: newRaised,
            status: newRaised >= campaign.target_amount ? "Fulfilled" as const : campaign.status,
          };
        }
        return campaign;
      });
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updatedCampaigns));
    }

    triggerUpdate();
    return newDonation;
  }, [donations, campaigns, receipts, triggerUpdate]);

  // Helper to retrieve receipt details
  const getReceiptForDonation = useCallback((donationId: string) => {
    const receipt = receipts.find((r) => r.donation_id === donationId);
    if (receipt) return receipt;
    // Fallback if not found, dynamically generate
    return {
      id: `rec-${donationId}`,
      donation_id: donationId,
      receipt_number: `REC-2026-TMP`,
      issued_at: new Date().toISOString(),
    };
  }, [receipts]);

  // Helper to fetch single donation
  const getDonationById = useCallback((id: string) => {
    return donations.find((d) => d.id === id) ?? null;
  }, [donations]);

  return {
    donations,
    campaigns,
    receipts,
    addDonation,
    getDonationById,
    getReceiptForDonation,
  };
}
