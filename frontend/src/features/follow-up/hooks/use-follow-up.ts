"use client";

import { useState, useEffect, useCallback } from "react";
import type { VisitorProfile, FollowUpTicket, ContactHistoryLog, FollowUpStatus, InteractionType } from "../types/follow-up.types";
import { apiGet, apiPost, apiPatch, isApiError } from "@/services/api-client";
import { toast } from "sonner";

export function useFollowUp() {
  const [visitors, setVisitors] = useState<VisitorProfile[]>([]);
  const [tickets, setTickets] = useState<FollowUpTicket[]>([]);
  const [logs, setLogs] = useState<ContactHistoryLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mapper utilities
  const mapTicketToFrontend = useCallback((t: any): FollowUpTicket => ({
    id: t.id,
    visitor_id: t.visitor,
    visitor_name: t.visitor_details ? `${t.visitor_details.first_name} ${t.visitor_details.last_name}` : "Unknown Visitor",
    status: t.status as FollowUpStatus,
    source: t.source,
    assigned_pastor: t.assigned_pastor_details ? `${t.assigned_pastor_details.first_name} ${t.assigned_pastor_details.last_name}` : undefined,
    notes: t.notes || "",
    created_at: t.created_at,
    updated_at: t.updated_at,
    is_completed: t.is_completed,
    converted_member_id: t.visitor_details?.member || undefined,
  }), []);

  const mapLogToFrontend = useCallback((l: any): ContactHistoryLog => ({
    id: l.id,
    visitor_id: l.visitor,
    interaction_type: l.interaction_type as InteractionType,
    notes: l.notes,
    contact_date: l.contact_date,
    contacted_by: l.contacted_by_details ? `${l.contacted_by_details.first_name} ${l.contacted_by_details.last_name}`.trim() : "Pastor",
  }), []);

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vRes, tRes, lRes] = await Promise.all([
        apiGet<any[]>("/api/follow-up/visitors/"),
        apiGet<any[]>("/api/follow-up/tickets/"),
        apiGet<any[]>("/api/follow-up/logs/"),
      ]);

      if (!isApiError(vRes)) {
        setVisitors(vRes.data);
      }
      if (!isApiError(tRes)) {
        setTickets(tRes.data.map(mapTicketToFrontend));
      }
      if (!isApiError(lRes)) {
        setLogs(lRes.data.map(mapLogToFrontend));
      }
    } catch (err: any) {
      console.error("Failed to fetch follow-up data:", err);
      toast.error("Failed to sync follow-up data with backend.");
    } finally {
      setIsLoading(false);
    }
  }, [mapTicketToFrontend, mapLogToFrontend]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add a new visitor profile manually + create a New Visitor ticket
  const addVisitor = useCallback(async (
    profile: Omit<VisitorProfile, "id" | "membership_number" | "date_joined">,
    notes: string
  ) => {
    setIsLoading(true);
    try {
      const payload = {
        ...profile,
        notes: notes || ""
      };
      const response = await apiPost<any>("/api/follow-up/visitors/", payload);
      if (!isApiError(response)) {
        toast.success("Visitor registered successfully.");
        await fetchData(); // Reload all board lists
        return response.data as VisitorProfile;
      } else {
        toast.error(`Registration failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to add visitor:", err);
      const detail = err.response?.data?.email || err.message;
      toast.error(`Registration failed: ${detail}`);
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [fetchData]);

  // Update follow-up ticket status
  const updateTicketStatus = useCallback(async (ticketId: string, status: FollowUpStatus) => {
    try {
      const response = await apiPatch<any>(`/api/follow-up/tickets/${ticketId}/`, { status });
      if (!isApiError(response)) {
        toast.success(`Ticket advanced to ${status}.`);
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? mapTicketToFrontend(response.data) : t))
        );
      } else {
        toast.error(`Status update failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error("Invalid status transition or permission denied.");
    }
  }, [mapTicketToFrontend]);

  // Log contact history interaction note
  const logInteraction = useCallback(async (
    visitorId: string,
    interaction_type: InteractionType,
    notes: string,
    contacted_by: string
  ) => {
    const ticket = tickets.find((t) => t.visitor_id === visitorId && !t.is_completed);
    if (!ticket) {
      toast.error("No active follow-up ticket found for this visitor.");
      return null;
    }

    try {
      const payload = {
        interaction_type,
        notes,
        contact_date: new Date().toISOString()
      };
      
      const response = await apiPost<any>(`/api/follow-up/tickets/${ticket.id}/log-interaction/`, payload);
      if (!isApiError(response)) {
        toast.success("Touchpoint logged successfully.");
        await fetchData(); // Reload to refresh timeline and update ticket column
        return mapLogToFrontend(response.data);
      } else {
        toast.error(`Log touchpoint failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to log interaction:", err);
      toast.error("Failed to log touchpoint.");
    }
    return null;
  }, [tickets, fetchData, mapLogToFrontend]);

  // Convert follow-up ticket/visitor to active member
  const convertToActiveMember = useCallback(async (ticketId: string) => {
    try {
      const response = await apiPost<any>(`/api/follow-up/tickets/${ticketId}/integrate/`, {});
      if (!isApiError(response)) {
        toast.success("Visitor promoted to Active Member successfully.");
        await fetchData();
        return response.data.member_id;
      } else {
        toast.error(`Promotion failed: ${response.message}`);
      }
    } catch (err: any) {
      console.error("Failed to integrate visitor:", err);
      toast.error("Promotion failed. Please check permissions or data validity.");
    }
    return null;
  }, [fetchData]);

  // Re-fetch attendance trigger (no-op or sync trigger)
  const importAttendanceTickets = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    visitors,
    tickets,
    logs,
    isLoading,
    addVisitor,
    updateTicketStatus,
    logInteraction,
    importAttendanceTickets,
    convertToActiveMember,
  };
}
