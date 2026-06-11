"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { getBreadcrumbLabel } from "@/features/dashboard/constants/breadcrumb-labels";

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return (
      <h1 className="font-display text-lg font-semibold text-primary-foreground">
        Dashboard
      </h1>
    );
  }

  const crumbs = segments.slice(1).map((segment, index) => {
    const href = `/${segments.slice(0, index + 2).join("/")}`;
    const isLast = index === segments.length - 2;
    return {
      href,
      label: getBreadcrumbLabel(segment),
      isLast,
    };
  });

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li>
          <Link
            href={DASHBOARD_ROUTES.ROOT}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <ChevronRight
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            {crumb.isLast ? (
              <span
                className="font-medium text-primary-foreground"
                aria-current="page"
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
