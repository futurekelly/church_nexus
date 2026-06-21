"use client";

import { NAV_GROUP_LABELS } from "@/constants/navigation";
import type { NavItem } from "@/constants/navigation";
import { DashboardSidebarNavItem } from "@/features/dashboard/components/shell/dashboard-sidebar-nav-item";
import { useTranslation } from "@/hooks/use-translation";

interface DashboardSidebarNavProps {
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}

export function DashboardSidebarNav({
  items,
  collapsed,
  onNavigate,
}: DashboardSidebarNavProps) {
  const { t } = useTranslation();
  const groupedItems = items.reduce<Record<string, NavItem[]>>((groups, item) => {
    const group = item.group ?? "main";
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});

  const groupOrder: Array<keyof typeof NAV_GROUP_LABELS> = [
    "main",
    "content",
    "community",
    "finance",
    "admin",
  ];

  return (
    <nav aria-label="Dashboard navigation" className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4">
      {groupOrder.map((group) => {
        const groupItems = groupedItems[group];
        if (!groupItems?.length) return null;

        return (
          <div key={group} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("navigation.groups." + group)}
              </p>
            )}
            <div className="space-y-1">
              {groupItems.map((item) => (
                <DashboardSidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
