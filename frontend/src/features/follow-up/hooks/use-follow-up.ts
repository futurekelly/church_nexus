"use client";

import { useCallback } from "react";
import type { VisitorProfile, FollowUpTicket, ContactHistoryLog, FollowUpStatus, InteractionType } from "../types/follow-up.types";
import { MOCK_VISITOR_PROFILES, MOCK_FOLLOW_UP_TICKETS, MOCK_CONTACT_LOGS } from "../data/mock-visitors";
import { MOCK_MEMBERS } from "@/features/members/data/mock-members";
import type { Member } from "@/features/members/types/member.types";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const VISITORS_KEY = "church-mock-visitors";
const TICKETS_KEY = "church-follow-up-tickets";
const LOGS_KEY = "church-visitor-contact-logs";
const MEMBERS_KEY = "church-mock-members";
const ATTENDANCE_TICKETS_KEY = "church-attendance-follow-up-tickets";

export function useFollowUp() {
  const [visitors, setVisitors] = useLocalStorageState<VisitorProfile[]>(
    VISITORS_KEY,
    MOCK_VISITOR_PROFILES
  );
  const [tickets, setTickets] = useLocalStorageState<FollowUpTicket[]>(
    TICKETS_KEY,
    MOCK_FOLLOW_UP_TICKETS
  );
  const [logs, setLogs] = useLocalStorageState<ContactHistoryLog[]>(
    LOGS_KEY,
    MOCK_CONTACT_LOGS
  );

  // Add a new visitor profile manually + create a New Visitor ticket
  const addVisitor = useCallback((
    profile: Omit<VisitorProfile, "id" | "membership_number" | "date_joined">,
    notes: string
  ) => {
    const newId = `vis-${Date.now()}`;
    const newVisitor: VisitorProfile = {
      ...profile,
      id: newId,
      membership_number: `VST-2026-${Math.floor(100 + Math.random() * 900)}`,
      date_joined: new Date().toISOString(),
      notes: notes || profile.notes || "",
    };

    const newTicket: FollowUpTicket = {
      id: `tkt-${Date.now()}`,
      visitor_id: newId,
      visitor_name: `${profile.first_name} ${profile.last_name}`,
      status: "New Visitor",
      source: "Manual",
      notes: notes || "Visitor registered manually.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_completed: false,
    };

    setVisitors((prev) => [newVisitor, ...prev]);
    setTickets((prev) => [newTicket, ...prev]);
    return newVisitor;
  }, [setVisitors, setTickets]);

  // Update follow-up ticket status
  const updateTicketStatus = useCallback((ticketId: string, status: FollowUpStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            updated_at: new Date().toISOString(),
            is_completed: status === "Active Member",
          };
        }
        return t;
      })
    );
  }, [setTickets]);

  // Log contact history interaction note
  const logInteraction = useCallback((
    visitorId: string,
    interaction_type: InteractionType,
    notes: string,
    contacted_by: string
  ) => {
    const newLog: ContactHistoryLog = {
      id: `log-${Date.now()}`,
      visitor_id: visitorId,
      interaction_type,
      notes,
      contact_date: new Date().toISOString(),
      contacted_by: contacted_by || "Pastor",
    };

    setLogs((prev) => [newLog, ...prev]);

    // Also find the ticket for this visitor and update its status to "Contacted"
    setTickets((prevTickets) =>
      prevTickets.map((t) => {
        if (t.visitor_id === visitorId) {
          return {
            ...t,
            status: "Contacted" as const,
            updated_at: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    return newLog;
  }, [setLogs, setTickets]);

  const importAttendanceTickets = useCallback(() => {
    if (typeof window === "undefined") return;
    const attendanceTicketsJSON = localStorage.getItem(ATTENDANCE_TICKETS_KEY);
    if (!attendanceTicketsJSON) return;

    try {
      const attendanceTickets = JSON.parse(attendanceTicketsJSON);
      if (!Array.isArray(attendanceTickets) || attendanceTickets.length === 0) return;

      let importedCount = 0;
      let newVisitors = [...visitors];
      let newTickets = [...tickets];

      attendanceTickets.forEach((tkt) => {
        const alreadyExists = newTickets.some(
          (t) => t.source === "Attendance Absentee" && t.notes.includes(tkt.id)
        );
        if (alreadyExists) return;

        const visitorId = `vis-mem-${tkt.member_id}`;
        let visitorProfile = newVisitors.find((v) => v.id === visitorId);
        if (!visitorProfile) {
          visitorProfile = {
            id: visitorId,
            membership_number: `VST-ATT-${Math.floor(100 + Math.random() * 900)}`,
            first_name: tkt.member_name.split(" ")[0] || "Absentee",
            last_name: tkt.member_name.split(" ").slice(1).join(" ") || "Member",
            email: tkt.email || '',
            phone_number: "",
            gender: "male",
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
        setVisitors(newVisitors);
        setTickets(newTickets);
        localStorage.removeItem(ATTENDANCE_TICKETS_KEY);
      }
    } catch (err) {
      console.warn("Importing attendance tickets failed", err);
    }
  }, [visitors, tickets, setVisitors, setTickets]);

  // Convert follow-up ticket/visitor to active member
  const convertToActiveMember = useCallback((ticketId: string) => {
    const currentTickets = tickets;
    const currentVisitors = visitors;

    const ticket = currentTickets.find((t) => t.id === ticketId);
    if (!ticket) return null;

    const visitor = currentVisitors.find((v) => v.id === ticket.visitor_id);
    if (!visitor) return null;

    const storedMembers = typeof window !== "undefined" ? localStorage.getItem(MEMBERS_KEY) : null;
    const currentMembers: Member[] = storedMembers ? JSON.parse(storedMembers) : MOCK_MEMBERS;

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
      finalMemberId = `m0${currentMembers.length + 1}`;
      const newMember: Member = {
        id: finalMemberId,
        branch_id: "branch-001",
        family_id: null,
        membership_number: `MBR-2026-${String(Math.floor(100 + Math.random() * 900)).padStart(6, "0")}`,
        first_name: visitor.first_name,
        last_name: visitor.last_name,
        profile_photo: null,
        gender: visitor.gender,
        date_of_birth: "1995-01-01",
        marriage_anniversary_date: null,
        marital_status: "Single",
        occupation: null,
        education_level: null,
        national_id_passport: null,
        email: visitor.email,
        phone_number: visitor.phone_number,
        address: "Nairobi, Kenya",
        status: "Active",
        member_type: "Regular",
        baptism_status: "Not Baptized",
        baptism_date: null,
        baptism_place: null,
        baptism_officiant: null,
        salvation_status: "Born Again",
        salvation_date: new Date().toISOString().split("T")[0],
        join_date: new Date().toISOString().split("T")[0],
        date_joined: new Date().toISOString().split("T")[0],
        emergency_name: null,
        emergency_relationship: null,
        emergency_phone: null,
        pastoral_notes: null,
        notes: `Converted from visitor follow-up ticket. Notes: ${visitor.notes || ""}`,
        role: "member",
        ministries: [],
        custom_fields: {},
        communication_preferences: { email: true, sms: true, in_app: true },
        donor_status: "Non-Donor",
        recurring_giving_opt_in: false,
        is_archived: false,
        archived_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedMembers = [...currentMembers, newMember];
      localStorage.setItem(MEMBERS_KEY, JSON.stringify(updatedMembers));
      
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("local-storage-update", {
            detail: { key: MEMBERS_KEY, newValue: updatedMembers },
          })
        );
      }
    }

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

    setTickets(updatedTickets);

    return finalMemberId;
  }, [tickets, visitors, setTickets]);

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
