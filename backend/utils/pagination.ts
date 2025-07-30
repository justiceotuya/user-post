import { Database } from 'sqlite3';

export interface PaginationMetadata {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  offset: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  itemsOnCurrentPage: number;
  startIndex: number;
  endIndex: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: PaginationMetadata;
}

interface QueryParams {
  limit: number;
  offset: number;
}

interface PaginationMeta {
  queryParams: QueryParams;
  metadata: PaginationMetadata;
}

/**
 * Creates pagination metadata for database queries
 * @param page - Current page number
 * @param limit - Items per page
 * @param totalCount - Total number of records
 * @returns Pagination metadata and query parameters
 */
export function createPaginationMeta(page: number, limit: number, totalCount: number): PaginationMeta {
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return {
    queryParams: { limit, offset },
    metadata: {
      currentPage: page,
      totalPages: totalPages,
      totalCount: totalCount,
      limit: limit,
      offset: offset,
      hasNextPage: hasNextPage,
      hasPreviousPage: hasPreviousPage,
      nextPage: hasNextPage ? page + 1 : null,
      previousPage: hasPreviousPage ? page - 1 : null,
      itemsOnCurrentPage: 0, // Will be updated after query
      startIndex: offset + 1,
      endIndex: Math.min(offset + limit, totalCount)
    }
  };
}

/**
 * Generic pagination function for SQLite database queries
 * @param db - SQLite database instance
 * @param countQuery - SQL query to count total records
 * @param dataQuery - SQL query to fetch paginated data
 * @param countParams - Parameters for count query
 * @param dataParams - Parameters for data query (without limit/offset)
 * @param page - Current page number
 * @param limit - Items per page
 * @param dataTransformer - Optional function to transform the data
 * @returns Promise that resolves to paginated response
 */
export function paginateQuery<T>(
  db: Database,
  countQuery: string,
  dataQuery: string,
  countParams: any[] = [],
  dataParams: any[] = [],
  page: number = 1,
  limit: number = 10,
    dataTransformer?: (row: any) => T,
): Promise<PaginationResult<T>> {
  return new Promise((resolve, reject) => {
    // First get the total count
    db.get(countQuery, countParams, (countErr: Error | null, countRow: { total: number }) => {
      if (countErr) return reject(countErr);

      const totalCount = countRow.total;
      const pagination = createPaginationMeta(page, limit, totalCount);

      // Add limit and offset to data query parameters
      const finalDataParams = [...dataParams, pagination.queryParams.limit, pagination.queryParams.offset];

      // Execute the data query
      db.all(dataQuery, finalDataParams, (err: Error | null, rows: any[]) => {
        if (err) return reject(err);

        // Transform data if transformer function is provided
        const data: T[] = dataTransformer ? rows.map(dataTransformer) : rows;

        // Update actual items count in metadata
        pagination.metadata.itemsOnCurrentPage = data.length;
          pagination.metadata.endIndex = pagination.metadata.offset + data.length;

        const result: PaginationResult<T> = {
          data: data,
          pagination: pagination.metadata
        };

        resolve(result);
      });
    });
  });
}
