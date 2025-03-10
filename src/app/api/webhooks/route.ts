import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { env } from '@/env';
import { prisma } from '@/lib/db';
import type { UserJSON, WebhookEvent } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headersList = await headers();
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('Missing svix headers');
      return new NextResponse('Missing svix headers', { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const webhookSecret = env.CLERK_SIGNING_SECRET;
    if (!webhookSecret) {
      console.error('Missing CLERK_SIGNING_SECRET');
      return new NextResponse('Missing webhook secret', { status: 500 });
    }

    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new NextResponse('Error verifying webhook', { status: 400 });
    }

    // Handle the webhook based on the event type
    const eventType = evt.type;
    console.log(`Webhook received: ${eventType}`, {
      userId: evt.data.id,
      timestamp: new Date().toISOString(),
    });

    let result;
    if (eventType === 'user.created') {
      result = await handleUserCreated(evt.data);
    } else if (eventType === 'user.updated') {
      result = await handleUserUpdated(evt.data);
    } else if (eventType === 'user.deleted') {
      if (evt.data.id) {
        result = await handleUserDeleted(evt.data.id);
      } else {
        console.error('User ID is missing in user.deleted event');
      }
    }

    console.log(`Webhook processed: ${eventType}`, {
      userId: evt.data.id,
      result: result ? 'success' : 'no action taken',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Handler for user.created event
async function handleUserCreated(userData: UserJSON) {
  try {
    // Check if user already exists (to avoid duplicates)
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.id },
    });

    if (existingUser) {
      console.log(`User already exists: ${userData.id}`);
      return;
    }

    const clerkId = userData.id;

    // Find the primary email address if possible, otherwise use the first one
    let email: string | undefined;
    if (
      userData.primary_email_address_id &&
      userData.email_addresses?.length > 0
    ) {
      // Try to find the primary email
      const primaryEmail = userData.email_addresses.find(
        (emailObj) => emailObj.id === userData.primary_email_address_id
      );
      email = primaryEmail?.email_address;
    }

    // If no primary email found, use the first one
    if (!email && userData.email_addresses?.length > 0) {
      email = userData.email_addresses[0].email_address;
    }

    const createdAt = userData.created_at;

    if (!clerkId) {
      console.error('User ID is missing');
      return;
    }

    if (!email) {
      console.error('Email is missing for user:', clerkId);
      return;
    }

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        clerkId,
        email,
        createdAt: new Date(createdAt),
        firstName: userData.first_name || null,
        lastName: userData.last_name || null,
        imageUrl: userData.image_url || null,
        username: userData.username || null,
        id: clerkId,
        updatedAt: new Date(userData.updated_at),
      },
    });

    console.log(`User created: ${user.id}`);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Handler for user.updated event
async function handleUserUpdated(userData: UserJSON) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userData.id },
    });

    if (!existingUser) {
      console.log(`User doesn't exist during update, creating: ${userData.id}`);
      // If user doesn't exist, create them
      return await handleUserCreated(userData);
    }

    // Find the primary email address if possible, otherwise use the first one
    let email: string | undefined;
    if (
      userData.primary_email_address_id &&
      userData.email_addresses?.length > 0
    ) {
      // Try to find the primary email
      const primaryEmail = userData.email_addresses.find(
        (emailObj) => emailObj.id === userData.primary_email_address_id
      );
      email = primaryEmail?.email_address;
    }

    // If no primary email found, use the first one
    if (!email && userData.email_addresses?.length > 0) {
      email = userData.email_addresses[0].email_address;
    }

    // Update the user in the database
    const user = await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: email || existingUser.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        username: userData.username,
        imageUrl: userData.image_url,
        updatedAt: new Date(userData.updated_at),
      },
    });

    console.log(`User updated: ${user.id}`);
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}

// Handler for user.deleted event
async function handleUserDeleted(clerkId: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!existingUser) {
      console.log(`User not found for deletion: ${clerkId}`);
      return null;
    }

    // Delete the user from the database
    const user = await prisma.user.delete({
      where: { clerkId },
    });

    console.log(`User deleted: ${user.id}`);
    return user;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}
