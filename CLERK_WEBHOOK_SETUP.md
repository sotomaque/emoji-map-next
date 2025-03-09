# Setting Up Clerk Webhooks for User Synchronization

This guide explains how to set up Clerk webhooks to automatically synchronize user data with your database.

## Overview

When users sign up, sign in, or update their profiles in Clerk, we want to automatically sync this data with our database. Clerk webhooks allow us to receive notifications about these events and update our database accordingly.

## Prerequisites

1. A Clerk account with an application set up
2. Your application deployed to a publicly accessible URL (for webhook delivery)
3. A database set up and connected to your application

## Step 1: Create a Webhook in Clerk Dashboard

1. Log in to your [Clerk Dashboard](https://dashboard.clerk.dev/)
2. Select your application
3. Navigate to **Webhooks** in the left sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://your-domain.com/api/webhooks/clerk`
6. Select the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
7. Click **Create**

## Step 2: Copy the Webhook Secret

After creating the webhook, Clerk will generate a signing secret. Copy this secret and add it to your environment variables:

```
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Step 3: Test the Webhook

You can test the webhook by:

1. Creating a new user in your application
2. Updating a user's profile
3. Deleting a user

After each action, check your application logs to see if the webhook was received and processed correctly.

## Webhook Payload Example

Here's an example of a webhook payload for a `user.created` event:

```json
{
  "data": {
    "birthday": "",
    "created_at": 1654012591514,
    "email_addresses": [
      {
        "email_address": "example@example.org",
        "id": "idn_29w83yL7CwVlJXylYLxcslromF1",
        "linked_to": [],
        "object": "email_address",
        "verification": {
          "status": "verified",
          "strategy": "ticket"
        }
      }
    ],
    "external_accounts": [],
    "external_id": "567772",
    "first_name": "Example",
    "gender": "",
    "id": "user_29w83sxmDNGwOuEthce5gg56FcC",
    "image_url": "https://img.clerk.com/xxxxxx",
    "last_name": "Example",
    "last_sign_in_at": 1654012591514,
    "object": "user",
    "password_enabled": true,
    "phone_numbers": [],
    "primary_email_address_id": "idn_29w83yL7CwVlJXylYLxcslromF1",
    "primary_phone_number_id": null,
    "primary_web3_wallet_id": null,
    "private_metadata": {},
    "profile_image_url": "https://www.gravatar.com/avatar?d=mp",
    "public_metadata": {},
    "two_factor_enabled": false,
    "unsafe_metadata": {},
    "updated_at": 1654012591835,
    "username": null,
    "web3_wallets": []
  },
  "object": "event",
  "timestamp": 1654012591835,
  "type": "user.created"
}
```

## Troubleshooting

If webhooks are not working as expected:

1. Check that your webhook URL is publicly accessible
2. Verify that the webhook secret is correctly set in your environment variables
3. Check your application logs for any errors in processing the webhook
4. Use the Clerk Dashboard to view webhook delivery attempts and any errors

## Local Development

For local development, you can use a service like [ngrok](https://ngrok.com/) to expose your local server to the internet:

1. Install ngrok: `npm install -g ngrok`
2. Start your local server: `npm run dev`
3. Expose your local server: `ngrok http 3000`
4. Use the ngrok URL as your webhook URL in the Clerk Dashboard

## Manual Synchronization

If webhooks are not working or you need to manually synchronize a user, you can use the "Sync User Data" button on the profile page.
