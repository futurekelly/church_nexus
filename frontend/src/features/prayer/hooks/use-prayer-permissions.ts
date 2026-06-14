// MIGRATION CANDIDATE: Deprecated in favor of global useAppPermissions
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";
import type { PrayerRequest } from "../types/prayer.types";

export function usePrayerPermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;

  // Pastor and Super Admin can manage requests and status
  const canManageStatus = isPastor || isSuperAdmin || isChurchAdmin;

  // Pastor and Super Admin are authorized to respond to prayer requests
  const canRespond = isPastor || isSuperAdmin;

  // Super Admin can edit any, otherwise only the owner can edit their own request
  const canEdit = (request: PrayerRequest) => {
    if (isSuperAdmin) return true;
    return user ? String(user.id) === String(request.user_id) : false;
  };

  // Super Admin can delete any, owner can delete their own request
  const canDelete = (request: PrayerRequest) => {
    if (isSuperAdmin) return true;
    return user ? String(user.id) === String(request.user_id) : false;
  };

  // Pastors and Super Admins can see the real names of anonymous submitters
  const canSeeAnonymousNames = isPastor || isSuperAdmin;

  // Visitor, Member, Pastor, Admin can submit prayer requests
  const canSubmit = !!user;

  return {
    canSubmit,
    canManageStatus,
    canRespond,
    canEdit,
    canDelete,
    canSeeAnonymousNames,
    userId: user?.id,
    userName: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email : "Anonymous",
  };
}
