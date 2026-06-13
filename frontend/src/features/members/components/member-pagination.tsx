"use client";

import { Pagination } from "@/components/ui/pagination";

interface MemberPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function MemberPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: MemberPaginationProps) {
  return (
    <Pagination
      page={page}
      totalPages={totalPages}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={onPageChange}
      itemName="members"
      variant="primary"
    />
  );
}

