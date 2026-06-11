import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/public/coming-soon-page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about Church Nexus — coming soon.",
};

export default function AboutPage() {
  return (
    <ComingSoonPage
      title="About Us"
      description="Our story, mission, and leadership information will be available here soon."
    />
  );
}
