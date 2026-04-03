import { useState, useMemo } from 'react';

interface PaginationOptions {
  totalItems: number;
  pageSize?: number;
  initialPage?: number;
}

export function usePagination({ totalItems, pageSize = 10, initialPage = 1 }: PaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);

  const range = useMemo(() => {
    const start = (clampedPage - 1) * pageSize;
    const end = Math.min(start + pageSize, totalItems);
    return { start, end };
  }, [clampedPage, pageSize, totalItems]);

  const goToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));
  const nextPage  = () => goToPage(clampedPage + 1);
  const prevPage  = () => goToPage(clampedPage - 1);

  return {
    currentPage: clampedPage,
    totalPages,
    pageSize,
    range,
    goToPage,
    nextPage,
    prevPage,
    hasPrev: clampedPage > 1,
    hasNext: clampedPage < totalPages,
  };
}
