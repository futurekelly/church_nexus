import type { ReactNode } from "react";
import { CommunityJoinWidget } from "@/components/ui/community-join-widget";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {children}
      <CommunityJoinWidget />
    </div>
  );
}
