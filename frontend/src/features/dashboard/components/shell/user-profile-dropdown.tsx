"use client";

import { LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AUTH_ROUTES, DASHBOARD_ROUTES } from "@/constants/routes";
import { logoutUser } from "@/features/auth/services/auth-service";
import { clearSession } from "@/features/auth/utils/session";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { useClickOutside } from "@/hooks/use-click-outside";
import { PERMISSIONS } from "@/lib/permissions";
import { cn, getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/types/roles";

export function UserProfileDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { user, getDisplayName } = useAuth();
  const { can } = usePermissions();

  useClickOutside(containerRef, () => setOpen(false), open);

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logoutUser();
    clearSession();
    router.replace(AUTH_ROUTES.LOGIN);
  };

  const canAccessSettings = can(PERMISSIONS.SETTINGS_MANAGE);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex items-center gap-2 rounded-lg p-1.5 transition-all duration-200",
          "hover:bg-card/80 hover:shadow-neon",
          open && "bg-card/80 shadow-neon",
        )}
      >
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-primary-foreground">
            {getDisplayName()}
          </p>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABELS[user.role]}
          </p>
        </div>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary"
          aria-hidden="true"
        >
          {getInitials(user.first_name, user.last_name)}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="User menu"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass-panel absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border/60 shadow-glass"
          >
            <div className="border-b border-border/50 px-4 py-3">
              <p className="text-sm font-semibold text-primary-foreground">
                {getDisplayName()}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
              <p className="mt-1 text-xs font-medium text-primary">
                {ROLE_LABELS[user.role]}
              </p>
            </div>

            <ul className="py-1">
              {canAccessSettings && (
                <li role="none">
                  <Link
                    href={DASHBOARD_ROUTES.SETTINGS}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-card/60 hover:text-primary"
                  >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                    Settings
                  </Link>
                </li>
              )}
              <li role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-card/60 hover:text-warning"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign Out
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
