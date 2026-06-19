import type { ResourceBooking } from "../types/event.types";

export const EventConflictService = {
  /**
   * Evaluates if a resource booking request overlaps with any existing approved bookings.
   * Overlap rule: (S_new < E_existing) AND (E_new > S_existing)
   */
  async detectOverlaps(
    resourceId: string,
    startTime: string,
    endTime: string,
    ignoreEventId?: string
  ): Promise<{ hasConflict: boolean; conflict?: ResourceBooking }> {
    if (typeof window === "undefined") return { hasConflict: false };
    try {
      const bookingsJson = window.localStorage.getItem("church-mock-event-bookings");
      if (!bookingsJson) return { hasConflict: false };
      const bookings: ResourceBooking[] = JSON.parse(bookingsJson);
      
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      if (isNaN(start) || isNaN(end)) {
        return { hasConflict: false };
      }

      const conflict = bookings.find((b) => {
        // Must match same physical resource (hall, room, sound rig)
        if (b.resource_id !== resourceId) return false;
        // Ignore rejected bookings
        if (b.status === "Rejected") return false;
        // Ignore bookings of the event we are editing
        if (ignoreEventId && b.event_id === ignoreEventId) return false;

        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();

        return start < bEnd && end > bStart;
      });

      return {
        hasConflict: !!conflict,
        conflict
      };
    } catch (err) {
      console.error("Conflict checking failure:", err);
      return { hasConflict: false };
    }
  }
};
