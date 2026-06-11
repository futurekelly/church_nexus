"use client";

import { formatDistanceToNow, parseISO } from "date-fns";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { useClickOutside } from "@/hooks/use-click-outside";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/notification-store";

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "relative rounded-lg p-2 text-muted-foreground transition-all duration-200",
          "hover:bg-card/80 hover:text-primary hover:shadow-neon",
          open && "bg-card/80 text-primary shadow-neon",
        )}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Notifications"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="glass-panel absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border/60 shadow-glass"
          >
            <div className="border-b border-border/50 px-4 py-3">
              <p className="text-sm font-semibold text-primary-foreground">
                Notifications
              </p>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} unread
                </p>
              )}
            </div>

            <ul className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </li>
              ) : (
                notifications.slice(0, 5).map((notification) => (
                  <li key={notification.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => markAsRead(notification.id)}
                      className={cn(
                        "w-full border-b border-border/30 px-4 py-3 text-left transition-colors hover:bg-card/60",
                        !notification.read_status && "bg-primary/5",
                      )}
                    >
                      <p className="text-sm font-medium text-primary-foreground">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <time
                        dateTime={notification.created_at}
                        className="mt-1 block text-[10px] text-muted-foreground"
                      >
                        {formatDistanceToNow(parseISO(notification.created_at), {
                          addSuffix: true,
                        })}
                      </time>
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="border-t border-border/50 p-2">
              <Link
                href={DASHBOARD_ROUTES.NOTIFICATIONS}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-card/60"
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
