import { beforeEach, afterEach, vi } from 'vitest';
import * as clientModule from './src/infra/database/client';

export const mockQuery = vi.fn();

vi.mock('./src/infra/database/client', () => ({
  query: (...args: any[]) => mockQuery(...args),
}));

beforeEach(() => {
  mockQuery.mockReset();
});

afterEach(() => {
  mockQuery.mockClear();
});

export function mockQueryResult(rows: any[]) {
  mockQuery.mockResolvedValue({ rows });
}
