import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { clerkClient, currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user?.publicMetadata?.admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get pagination parameters from query string
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    const client = await clerkClient();
    const response = await client.users.getUserList({
      limit,
      offset,
    });

    return NextResponse.json({
      users: response.data,
      totalCount: response.totalCount,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
