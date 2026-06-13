"use client";

import { Pagination } from "@/components/ui/pagination";

interface EventPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function EventPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: EventPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      itemName="events"
      variant="indigo"
    />
  );
}

