"use client";

import { Pagination } from "@/components/ui/pagination";

interface PrayerPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PrayerPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PrayerPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      itemName="prayer requests"
      variant="indigo"
    />
  );
}
