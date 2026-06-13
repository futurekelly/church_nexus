"use client";

import { SearchInput } from "@/components/ui/search-input";

interface EventSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function EventSearch({ value, onChange, className }: EventSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search by title, description, location, or organizer... (Ctrl+K)"
      id="event-search"
      className={className}
      ariaLabel="Search events"
    />
  );
}

