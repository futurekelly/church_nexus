import type { Metadata } from "next";
import { DashboardHomePlaceholder } from "@/features/dashboard/components/shell/dashboard-home-placeholder";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Church Management Ecosystem dashboard",
};

export default function DashboardPage() {
  return <DashboardHomePlaceholder />;
}
