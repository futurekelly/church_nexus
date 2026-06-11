"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Announcement } from "@/features/landing/types/landing.types";

const DISMISS_KEY = "church-announcement-dismissed";

interface AnnouncementBarProps {
  announcement: Announcement;
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    setVisible(!dismissed);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      className="relative border-b border-primary/20 bg-primary/10 px-4 py-2.5 text-center text-sm"
    >
      <p className="pr-8 text-primary-foreground">
        <span aria-live="polite">{announcement.message}</span>
        {announcement.link_href && announcement.link_label && (
          <>
            {" "}
            <Link
              href={announcement.link_href}
              className="font-semibold text-primary underline-offset-2 transition-colors hover:text-primary/80 hover:underline"
            >
              {announcement.link_label}
            </Link>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:bg-card/60 hover:text-primary"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
