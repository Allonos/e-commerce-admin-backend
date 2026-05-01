export interface PaginationOptions {
  defaultLimit?: number;
  maxLimit?: number;
  defaultPage?: number;
}

export interface PaginationResult {
  limit: number;
  page: number;
  skip: number;
  totalPages?: number;
  hasNextPage?: boolean;
  isFirstPage?: boolean;
  isLastPage?: boolean;
}

export function parsePagination(
  query: Record<string, any>,
  options?: PaginationOptions,
  totalItems?: number,
): PaginationResult {
  const DEFAULT_LIMIT = options?.defaultLimit ?? 10;
  const MAX_LIMIT = options?.maxLimit ?? 100;
  const DEFAULT_PAGE = options?.defaultPage ?? 1;

  const limitStr = query.limit as string | undefined;
  const pageStr = query.page as string | undefined;
  const skipQuery = query.skip as string | undefined;

  const parsedLimit = parseInt((limitStr ?? "") as string, 10) || DEFAULT_LIMIT;
  const limit = Math.max(1, Math.min(parsedLimit, MAX_LIMIT));
  const page = pageStr
    ? Math.max(1, parseInt(pageStr, 10) || DEFAULT_PAGE)
    : DEFAULT_PAGE;
  const skip =
    typeof skipQuery !== "undefined"
      ? Math.max(0, parseInt(skipQuery as string, 10) || 0)
      : (page - 1) * limit;

  if (typeof totalItems === "number" && Number.isFinite(totalItems)) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const isFirstPage = page === 1;
    const isLastPage = page >= totalPages;
    const hasNextPage = page < (totalPages ?? 1);

    return {
      limit,
      page,
      skip,
      totalPages,
      hasNextPage,
      isFirstPage,
      isLastPage,
    };
  }

  return { limit, page, skip };
}
