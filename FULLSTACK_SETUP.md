# Full Stack Authentication Setup

This guide explains how to set up the full stack authentication feature using Clerk and a database.

## Overview

The full stack authentication feature consists of:

1. **Clerk Authentication**: Used for user authentication in both the web and iOS apps
2. **Database Integration**: PostgreSQL database (via Supabase) to store user data
3. **Webhook Integration**: Syncs user data between Clerk and our database

## Web Setup

### 1. Install Dependencies

```bash
cd web
pnpm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env` and fill in the required values:

```bash
cp .env.example .env
```

You'll need to set the following variables:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `CLERK_WEBHOOK_SECRET`: Your Clerk webhook secret
- `DATABASE_URL`: Your database connection string

### 3. Set Up the Database

Run the database setup script:

```bash
./scripts/setup-db.sh
```

This will:

- Generate the Prisma client
- Push the schema to the database
- Seed the database with initial data

### 4. Start the Development Server

```bash
pnpm dev
```

## iOS Setup

The iOS app includes a simplified Clerk authentication implementation:

1. Open the iOS project in Xcode
2. Update the Clerk publishable key in `ClerkAuthService.swift`
3. Build and run the app

## Clerk Webhook Setup

To ensure user data is synced between Clerk and your database:

1. Go to the Clerk Dashboard
2. Navigate to Webhooks
3. Create a new webhook with the following settings:
   - URL: `https://your-domain.com/api/webhook/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Secret: Generate a new secret and add it to your `.env` file

## Database Schema

The database schema includes a `User` model that connects to Clerk:

```prisma
model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String   @unique
  username  String?
  firstName String?
  lastName  String?
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([clerkId])
}
```

## Testing the Integration

1. Sign up for a new account in the web or iOS app
2. Check the database to verify that a new user record was created
3. Update your profile in Clerk
4. Verify that the changes are reflected in the database

## Troubleshooting

- **Webhook Issues**: Check the webhook logs in the Clerk Dashboard
- **Database Connection Issues**: Verify your database connection string
- **Authentication Issues**: Check the Clerk logs for any authentication errors
