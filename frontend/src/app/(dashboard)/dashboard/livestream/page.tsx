"use client";

import { useLivestream, LivestreamPlayer, LivestreamChat, ModeratorControls, ArchiveDialog } from "@/features/livestream";
import { useAppPermissions } from "@/hooks/use-app-permissions";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLivestreamPage() {
  const router = useRouter();
  const { user, role } = useAuth();
  const {
    stream,
    messages,
    mutedUsers,
    updateStreamSettings,
    addChatMessage,
    deleteChatMessage,
    clearChat,
    muteUser,
    unmuteUser,
    resetStream,
  } = useLivestream();

  const { livestream: livestreamPermissions } = useAppPermissions();
  const { canModerate, canChat } = livestreamPermissions;
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [wasStreamEnded, setWasStreamEnded] = useState(false);

  // Monitor when the stream was ended by this moderator session
  // and trigger the archive dialog popup
  const handleUpdateSettings = (newSettings: any) => {
    if (stream?.is_live && newSettings.is_live === false) {
      setWasStreamEnded(true);
    }
    updateStreamSettings(newSettings);
  };

  useEffect(() => {
    if (wasStreamEnded) {
      setIsArchiveOpen(true);
      setWasStreamEnded(false);
    }
  }, [wasStreamEnded]);

  const handleSendMessage = (text: string) => {
    if (!user || !role) return false;
    const displayName = `${user.first_name} ${user.last_name}`;
    return addChatMessage(displayName, role, text, `usr-${user.id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/30 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary-foreground flex items-center gap-2">
            <Radio className="h-6 w-6 text-red-500 animate-pulse" />
            Live Stream Room
          </h1>
          <p className="text-sm text-muted-foreground">
            {canModerate
              ? "Start and end live broadcasts, moderate chat logs, and archive streams to the Sermons database."
              : "Watch the church services live and join fellow members in conversation."}
          </p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* Stream Player & Chat panel */}
        <div className="lg:col-span-2 space-y-6">
          <LivestreamPlayer stream={stream} />

          {/* Chat on smaller viewports or below player for non-moderators */}
          {!canModerate && (
            <LivestreamChat
              messages={messages}
              onSendMessage={handleSendMessage}
              onDeleteMessage={undefined}
              isStreamLive={stream?.is_live}
            />
          )}
        </div>

        {/* Sidebar Controls (Moderators) or Chat panel (Members) */}
        <div className="lg:col-span-1 space-y-6">
          {canModerate ? (
            <>
              {/* Control Panel */}
              <ModeratorControls
                stream={stream}
                mutedUsers={mutedUsers}
                onUpdateSettings={handleUpdateSettings}
                onClearChat={clearChat}
                onUnmuteUser={unmuteUser}
                onResetAll={resetStream}
              />

              {/* Chat Feed */}
              <LivestreamChat
                messages={messages}
                onSendMessage={handleSendMessage}
                onDeleteMessage={deleteChatMessage}
                onMuteUser={muteUser}
                isStreamLive={stream?.is_live}
              />
            </>
          ) : (
            /* Sidebar Chat for standard members */
            <LivestreamChat
              messages={messages}
              onSendMessage={handleSendMessage}
              onDeleteMessage={undefined}
              isStreamLive={stream?.is_live}
            />
          )}
        </div>
      </div>

      {/* Dialog for Archiving Stream */}
      <AnimatePresence>
        {isArchiveOpen && (
          <ArchiveDialog
            stream={stream}
            isOpen={isArchiveOpen}
            onClose={() => setIsArchiveOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
