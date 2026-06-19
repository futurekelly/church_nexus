import type {
  ConnectGroup,
  GroupMember,
  GroupAttendance,
  GroupPrayerRequest,
  StudyOutline,
  GroupRole
} from "../types/group.types";
import { apiGet, apiPost, apiPut, apiDelete, isApiError } from "@/services/api-client";

export const GroupsRepository = {
  // ─────────────────────────────────────────────────────────────────
  // Connect Groups
  // ─────────────────────────────────────────────────────────────────

  async getGroups(context?: { branchId: string; role: string }): Promise<ConnectGroup[]> {
    const response = await apiGet<ConnectGroup[]>("/api/groups/");
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch connect groups from backend.");
    }
    return response.data;
  },

  async createGroup(data: Omit<ConnectGroup, "id" | "created_at">): Promise<ConnectGroup> {
    const response = await apiPost<ConnectGroup>("/api/groups/", data);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create connect group on backend.");
    }
    return response.data;
  },

  async updateGroup(id: string, updates: Partial<Omit<ConnectGroup, "id" | "created_at">>): Promise<ConnectGroup> {
    const response = await apiPut<ConnectGroup>(`/api/groups/${id}/`, updates);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to update connect group on backend.");
    }
    return response.data;
  },

  async toggleGroupStatus(id: string, currentStatus: "Active" | "Inactive"): Promise<ConnectGroup> {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    return this.updateGroup(id, { status: newStatus });
  },

  // ─────────────────────────────────────────────────────────────────
  // Group Members
  // ─────────────────────────────────────────────────────────────────

  async getGroupMembers(groupId?: string): Promise<GroupMember[]> {
    const params = groupId ? { group_id: groupId } : {};
    const response = await apiGet<GroupMember[]>("/api/group-members/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch group members from backend.");
    }
    return response.data;
  },

  async addGroupMember(data: Omit<GroupMember, "id" | "joined_at">): Promise<GroupMember> {
    const payload = {
      group_id: data.group_id,
      member_id: data.member_id || null,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      role: data.role,
      status: data.status
    };
    const response = await apiPost<GroupMember>("/api/group-members/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to add group member on backend.");
    }
    return response.data;
  },

  async removeGroupMember(id: string): Promise<void> {
    // Soft delete (archive)
    const response = await apiPost<any>(`/api/group-members/${id}/archive/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to archive group member on backend.");
    }
  },

  async updateMemberRole(id: string, role: GroupRole): Promise<GroupMember> {
    const response = await apiPut<GroupMember>(`/api/group-members/${id}/`, { role });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to update group member role.");
    }
    return response.data;
  },

  async toggleMemberStatus(id: string, currentStatus: "Active" | "Inactive"): Promise<GroupMember> {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const response = await apiPut<GroupMember>(`/api/group-members/${id}/`, { status: newStatus });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to toggle group member status.");
    }
    return response.data;
  },

  async transferMember(id: string, targetGroupId: string): Promise<GroupMember> {
    const response = await apiPut<GroupMember>(`/api/group-members/${id}/`, { group_id: targetGroupId });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to transfer group member.");
    }
    return response.data;
  },

  // ─────────────────────────────────────────────────────────────────
  // Group Attendance
  // ─────────────────────────────────────────────────────────────────

  async getGroupAttendance(groupId?: string): Promise<GroupAttendance[]> {
    const params = groupId ? { group_id: groupId } : {};
    const response = await apiGet<GroupAttendance[]>("/api/group-attendance/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch group attendance logs.");
    }
    return response.data;
  },

  async submitAttendance(data: Omit<GroupAttendance, "id" | "submitted_at">): Promise<GroupAttendance> {
    const payload = {
      group_id: data.group_id,
      meeting_date: data.meeting_date,
      visitor_count: data.visitor_count,
      study_topic: data.study_topic,
      offering_amount: data.offering_amount,
      currency: data.currency,
      attendees: data.attendees
    };
    const response = await apiPost<GroupAttendance>("/api/group-attendance/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to submit attendance on backend.");
    }
    return response.data;
  },

  async deleteAttendance(id: string): Promise<void> {
    // Soft delete (archive)
    const response = await apiPost<any>(`/api/group-attendance/${id}/archive/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to archive attendance log.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Group Prayer Requests
  // ─────────────────────────────────────────────────────────────────

  async getPrayerRequests(groupId?: string): Promise<GroupPrayerRequest[]> {
    const params = groupId ? { group_id: groupId } : {};
    const response = await apiGet<GroupPrayerRequest[]>("/api/group-prayer-requests/", { params });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch group prayer requests.");
    }
    return response.data;
  },

  async addPrayerRequest(data: Omit<GroupPrayerRequest, "id" | "created_at">): Promise<GroupPrayerRequest> {
    const payload = {
      group_id: data.group_id,
      submitted_by_name: data.submitted_by_name,
      request_text: data.request_text,
      is_anonymous: data.is_anonymous,
      status: data.status,
      shared_with_branch: !!data.shared_with_branch
    };
    const response = await apiPost<GroupPrayerRequest>("/api/group-prayer-requests/", payload);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to create prayer request on backend.");
    }
    return response.data;
  },

  async updatePrayerStatus(id: string, status: GroupPrayerRequest["status"]): Promise<GroupPrayerRequest> {
    const response = await apiPut<GroupPrayerRequest>(`/api/group-prayer-requests/${id}/`, { status });
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to update prayer request status.");
    }
    return response.data;
  },

  async deletePrayerRequest(id: string): Promise<void> {
    // Soft delete (archive)
    const response = await apiPost<any>(`/api/group-prayer-requests/${id}/archive/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to archive prayer request.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // Study Outlines
  // ─────────────────────────────────────────────────────────────────

  async getStudyOutlines(): Promise<StudyOutline[]> {
    const response = await apiGet<StudyOutline[]>("/api/study-outlines/");
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to fetch study outlines.");
    }
    return response.data;
  },

  async addStudyOutline(data: Omit<StudyOutline, "id" | "published_at">): Promise<StudyOutline> {
    const response = await apiPost<StudyOutline>("/api/study-outlines/", data);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to publish study outline on backend.");
    }
    return response.data;
  },

  async deleteStudyOutline(id: string): Promise<void> {
    // Since StudyOutline ViewSet deletes directly or via active status, let's use standard DELETE or status update.
    // For study outlines, we can do DELETE if physical delete is allowed, or update is_active to False.
    // In groups/views.py, StudyOutlineViewSet is a standard ModelViewSet which supports destroy (DELETE).
    // Let's use apiDelete to delete or deactivate it. Let's call apiDelete!
    const response = await apiDelete<any>(`/api/study-outlines/${id}/`);
    if (isApiError(response)) {
      throw new Error(response.message || "Failed to delete study outline.");
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // LocalStorage Cleanup
  // ─────────────────────────────────────────────────────────────────

  clearObsoleteLocalStorageKeys(): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("church-mock-groups");
    window.localStorage.removeItem("church-mock-group-members");
    window.localStorage.removeItem("church-mock-group-attendance");
    window.localStorage.removeItem("church-mock-group-prayer-requests");
    window.localStorage.removeItem("church-mock-group-outlines");
    console.log("Obsolete group local storage keys cleared successfully.");
  }
};

if (typeof window !== "undefined") {
  GroupsRepository.clearObsoleteLocalStorageKeys();
}
