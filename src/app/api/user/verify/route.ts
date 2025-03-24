import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getUserId } from '@/services/user/get-user-id';

const userSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { email, firstName, lastName } = await request.json();
    const parsedInput = userSchema.safeParse({ email, firstName, lastName });

    if (!parsedInput.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const client = await clerkClient();

    // update the email address
    await client.emailAddresses.createEmailAddress({
      userId,
      emailAddress: parsedInput.data.email,
    });

    // conditionally update the user's name (if provided)
    if (parsedInput.data.firstName || parsedInput.data.lastName) {
      await client.users.updateUser(userId, {
        firstName: parsedInput.data.firstName,
        lastName: parsedInput.data.lastName,
      });
    }

    // TODO: send out email to verify email address?
    return NextResponse.json(
      { message: 'Email address updated' },
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
