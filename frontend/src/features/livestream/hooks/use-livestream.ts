"use client";

import { useEffect, useCallback } from "react";
import type { LivestreamStatus, ChatMessage } from "../types/livestream.types";
import { INITIAL_LIVESTREAM, MOCK_CHAT_MESSAGES, SIMULATED_CHAT_POOL, MOCK_DONORS_NAMES } from "../data/mock-livestream";
import { useLocalStorageState } from "@/hooks/use-local-storage-state";

const LIVESTREAM_KEY = "church-mock-livestream";
const CHAT_KEY = "church-mock-livestream-chat";
const MUTED_USERS_KEY = "church-mock-livestream-muted";

export function useLivestream() {
  const [stream, setStream] = useLocalStorageState<LivestreamStatus | null>(
    LIVESTREAM_KEY,
    INITIAL_LIVESTREAM
  );
  const [messages, setMessages] = useLocalStorageState<ChatMessage[]>(
    CHAT_KEY,
    MOCK_CHAT_MESSAGES
  );
  const [mutedUsers, setMutedUsers] = useLocalStorageState<string[]>(
    MUTED_USERS_KEY,
    []
  );

  // Update stream settings (start, end, rename, change video link)
  const updateStreamSettings = useCallback((newSettings: Partial<LivestreamStatus>) => {
    setStream((prev) => (prev ? { ...prev, ...newSettings } : null));
  }, [setStream]);

  // Record a chat message
  const addChatMessage = useCallback((senderName: string, senderRole: string, messageText: string, senderId?: string) => {
    if (mutedUsers.map(u => u.toLowerCase().trim()).includes(senderName.toLowerCase().trim())) {
      // Quietly reject message from muted user
      return false;
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender_name: senderName,
      sender_role: senderRole,
      sender_id: senderId,
      message: messageText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage].slice(-100)); // Caps chat log to last 100 messages
    return true;
  }, [mutedUsers, setMessages]);

  // Moderator Delete Message
  const deleteChatMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, [setMessages]);

  // Moderator Clear Chat
  const clearChat = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  // Moderator Mute User
  const muteUser = useCallback((username: string) => {
    const norm = username.toLowerCase().trim();
    setMutedUsers((prev) => (prev.includes(norm) ? prev : [...prev, norm]));
  }, [setMutedUsers]);

  // Moderator Unmute User
  const unmuteUser = useCallback((username: string) => {
    const norm = username.toLowerCase().trim();
    setMutedUsers((prev) => prev.filter((u) => u !== norm));
  }, [setMutedUsers]);

  // Reset stream back to initial mock state
  const resetStream = useCallback(() => {
    setStream(INITIAL_LIVESTREAM);
    setMessages(MOCK_CHAT_MESSAGES);
    setMutedUsers([]);
  }, [setStream, setMessages, setMutedUsers]);

  // Simulated viewer counts and automated congregation chat messages
  useEffect(() => {
    if (!stream || !stream.is_live) return;

    // 1. Viewer count fluctuations (Runs every 7 seconds)
    const viewerInterval = setInterval(() => {
      const change = Math.floor(Math.random() * 9) - 4; // -4 to +4 viewers
      const newCount = Math.max(10, stream.viewer_count + change);
      updateStreamSettings({ viewer_count: newCount });
    }, 7000);

    // 2. Simulated Chat Traffic (Runs every 14 seconds)
    const chatInterval = setInterval(() => {
      // Pick random simulated message
      const randomMsg = SIMULATED_CHAT_POOL[Math.floor(Math.random() * SIMULATED_CHAT_POOL.length)];
      // Pick random sender name
      const randomName = MOCK_DONORS_NAMES[Math.floor(Math.random() * MOCK_DONORS_NAMES.length)];
      
      // If the random bot is not muted, post it
      if (!mutedUsers.map(u => u.toLowerCase().trim()).includes(randomName.toLowerCase().trim())) {
        const botMessage: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender_name: randomName,
          sender_role: "Member",
          message: randomMsg,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMessage].slice(-100));
      }
    }, 14000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [stream, mutedUsers, updateStreamSettings, setMessages]);

  return {
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
  };
}
