import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Welcome to Church Nexus — a modern church community growing together in faith, hope, and love.",
};

export default function HomePage() {
  return <LandingPage />;
}
