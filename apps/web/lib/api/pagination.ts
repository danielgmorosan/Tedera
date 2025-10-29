export interface PaginationQuery {
  page: number;
  pageSize: number;
  sort?: string;
}

export function parsePagination(
  searchParams: URLSearchParams,
  defaults: Partial<PaginationQuery> = {}
): PaginationQuery {
  const page = Math.max(
    1,
    parseInt(searchParams.get("page") || String(defaults.page || 1), 10)
  );
  const pageSize = Math.min(
    100,
    Math.max(
      1,
      parseInt(
        searchParams.get("pageSize") || String(defaults.pageSize || 20),
        10
      )
    )
  );
  const sort = searchParams.get("sort") || defaults.sort;
  return { page, pageSize, sort: sort || undefined };
}

export function buildSkipLimit({ page, pageSize }: PaginationQuery) {
  const skip = (page - 1) * pageSize;
  return { skip, limit: pageSize };
}
