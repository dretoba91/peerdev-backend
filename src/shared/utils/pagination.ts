export interface PaginationMeta {
  totalItems:   number;
  totalPages:   number;
  currentPage:  number;
  itemsPerPage: number;
  hasNextPage:  boolean;
}

export interface PaginatedResponse<T> {
  data:       T[];
  pagination: PaginationMeta;
}

export const buildPagination = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationMeta => {
  // Ensure we don't divide by zero and handle 0 total items gracefully
  const totalPages = itemsPerPage > 0 ? Math.max(1, Math.ceil(totalItems / itemsPerPage)) : 1;
  
  // Bound the current page between 1 and the max total pages
  const normalizedPage = Math.max(1, Math.min(currentPage, totalPages));

  const hasNextPage = normalizedPage < totalPages;

  return {
    totalItems: Math.max(0, totalItems),
    itemsPerPage: itemsPerPage,
    totalPages: totalPages,
    currentPage: normalizedPage,
    hasNextPage: hasNextPage
  };
};
