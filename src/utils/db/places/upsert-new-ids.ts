import { prisma } from '@/lib/db';

/**
 * Creates new Place records in the database for the provided UUIDs.
 * If a UUID already exists, it will be skipped.
 *
 * @param uuids - Array of UUIDs to create places for
 * @returns boolean indicating whether the operation was successful
 */
export async function upsertNewIds(uuids: string[]): Promise<boolean> {
  if (uuids.length === 0) {
    return true;
  }

  try {
    await prisma.place.createMany({
      data: uuids.map((id) => ({ id })),
      skipDuplicates: true,
    });

    return true;
  } catch (error) {
    console.error('Error creating places:', error);

    return false;
  }
}
