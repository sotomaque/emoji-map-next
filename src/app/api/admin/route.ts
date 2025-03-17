import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import type { ErrorResponse } from '@/types/error-response';

interface AdminResponse {
  isAdmin: boolean;
}

/**
 * Admin API route handler
 *
 * GET endpoint to check if current user has admin privileges
 * Uses Clerk's currentUser() to verify admin status from publicMetadata
 *
 * @returns {Promise<NextResponse>} JSON response with isAdmin boolean
 *
 * @example Admin
 * const response = await fetch('/api/admin');
 * const data = await response.json();
 * console.log(data); // { isAdmin: true }
 *
 * @example Not Admin
 * const response = await fetch('/api/admin');
 * const data = await response.json();
 * console.log(data); // { isAdmin: false }
 *
 * @example Unauthorized
 * const response = await fetch('/api/admin');
 */

export async function GET(): Promise<
  NextResponse<AdminResponse | ErrorResponse>
> {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        {
          isAdmin: false,
        },
        { status: 401 }
      );
    }

    const isAdmin = Boolean(user.publicMetadata.admin);

    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
}
