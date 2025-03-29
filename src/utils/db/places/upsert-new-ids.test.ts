/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { prisma } from '@/lib/db';
import { upsertNewIds } from './upsert-new-ids';

// Mock the database operations
vi.mock('@/lib/db', () => ({
  prisma: {
    place: {
      createMany: vi.fn(),
    },
  },
}));

describe('upsertNewIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.place.createMany as any).mockResolvedValue({ count: 1 });
  });

  it('should return true when successfully creating places', async () => {
    const uuids = ['test_id_1', 'test_id_2'];
    const result = await upsertNewIds(uuids);

    expect(result).toBe(true);
    expect(prisma.place.createMany).toHaveBeenCalledWith({
      data: uuids.map((id) => ({ id })),
      skipDuplicates: true,
    });
  });

  it('should return true for empty UUID array', async () => {
    const result = await upsertNewIds([]);

    expect(result).toBe(true);
    expect(prisma.place.createMany).not.toHaveBeenCalled();
  });

  it('should return false when database operation fails', async () => {
    const uuids = ['test_id_1'];
    (prisma.place.createMany as any).mockRejectedValue(
      new Error('Database error')
    );

    const result = await upsertNewIds(uuids);

    expect(result).toBe(false);
    expect(prisma.place.createMany).toHaveBeenCalledWith({
      data: uuids.map((id) => ({ id })),
      skipDuplicates: true,
    });
  });
});
