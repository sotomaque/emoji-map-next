import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // check if user is admin
    const userMakingRequest = await currentUser();
    if (!userMakingRequest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // check if user is admin
    if (!userMakingRequest?.publicMetadata?.admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    // validate userId body param with zod
    const validatedSchema = z.object({
      userId: z.string(),
    });

    const { success } = validatedSchema.safeParse({ userId });

    if (!success) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }
    const client = await clerkClient();

    // get that user and check if they are an admin
    const user = await client.users.getUser(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentAdminStatus = user?.publicMetadata?.admin;

    // toggle admin status via clerk
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        admin: !currentAdminStatus,
      },
    });

    return NextResponse.json(
      { message: 'Admin status toggled' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
