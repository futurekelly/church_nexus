"use client";

import { useState, useEffect, useCallback } from "react";
import type { VisitorProfile, FollowUpTicket, ContactHistoryLog, FollowUpStatus, InteractionType } from "../types/follow-up.types";
import { MOCK_VISITOR_PROFILES, MOCK_FOLLOW_UP_TICKETS, MOCK_CONTACT_LOGS } from "../data/mock-visitors";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import type { Member } from "@/features/members/types/member.types";

const VISITORS_KEY = "church-mock-visitors";
const TICKETS_KEY = "church-follow-up-tickets";
const LOGS_KEY = "church-visitor-contact-logs";
const MEMBERS_KEY = "church-mock-members";
const ATTENDANCE_TICKETS_KEY = "church-attendance-follow-up-tickets";

const getStoredData = <T>(key: string, initialData: T): T => {
  if (typeof window === "undefined") return initialData;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialData;
    }
  }
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

const notifyFollowUpChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("church-follow-up-update"));
  }
};

export function useFollowUp() {
  const [visitors, setVisitors] = useState<VisitorProfile[]>([]);
  const [tickets, setTickets] = useState<FollowUpTicket[]>([]);
  const [logs, setLogs] = useState<ContactHistoryLog[]>([]);

  const reloadData = useCallback(() => {
    setVisitors(getStoredData(VISITORS_KEY, MOCK_VISITOR_PROFILES));
    setTickets(getStoredData(TICKETS_KEY, MOCK_FOLLOW_UP_TICKETS));
    setLogs(getStoredData(LOGS_KEY, MOCK_CONTACT_LOGS));
  }, []);

  // Run on initial mount and setup event listener
  useEffect(() => {
    reloadData();
    if (typeof window !== "undefined") {
      window.addEventListener("church-follow-up-update", reloadData);
      return () => {
        window.removeEventListener("church-follow-up-update", reloadData);
      };
    }
  }, [reloadData]);

  // Add a new visitor profile manually + create a New Visitor ticket
  const addVisitor = useCallback((
    profile: Omit<VisitorProfile, "id" | "membership_number" | "date_joined">,
    notes: string
  ) => {
    const currentVisitors = getStoredData(VISITORS_KEY, MOCK_VISITOR_PROFILES);
    const currentTickets = getStoredData(TICKETS_KEY, MOCK_FOLLOW_UP_TICKETS);

    const visitorId = `vis-${Date.now()}`;
    const newProfile: VisitorProfile = {
      ...profile,
      id: visitorId,
      membership_number: `VST-2026-${Math.floor(100 + Math.random() * 900)}`,
      date_joined: new Date().toISOString(),
    };

    const ticketId = `tkt-${Date.now()}`;
    const newTicket: FollowUpTicket = {
      id: ticketId,
      visitor_id: visitorId,
      visitor_name: `${profile.first_name} ${profile.last_name}`,
      status: "New Visitor",
      source: "Manual",
      notes: notes || "Visitor registered manually.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_completed: false,
    };

    const updatedVisitors = [...currentVisitors, newProfile];
    const updatedTickets = [newTicket, ...currentTickets];

    localStorage.setItem(VISITORS_KEY, JSON.stringify(updatedVisitors));
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
    notifyFollowUpChange();
    return newProfile;
  }, []);

  // Update follow-up ticket status
  const updateTicketStatus = useCallback((ticketId: string, status: FollowUpStatus) => {
    const currentTickets = getStoredData(TICKETS_KEY, MOCK_FOLLOW_UP_TICKETS);
    const updatedTickets = currentTickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status,
          updated_at: new Date().toISOString(),
          is_completed: status === "Active Member",
        };
      }
      return t;
    });

    localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
    notifyFollowUpChange();
  }, []);

  // Log contact history interaction note
  const logInteraction = useCallback((
    visitorId: string,
    interaction_type: InteractionType,
    notes: string,
    contacted_by: string
  ) => {
    const currentLogs = getStoredData(LOGS_KEY, MOCK_CONTACT_LOGS);
    const newLog: ContactHistoryLog = {
      id: `log-${Date.now()}`,
      visitor_id: visitorId,
      interaction_type,
      notes,
      contact_date: new Date().toISOString(),
      contacted_by: contacted_by || "Pastor",
    };

    const updatedLogs = [newLog, ...currentLogs];
    localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    notifyFollowUpChange();
    return newLog;
  }, []);

  // Import tickets logged from Attendance module
  const importAttendanceTickets = useCallback(() => {
    if (typeof window === "undefined") return;
    const attendanceTicketsJSON = localStorage.getItem(ATTENDANCE_TICKETS_KEY);
    if (!attendanceTicketsJSON) return;

    try {
      const attendanceTickets = JSON.parse(attendanceTicketsJSON);
      if (!Array.isArray(attendanceTickets) || attendanceTickets.length === 0) return;

      const currentVisitors = getStoredData(VISITORS_KEY, MOCK_VISITOR_PROFILES);
      const currentTickets = getStoredData(TICKETS_KEY, MOCK_FOLLOW_UP_TICKETS);

      let newVisitors = [...currentVisitors];
      let newTickets = [...currentTickets];
      let importedCount = 0;

      attendanceTickets.forEach((tkt) => {
        // Double import check
        const alreadyExists = newTickets.some(
          (t) => t.source === "Attendance Absentee" && t.notes.includes(tkt.id)
        );
        if (alreadyExists) return;

        // Generate visitor profile for the member who missed service
        const visitorId = `vis-mem-${tkt.member_id}`;
        
        // Find existing visitor or create
        let visitorProfile = newVisitors.find((v) => v.id === visitorId);
        if (!visitorProfile) {
          visitorProfile = {
            id: visitorId,
            membership_number: `VST-ATT-${Math.floor(100 + Math.random() * 900)}`,
            first_name: tkt.member_name.split(" ")[0] || "Absentee",
            last_name: tkt.member_name.split(" ").slice(1).join(" ") || "Member",
            email: `${tkt.member_id}@church-nexus.com`, // Simulated email
            phone_number: "+254 700 000 000",
            gender: "male", // default fallback
            date_joined: new Date().toISOString(),
            first_time_visitor: false,
            notes: `Auto-generated from absentee check-in session: ${tkt.session_title}.`,
          };
          newVisitors.push(visitorProfile);
        }

        const newTicket: FollowUpTicket = {
          id: `tkt-att-${Date.now()}-${tkt.id}`,
          visitor_id: visitorId,
          visitor_name: tkt.member_name,
          status: "New Visitor",
          source: "Attendance Absentee",
          notes: `Absentee ticket ${tkt.id} from ${tkt.session_title} on ${new Date(tkt.session_date).toLocaleDateString()}. Reason: ${tkt.reason}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_completed: false,
        };

        newTickets.unshift(newTicket);
        importedCount++;
      });

      if (importedCount > 0) {
        localStorage.setItem(VISITORS_KEY, JSON.stringify(newVisitors));
        localStorage.setItem(TICKETS_KEY, JSON.stringify(newTickets));
        // Clear processed items
        localStorage.removeItem(ATTENDANCE_TICKETS_KEY);
        notifyFollowUpChange();
      }
    } catch (err) {
      console.warn("Importing attendance tickets failed", err);
    }
  }, []);

  // Convert follow-up ticket/visitor to active member
  const convertToActiveMember = useCallback((ticketId: string) => {
    const currentTickets = getStoredData(TICKETS_KEY, MOCK_FOLLOW_UP_TICKETS);
    const currentVisitors = getStoredData(VISITORS_KEY, MOCK_VISITOR_PROFILES);
    const currentMembers = getStoredData(MEMBERS_KEY, MOCK_MEMBERS);

    const ticket = currentTickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    const visitor = currentVisitors.find((v) => v.id === ticket.visitor_id);
    if (!visitor) return null;

    // Check if member already exists to prevent duplicate creation
    const emailLower = visitor.email.toLowerCase();
    const nameMatch = (first: string, last: string) => 
      first.toLowerCase() === visitor.first_name.toLowerCase() && 
      last.toLowerCase() === visitor.last_name.toLowerCase();

    const existingMember = currentMembers.find(
      (m) => m.email.toLowerCase() === emailLower || nameMatch(m.first_name, m.last_name)
    );

    let finalMemberId = "";

    if (existingMember) {
      finalMemberId = existingMember.id;
    } else {
      // Create new member record
      finalMemberId = `m0${currentMembers.length + 1}`;
      const newMember: Member = {
        id: finalMemberId,
        membership_number: `CN-2026-${Math.floor(100 + Math.random() * 900)}`,
        first_name: visitor.first_name,
        last_name: visitor.last_name,
        email: visitor.email,
        phone_number: visitor.phone_number,
        gender: visitor.gender,
        date_of_birth: "1995-01-01", // Default placeholder
        address: "Nairobi, Kenya", // Default placeholder
        date_joined: new Date().toISOString().split("T")[0],
        status: "active",
        role: "member",
        ministries: [],
        notes: `Converted from visitor follow-up ticket. Notes: ${visitor.notes || ""}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedMembers = [...currentMembers, newMember];
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedMembers));
      
      // Notify members route to refresh
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("church-members-update"));
      }
    }

    // Complete the ticket and transition status
    const updatedTickets = currentTickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: "Active Member" as const,
          is_completed: true,
          converted_member_id: finalMemberId,
          updated_at: new Date().toISOString(),
        };
      }
      return t;
    });

    localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
    notifyFollowUpChange();

    return finalMemberId;
  }, []);

  return {
    visitors,
    tickets,
    logs,
    addVisitor,
    updateTicketStatus,
    logInteraction,
    importAttendanceTickets,
    convertToActiveMember,
  };
}
