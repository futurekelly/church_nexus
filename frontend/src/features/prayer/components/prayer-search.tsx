"use client";

import { SearchInput } from "@/components/ui/search-input";

interface PrayerSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PrayerSearch({ value, onChange, className }: PrayerSearchProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder="Search by title, description, or submitter... (Ctrl+K)"
      id="prayer-search"
      className={className}
      ariaLabel="Search prayer requests"
    />
  );
}
