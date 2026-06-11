import type { Metadata } from "next";
import { DashboardHome } from "@/features/dashboard/components/home/dashboard-home";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Church Management Ecosystem dashboard",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
