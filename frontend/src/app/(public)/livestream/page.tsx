import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/public/coming-soon-page";

export const metadata: Metadata = {
  title: "Livestream",
  description: "Watch Church Nexus livestream — coming soon.",
};

export default function LivestreamPage() {
  return (
    <ComingSoonPage
      title="Livestream"
      description="Watch our services live and access past broadcasts here soon."
    />
  );
}
