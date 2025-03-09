import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user-service';

export async function POST() {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create the user in our database
    const dbUser = await getOrCreateUser({
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      imageUrl: user.imageUrl,
    });

    return NextResponse.json({
      message: 'User synced successfully',
      user: dbUser,
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json({ error: 'Failed to sync user' }, { status: 500 });
  }
}
