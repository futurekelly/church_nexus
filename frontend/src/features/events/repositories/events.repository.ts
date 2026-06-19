import type {
  Event,
  EventResource,
  ResourceBooking,
  EventRegistration,
  PaginatedResponse,
  EventFilters,
  RSVPStatus
} from "../types/event.types";
import { apiGet, apiPost, apiPut, apiDelete, isApiError } from "@/services/api-client";

export const EventsRepository = {
  // ─────────────────────────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────────────────────────

  async getEvents(
    filters: EventFilters,
    context?: { branchId: string; role: string }
  ): Promise<PaginatedResponse<Event>> {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.type && filters.type !== "all") params.type = filters.type;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.dateRange) params.dateRange = filters.dateRange;
    if (filters.showArchived) params.show_archived = filters.showArchived;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.page_size = filters.pageSize;

    const response = await apiGet<PaginatedResponse<Event>>("/api/events/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch events from backend.");
    }
    return response.data;
  },

  async getEventById(id: string, context?: { branchId: string; role: string }): Promise<Event | null> {
    const response = await apiGet<Event>(`/api/events/${id}/`);
    if (isApiError(response)) {
      return null;
    }
    return response.data;
  },

  async createEvent(eventData: Omit<Event, "id" | "registered_count" | "created_at" | "updated_at" | "is_archived" | "archived_at">): Promise<Event> {
    const response = await apiPost<Event>("/api/events/", eventData);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create event on backend.");
    }
    return response.data;
  },

  async updateEvent(id: string, updates: Partial<Omit<Event, "id">>): Promise<Event> {
    const response = await apiPut<Event>(`/api/events/${id}/`, updates);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to update event on backend.");
    }
    return response.data;
  },

  async archiveEvent(id: string): Promise<void> {
    const response = await apiPost<any>(`/api/events/${id}/archive/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to archive event on backend.");
    }
  },

  async restoreEvent(id: string): Promise<void> {
    const response = await apiPost<any>(`/api/events/${id}/restore/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to restore event on backend.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Resources & Bookings
  // ─────────────────────────────────────────────────────────────────

  async getResources(branchId: string): Promise<EventResource[]> {
    const response = await apiGet<EventResource[]>("/api/event-resources/");
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch event resources.");
    }
    return response.data;
  },

  async getResourceBookings(eventId: string): Promise<ResourceBooking[]> {
    const params = { event_id: eventId };
    const response = await apiGet<ResourceBooking[]>("/api/resource-bookings/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch resource bookings.");
    }
    return response.data;
  },

  async createResourceBooking(bookingData: Omit<ResourceBooking, "id" | "created_at">): Promise<ResourceBooking> {
    const payload = {
      event_id: bookingData.event_id,
      resource_id: bookingData.resource_id,
      start_time: bookingData.start_time,
      end_time: bookingData.end_time,
      status: bookingData.status
    };
    const response = await apiPost<ResourceBooking>("/api/resource-bookings/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create resource booking.");
    }
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────
  // RSVPs & Registrations
  // ─────────────────────────────────────────────────────────────────

  async getRSVPs(eventId: string): Promise<EventRegistration[]> {
    const params = { event_id: eventId };
    const response = await apiGet<EventRegistration[]>("/api/event-registrations/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch event registrations.");
    }
    
    // Map backend enums back to frontend RSVPStatus
    return response.data.map((r: any) => ({
      ...r,
      status: this.mapBackendStatusToFrontend(r.status)
    }));
  },

  async createRSVP(
    rsvpData: Omit<EventRegistration, "id" | "registration_date" | "attendance_status" | "checked_in_at" | "checked_in_by">
  ): Promise<EventRegistration> {
    const payload = {
      event_id: rsvpData.event_id,
      user_id: rsvpData.user_id || null,
      member_id: rsvpData.member_id || null,
      visitor_name: rsvpData.visitor_name || null,
      visitor_email: rsvpData.visitor_email || null,
      visitor_phone: rsvpData.visitor_phone || null,
      status: this.mapFrontendStatusToBackend(rsvpData.status),
      notes: rsvpData.notes
    };

    const response = await apiPost<EventRegistration>("/api/event-registrations/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create event registration.");
    }
    
    return {
      ...response.data,
      status: this.mapBackendStatusToFrontend(response.data.status)
    };
  },

  async updateRSVPStatus(id: string, status: RSVPStatus): Promise<EventRegistration> {
    const payload = {
      status: this.mapFrontendStatusToBackend(status)
    };
    const response = await apiPut<EventRegistration>(`/api/event-registrations/${id}/`, payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to update RSVP status.");
    }
    return {
      ...response.data,
      status: this.mapBackendStatusToFrontend(response.data.status)
    };
  },

  async checkInAttendee(registrationId: string, checkerUuid: string): Promise<void> {
    const payload = {
      check_in_method: "MANUAL"
    };
    const response = await apiPost<any>(`/api/event-registrations/${registrationId}/check-in/`, payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to check-in attendee on backend.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Status Conversion Helpers
  // ─────────────────────────────────────────────────────────────────

  mapFrontendStatusToBackend(status: RSVPStatus): string {
    const mapping: Record<RSVPStatus, string> = {
      Attending: "REGISTERED",
      Waitlisted: "WAITLISTED",
      Declined: "CANCELLED",
      Tentative: "REGISTERED" // or map to general registered state
    };
    return mapping[status] || "REGISTERED";
  },

  mapBackendStatusToFrontend(status: string): RSVPStatus {
    const mapping: Record<string, RSVPStatus> = {
      REGISTERED: "Attending",
      WAITLISTED: "Waitlisted",
      PROMOTED: "Attending",
      CANCELLED: "Declined",
      ATTENDED: "Attending",
      NO_SHOW: "Declined"
    };
    return mapping[status] || "Attending";
  },

  // ─────────────────────────────────────────────────────────────────
  // LocalStorage Cleanup
  // ─────────────────────────────────────────────────────────────────

  clearObsoleteLocalStorageKeys(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("church-mock-events");
    window.localStorage.removeItem("church-mock-event-registrations");
    window.localStorage.removeItem("church-mock-event-resources");
    window.localStorage.removeItem("church-mock-event-bookings");
    console.log("Obsolete event local storage keys cleared successfully.");
  }
};

if (typeof window !== "undefined") {
  EventsRepository.clearObsoleteLocalStorageKeys();
}
