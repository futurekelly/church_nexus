"use client";

import type { ReactNode } from "react";
import { DashboardShell } from "@/features/dashboard/components/shell/dashboard-shell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return <DashboardShell>{children}</DashboardShell>;
}
