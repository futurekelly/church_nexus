"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useDashboardNavigation } from "@/features/dashboard/hooks/use-dashboard-navigation";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function MobileDashboardNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { mobileNavItems } = useDashboardNavigation();

  if (mobileNavItems.length === 0) return null;

  return (
    <nav
      aria-label="Mobile dashboard navigation"
      className="glass-panel fixed bottom-0 left-0 right-0 z-30 border-t border-border md:hidden"
    >
      <ul className="flex items-center justify-around px-1 py-1.5">
        {mobileNavItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          const navKey = item.label === "Alerts" ? "alerts" : item.label.toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
          const displayLabel = t("navigation." + navKey);

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary",
                )}
              >
                {!prefersReducedMotion && isActive && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 rounded-lg bg-primary/10 shadow-neon"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className="relative h-5 w-5" aria-hidden="true" />
                <span className="relative">{displayLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
