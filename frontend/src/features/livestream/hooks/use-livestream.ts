"use client";

import { useState, useEffect, useCallback } from "react";
import type { LivestreamStatus, ChatMessage } from "../types/livestream.types";
import { INITIAL_LIVESTREAM, MOCK_CHAT_MESSAGES, SIMULATED_CHAT_POOL, MOCK_DONORS_NAMES } from "../data/mock-livestream";

const LIVESTREAM_KEY = "church-mock-livestream";
const CHAT_KEY = "church-mock-livestream-chat";
const MUTED_USERS_KEY = "church-mock-livestream-muted";

export function useLivestream() {
  const [stream, setStream] = useState<LivestreamStatus | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);

  // Reload states from localStorage
  const reloadData = useCallback(() => {
    if (typeof window === "undefined") return;

    // Load Stream Configuration
    const storedStream = localStorage.getItem(LIVESTREAM_KEY);
    let loadedStream: LivestreamStatus;
    if (storedStream) {
      try {
        loadedStream = JSON.parse(storedStream);
      } catch {
        loadedStream = INITIAL_LIVESTREAM;
      }
    } else {
      localStorage.setItem(LIVESTREAM_KEY, JSON.stringify(INITIAL_LIVESTREAM));
      loadedStream = INITIAL_LIVESTREAM;
    }
    setStream(loadedStream);

    // Load Chat Messages
    const storedChat = localStorage.getItem(CHAT_KEY);
    let loadedChat: ChatMessage[] = [];
    if (storedChat) {
      try {
        loadedChat = JSON.parse(storedChat);
      } catch {
        loadedChat = MOCK_CHAT_MESSAGES;
      }
    } else {
      localStorage.setItem(CHAT_KEY, JSON.stringify(MOCK_CHAT_MESSAGES));
      loadedChat = MOCK_CHAT_MESSAGES;
    }
    setMessages(loadedChat);

    // Load Muted Usernames
    const storedMuted = localStorage.getItem(MUTED_USERS_KEY);
    let loadedMuted: string[] = [];
    if (storedMuted) {
      try {
        loadedMuted = JSON.parse(storedMuted);
      } catch {
        loadedMuted = [];
      }
    } else {
      localStorage.setItem(MUTED_USERS_KEY, JSON.stringify([]));
    }
    setMutedUsers(loadedMuted);
  }, []);

  useEffect(() => {
    reloadData();

    // Listen for custom trigger events across tabs/components
    if (typeof window !== "undefined") {
      const handleUpdate = () => reloadData();
      window.addEventListener("church-livestream-update", handleUpdate);
      return () => {
        window.removeEventListener("church-livestream-update", handleUpdate);
      };
    }
  }, [reloadData]);

  const triggerUpdate = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("church-livestream-update"));
    }
  }, []);

  // Update stream settings (start, end, rename, change video link)
  const updateStreamSettings = useCallback((newSettings: Partial<LivestreamStatus>) => {
    if (!stream) return;
    const updated = { ...stream, ...newSettings };
    localStorage.setItem(LIVESTREAM_KEY, JSON.stringify(updated));
    setStream(updated);
    triggerUpdate();
  }, [stream, triggerUpdate]);

  // Record a chat message
  const addChatMessage = useCallback((senderName: string, senderRole: string, messageText: string, senderId?: string) => {
    if (typeof window === "undefined") return false;

    // Check if the user is currently muted
    const storedMuted = localStorage.getItem(MUTED_USERS_KEY);
    const mutedList: string[] = storedMuted ? JSON.parse(storedMuted) : [];
    if (mutedList.includes(senderName.toLowerCase().trim())) {
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

    const updated = [...messages, newMessage].slice(-100); // Caps chat log to last 100 messages
    localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    setMessages(updated);
    triggerUpdate();
    return true;
  }, [messages, triggerUpdate]);

  // Moderator Delete Message
  const deleteChatMessage = useCallback((messageId: string) => {
    const updated = messages.filter((m) => m.id !== messageId);
    localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    setMessages(updated);
    triggerUpdate();
  }, [messages, triggerUpdate]);

  // Moderator Clear Chat
  const clearChat = useCallback(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify([]));
    setMessages([]);
    triggerUpdate();
  }, [triggerUpdate]);

  // Moderator Mute User
  const muteUser = useCallback((username: string) => {
    const norm = username.toLowerCase().trim();
    if (mutedUsers.includes(norm)) return;
    const updated = [...mutedUsers, norm];
    localStorage.setItem(MUTED_USERS_KEY, JSON.stringify(updated));
    setMutedUsers(updated);
    triggerUpdate();
  }, [mutedUsers, triggerUpdate]);

  // Moderator Unmute User
  const unmuteUser = useCallback((username: string) => {
    const norm = username.toLowerCase().trim();
    const updated = mutedUsers.filter((u) => u !== norm);
    localStorage.setItem(MUTED_USERS_KEY, JSON.stringify(updated));
    setMutedUsers(updated);
    triggerUpdate();
  }, [mutedUsers, triggerUpdate]);

  // Reset stream back to initial mock state
  const resetStream = useCallback(() => {
    localStorage.setItem(LIVESTREAM_KEY, JSON.stringify(INITIAL_LIVESTREAM));
    localStorage.setItem(CHAT_KEY, JSON.stringify(MOCK_CHAT_MESSAGES));
    localStorage.setItem(MUTED_USERS_KEY, JSON.stringify([]));
    reloadData();
    triggerUpdate();
  }, [reloadData, triggerUpdate]);

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
      
      const storedMuted = localStorage.getItem(MUTED_USERS_KEY);
      const mutedList: string[] = storedMuted ? JSON.parse(storedMuted) : [];
      
      // If the random bot is not muted, post it
      if (!mutedList.includes(randomName.toLowerCase())) {
        const botMessage: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender_name: randomName,
          sender_role: "Member",
          message: randomMsg,
          timestamp: new Date().toISOString(),
        };

        const currentChat = localStorage.getItem(CHAT_KEY);
        const chatList: ChatMessage[] = currentChat ? JSON.parse(currentChat) : [];
        const updated = [...chatList, botMessage].slice(-100);
        localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
        
        // Dispatch custom update event so hooks re-render
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("church-livestream-update"));
        }
      }
    }, 14000);

    return () => {
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [stream, updateStreamSettings]);

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
