import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Admin API route handler
 *
 * GET endpoint to check if current user has admin privileges
 * Uses Clerk's currentUser() to verify admin status from publicMetadata
 *
 * @returns {Promise<NextResponse>} JSON response with isAdmin boolean
 */

export async function GET() {
  const user = await currentUser();

  return NextResponse.json({ isAdmin: user?.publicMetadata.admin });
}
