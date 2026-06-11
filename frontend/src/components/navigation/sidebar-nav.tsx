"use client";

import { NAV_GROUP_LABELS } from "@/constants/navigation";
import type { NavItem } from "@/constants/navigation";
import { SidebarNavItem } from "@/components/navigation/sidebar-nav-item";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  items: NavItem[];
  collapsed: boolean;
}

export function SidebarNav({ items, collapsed }: SidebarNavProps) {
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
    <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-4 px-3 py-4">
      {groupOrder.map((group) => {
        const groupItems = groupedItems[group];
        if (!groupItems?.length) return null;

        return (
          <div key={group} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {NAV_GROUP_LABELS[group]}
              </p>
            )}
            <div className="space-y-1">
              {groupItems.map((item) => (
                <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
