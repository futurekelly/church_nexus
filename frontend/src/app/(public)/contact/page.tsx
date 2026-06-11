import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/public/coming-soon-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Church Nexus — coming soon.",
};

export default function ContactPage() {
  return (
    <ComingSoonPage
      title="Contact"
      description="Contact details and inquiry forms will be available here soon."
    />
  );
}
