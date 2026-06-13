"use client";

import { SearchInput } from "@/components/ui/search-input";

interface SermonSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SermonSearch({ value, onChange, className }: SermonSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search by title, scripture, speaker, tags... (Ctrl+K)"
      id="sermon-search"
      className={className}
      ariaLabel="Search sermons"
    />
  );
}

