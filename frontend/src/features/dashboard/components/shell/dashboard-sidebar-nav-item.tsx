"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/constants/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

interface DashboardSidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function DashboardSidebarNavItem({
  item,
  collapsed,
  onNavigate,
}: DashboardSidebarNavItemProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.href !== "/dashboard" && pathname.startsWith(item.href));

  const Icon = item.icon;
  const translationKey = "navigation." + item.label.toLowerCase().replace(/ /g, "_").replace(/-/g, "_");
  const displayLabel = t(translationKey);

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? displayLabel : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "text-muted-foreground hover:bg-card/80 hover:text-primary-foreground hover:shadow-neon",
        isActive && "bg-primary/15 text-primary shadow-neon",
        collapsed && "justify-center px-2",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary",
        )}
        aria-hidden="true"
      />
      {!collapsed && <span>{displayLabel}</span>}
    </Link>
  );
}
