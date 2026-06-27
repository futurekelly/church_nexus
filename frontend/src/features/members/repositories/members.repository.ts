import type { 
  Member, Family, FamilyRelationship, VolunteerAssignment, 
  MemberLifecycleTimeline, GroupMembership, PaginatedResponse, 
  MemberFilters, MemberSortConfig, MemberStatus 
} from "../types/member.types";
import { 
  MOCK_VOLUNTEER_ASSIGNMENTS, MOCK_GROUP_MEMBERSHIPS 
} from "../data/mock-members";
import { apiGet, apiPost, apiPut, apiDelete, isApiError } from "@/services/api-client";

const VOLUNTEER_KEY = "church-mock-volunteer-assignments";
const GROUP_MEMBERSHIP_KEY = "church-mock-group-memberships";

// Helper to check window and get items (for localStorage mock fallback only)
function getStoredItems<T>(key: string, defaultItems: T[]): T[] {
  if (typeof window === "undefined") return defaultItems;
  try {
    const data = window.localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    } else {
      window.localStorage.setItem(key, JSON.stringify(defaultItems));
      return defaultItems;
    }
  } catch (err) {
    console.warn(`Error reading localStorage for key ${key}`, err);
    return defaultItems;
  }
}

// Helper to save items (for localStorage mock fallback only)
function setStoredItems<T>(key: string, items: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent("local-storage-update", {
        detail: { key, newValue: items }
      })
    );
  } catch (err) {
    console.warn(`Error writing localStorage for key ${key}`, err);
  }
}

function mapMemberFromBackend(item: any): Member {
  const dateVal = item.join_date || item.date_joined || new Date().toISOString().split("T")[0];
  return {
    ...item,
    address: item.address ?? "",
    join_date: dateVal,
    date_joined: dateVal,
    role: item.role || item.member_type || "Regular",
    ministries: item.ministries || [],
    notes: item.notes || item.pastoral_notes || "",
  };
}

export const MembersRepository = {
  /**
   * Fetches members scoped by branch, filters, and computed aggregations from backend API.
   */
  async getMembers(
    filters: MemberFilters,
    context: { branchId: string; role: string }
  ): Promise<PaginatedResponse<Member>> {
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "all") params.status = filters.status;
    if (filters.gender && filters.gender !== "all") params.gender = filters.gender;
    if (filters.role && filters.role !== "all") params.role = filters.role;
    if (filters.page) params.page = filters.page;
    if (filters.pageSize) params.page_size = filters.pageSize;

    const response = await apiGet<PaginatedResponse<any>>("/api/members/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch members from backend API.");
    }
    const rawData = response.data;
    let results: Member[] = [];
    if (rawData) {
      if (Array.isArray(rawData.results)) {
        results = rawData.results.map(mapMemberFromBackend);
      } else if (Array.isArray(rawData)) {
        results = rawData.map(mapMemberFromBackend);
      }
    }
    return {
      count: rawData?.count ?? results.length,
      page: rawData?.page ?? 1,
      page_size: rawData?.page_size ?? 20,
      total_pages: rawData?.total_pages ?? 1,
      next: rawData?.next ?? null,
      previous: rawData?.previous ?? null,
      results
    };
  },

  /**
   * Fetches single member profile from backend API.
   */
  async getMemberById(id: string, context: { branchId: string; role: string }): Promise<Member | null> {
    const response = await apiGet<any>(`/api/members/${id}/`);
    if (isApiError(response) || !response.data) {
      return null;
    }
    return mapMemberFromBackend(response.data);
  },

  /**
   * Creates new member record on the backend.
   */
  async createMember(
    data: any,
    changedBy: string
  ): Promise<Member> {
    const payload = {
      ...data,
      join_date: data.join_date || data.date_joined || new Date().toISOString().split("T")[0]
    };
    
    const response = await apiPost<any>("/api/members/", payload);
    if (isApiError(response) || !response.data) {
      throw new Error(response.message || "Failed to create member on the backend.");
    }
    return mapMemberFromBackend(response.data);
  },

  /**
   * Updates profile data on the backend.
   */
  async updateMember(
    id: string,
    updates: Partial<Member>,
    changedBy: string,
    notes?: string
  ): Promise<Member> {
    const payload = {
      ...updates,
      join_date: updates.join_date || updates.date_joined,
      status_notes: notes || "Profile update status change"
    };

    const response = await apiPut<any>(`/api/members/${id}/`, payload);
    if (isApiError(response) || !response.data) {
      throw new Error(response.message || "Failed to update member on the backend.");
    }
    return mapMemberFromBackend(response.data);
  },

  /**
   * Soft deletes member profile by hitting the /archive/ custom action on the backend.
   */
  async archiveMember(id: string): Promise<void> {
    const response = await apiPost<any>(`/api/members/${id}/archive/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to archive member on the backend.");
    }
  },

  /**
   * Restores soft deleted member profile by hitting the /restore/ custom action on the backend.
   */
  async restoreMember(id: string): Promise<void> {
    const response = await apiPost<any>(`/api/members/${id}/restore/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to restore member on the backend.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Families & Relationships
  // ─────────────────────────────────────────────────────────────────

  async getFamilies(branchId: string): Promise<Family[]> {
    const response = await apiGet<Family[]>("/api/families/");
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch families from the backend.");
    }
    return response.data;
  },

  async createFamily(data: any): Promise<Family> {
    const response = await apiPost<Family>("/api/families/", data);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create family on the backend.");
    }
    return response.data;
  },

  /**
   * Returns bidirectional relationships from the backend, projecting computed reciprocal mappings.
   */
  async getFamilyRelationships(memberId: string): Promise<FamilyRelationship[]> {
    const response = await apiGet<FamilyRelationship[]>(`/api/members/${memberId}/relationships/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch family relationships from the backend.");
    }
    return response.data;
  },

  async createFamilyRelationship(data: any): Promise<FamilyRelationship> {
    const payload = {
      from_member: data.from_member_id,
      to_member: data.to_member_id,
      relationship_type: data.relationship_type
    };

    const response = await apiPost<FamilyRelationship>("/api/family-relationships/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create relationship on the backend.");
    }
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────
  // Volunteer Ministry Assignments (Remaining in localStorage for now)
  // ─────────────────────────────────────────────────────────────────

  async getVolunteerAssignments(memberId: string): Promise<VolunteerAssignment[]> {
    const list = getStoredItems<VolunteerAssignment>(VOLUNTEER_KEY, MOCK_VOLUNTEER_ASSIGNMENTS);
    return list.filter((v) => v.member_id === memberId && v.is_active);
  },

  async createVolunteerAssignment(data: Omit<VolunteerAssignment, "id" | "assigned_at" | "is_active">): Promise<VolunteerAssignment> {
    const list = getStoredItems<VolunteerAssignment>(VOLUNTEER_KEY, MOCK_VOLUNTEER_ASSIGNMENTS);
    
    // Deactivate existing assignment to same ministry if exists
    const cleanedList = list.map((v) => 
      v.member_id === data.member_id && v.ministry_name === data.ministry_name
        ? { ...v, is_active: false }
        : v
    );

    const newVol: VolunteerAssignment = {
      ...data,
      id: `vol-${Date.now()}`,
      assigned_at: new Date().toISOString(),
      is_active: true
    };

    setStoredItems(VOLUNTEER_KEY, [...cleanedList, newVol]);
    return newVol;
  },

  // ─────────────────────────────────────────────────────────────────
  // Connect Group Memberships (Remaining in localStorage for now)
  // ─────────────────────────────────────────────────────────────────

  async getGroupMemberships(memberId: string): Promise<GroupMembership[]> {
    const list = getStoredItems<GroupMembership>(GROUP_MEMBERSHIP_KEY, MOCK_GROUP_MEMBERSHIPS);
    return list.filter((g) => g.member_id === memberId && g.status === "Active");
  },

  async createGroupMembership(data: Omit<GroupMembership, "id" | "joined_at" | "exited_at" | "status">): Promise<GroupMembership> {
    const list = getStoredItems<GroupMembership>(GROUP_MEMBERSHIP_KEY, MOCK_GROUP_MEMBERSHIPS);
    
    const activeCount = list.filter((g) => g.member_id === data.member_id && g.status === "Active").length;
    if (activeCount >= 2) {
      throw new Error("Validation Limit: Member cannot belong to more than 2 active Connect Groups simultaneously.");
    }

    const newGmem: GroupMembership = {
      ...data,
      id: `gmem-${Date.now()}`,
      joined_at: new Date().toISOString(),
      exited_at: null,
      status: "Active"
    };

    setStoredItems(GROUP_MEMBERSHIP_KEY, [...list, newGmem]);
    return newGmem;
  },

  // ─────────────────────────────────────────────────────────────────
  // Visitor-to-Member Conversion
  // ─────────────────────────────────────────────────────────────────

  async convertVisitorToMember(visitorEmail: string, visitorPhone: string, memberId: string): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const rsvpsJson = window.localStorage.getItem("church-mock-event-registrations");
      if (rsvpsJson) {
        const rsvpList = JSON.parse(rsvpsJson);
        const emailLower = visitorEmail.toLowerCase();
        
        const updatedRsvps = rsvpList.map((r: any) => {
          const matchEmail = r.visitor_email && r.visitor_email.toLowerCase() === emailLower;
          const matchPhone = r.visitor_phone && String(r.visitor_phone).replace(/\s/g, "") === visitorPhone.replace(/\s/g, "");
          
          if (matchEmail || matchPhone) {
            return {
              ...r,
              member_id: memberId,
              visitor_name: null,
              visitor_email: null,
              visitor_phone: null
            };
          }
          return r;
        });

        window.localStorage.setItem("church-mock-event-registrations", JSON.stringify(updatedRsvps));
        window.dispatchEvent(
          new CustomEvent("local-storage-update", {
            detail: { key: "church-mock-event-registrations", newValue: updatedRsvps }
          })
        );
      }
    } catch (err) {
      console.error("Failed to migrate visitor RSVPs to member UUID:", err);
    }
  },

  /**
   * Clean up obsolete local storage keys.
   */
  clearObsoleteLocalStorageKeys(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("church-mock-members");
    window.localStorage.removeItem("church-mock-families");
    window.localStorage.removeItem("church-mock-family-relationships");
    window.localStorage.removeItem("church-mock-lifecycle-timeline");
    console.log("Obsolete local storage keys cleared successfully.");
  }
};

// Self-executing cleanup of obsolete local storage keys
if (typeof window !== "undefined") {
  MembersRepository.clearObsoleteLocalStorageKeys();
}
