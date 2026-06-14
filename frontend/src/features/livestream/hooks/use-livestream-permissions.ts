// MIGRATION CANDIDATE: Deprecated in favor of global useAppPermissions
"use client";

import { useAuth } from "@/hooks/use-auth";
import { ROLES } from "@/types/roles";

export function useLivestreamPermissions() {
  const { role, user } = useAuth();

  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isChurchAdmin = role === ROLES.CHURCH_ADMIN;
  const isPastor = role === ROLES.PASTOR;
  const isMember = role === ROLES.MEMBER;
  const isVisitor = role === ROLES.VISITOR || !role;

  // Moderation rights: Super Admin, Church Admin, Pastor
  const canModerate = isSuperAdmin || isChurchAdmin || isPastor;

  // Chat rights: Anyone logged in (meaning not anonymous visitor)
  const canChat = !!role && role !== ROLES.VISITOR;

  return {
    userId: user?.id,
    userRole: role,
    userName: user ? `${user.first_name} ${user.last_name}` : "Visitor",
    isSuperAdmin,
    isChurchAdmin,
    isPastor,
    isMember,
    isVisitor,
    canModerate,
    canChat,
  };
}
