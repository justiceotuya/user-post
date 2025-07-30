import { createTestUser, testDb } from '../setup';
import { describe, expect, it } from 'vitest';

import { paginateQuery } from '../../utils/pagination';

describe('Pagination Utility', () => {
  it('should paginate query results correctly', async () => {
    // Create test data
    await createTestUser({ name: 'User 1', username: 'user1', email: 'user1@example.com' });
    await createTestUser({ name: 'User 2', username: 'user2', email: 'user2@example.com' });
    await createTestUser({ name: 'User 3', username: 'user3', email: 'user3@example.com' });

    const countQuery = 'SELECT COUNT(*) as total FROM users';
    const dataQuery = 'SELECT * FROM users ORDER BY id LIMIT ? OFFSET ?';

    const transformer = (row: any) => ({
      id: row.id.toString(),
      name: row.name,
      email: row.email
    });

    const result = await paginateQuery(
      testDb,
      countQuery,
      dataQuery,
      [], // countParams
      [], // dataParams
      1,  // page
      2,  // limit
      transformer,
    );

    expect(result.data).toHaveLength(2);
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalCount).toBe(3);
    expect(result.pagination.totalPages).toBe(2);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.hasPreviousPage).toBe(false);
  });

  it('should handle empty results', async () => {
    const countQuery = 'SELECT COUNT(*) as total FROM users WHERE id = ?';
    const dataQuery = 'SELECT * FROM users WHERE id = ? LIMIT ? OFFSET ?';

    const transformer = (row: any) => row;

    const result = await paginateQuery(
      testDb,
      countQuery,
      dataQuery,
      [999999], // countParams - non-existent user
      [999999], // dataParams - non-existent user
      1,
      10,
      transformer,
    );

    expect(result.data).toHaveLength(0);
    expect(result.pagination.totalCount).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });
});
