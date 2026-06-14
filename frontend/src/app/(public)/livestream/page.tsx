"use client";

import { useLivestream } from "@/features/livestream";
import { LivestreamPlayer } from "@/features/livestream/components/livestream-player";
import { LivestreamChat } from "@/features/livestream/components/livestream-chat";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Radio } from "lucide-react";

export default function PublicLivestreamPage() {
  const { stream, messages, addChatMessage, deleteChatMessage } = useLivestream();
  const { user, role } = useAuth();

  const handleSendMessage = (text: string) => {
    if (!user || !role) return false;
    const displayName = `${user.first_name} ${user.last_name}`;
    return addChatMessage(displayName, role, text, `usr-${user.id}`);
  };

  return (
    <div className="relative min-h-screen py-16 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.02),transparent_60%)]">
      {/* Red neon highlight */}
      <div className="absolute top-1/6 right-1/4 w-8 h-8 rounded-full bg-red-500/10 blur-md print:hidden" />

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* Page Header */}
        <div className="flex items-center space-x-3 border-b border-border/30 pb-4">
          <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Live Broadcast</h1>
            <p className="text-xs text-muted-foreground">Join our congregation fellowship online</p>
          </div>
        </div>

        {/* Player and Chat Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          {/* Stream Player */}
          <div className="lg:col-span-2 space-y-4">
            <LivestreamPlayer stream={stream} />
          </div>

          {/* Live Chat */}
          <div className="lg:col-span-1">
            <LivestreamChat
              messages={messages}
              onSendMessage={handleSendMessage}
              onDeleteMessage={canDeleteMessage(role) ? deleteChatMessage : undefined}
              isStreamLive={stream?.is_live}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function canDeleteMessage(role: string | null) {
  if (!role) return false;
  return role === "Super Admin" || role === "Church Admin" || role === "Pastor";
}
