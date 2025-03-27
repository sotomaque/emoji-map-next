import {
  APP_STORE_CONNECT_CONSOLE,
  APPLAUNCHPAD_CONSOLE,
  CLERK_CONSOLE,
  GOOGLE_PLACES_API_CONSOLE,
  LINEAR_CONSOLE,
  POSTMAN_COLLECTION,
  SLACK_INVITE_LINK,
  SLACK_WORKSPACE,
  SUPABASE_CONSOLE,
  UPSTASH_CONSOLE,
  VERCEL_CONSOLE,
  GMAIL_CONSOLE,
  RESEND_CONSOLE,
  KEYBASE_CONSOLE,
} from './links';

export const SERVICES = [
  {
    title: 'App Launchpad',
    description: 'App Store screenshots',
    href: '/admin/services/app-launchpad',
    logoUrl: '/services/app-launchpad.png',
    links: [
      {
        title: 'Go to Console',
        href: APPLAUNCHPAD_CONSOLE,
      },
    ],
  },
  {
    title: 'App Store Connect',
    description: 'iOS app distribution',
    href: '/admin/services/app-store-connect',
    logoUrl: '/services/app-store-connect.png',
    links: [
      {
        title: 'Go to Console',
        href: APP_STORE_CONNECT_CONSOLE,
      },
    ],
  },
  {
    title: 'Clerk',
    description: 'Authentication and user management',
    href: '/admin/services/clerk',
    logoUrl: '/services/clerk.svg',
    darkInvert: true,
    links: [
      {
        title: 'Go to Console',
        href: CLERK_CONSOLE,
      },
    ],
  },
  {
    title: 'Gmail',
    description: 'Email',
    href: '/admin/services/gmail',
    logoUrl: '/services/gmail.png',
    links: [
      {
        title: 'Go to Console',
        href: GMAIL_CONSOLE,
      },
    ],
  },
  {
    title: 'Google Places API',
    description: 'Location data and mapping services',
    href: '/admin/services/google-places-api',
    logoUrl: '/services/google-places-api.svg',
    links: [
      {
        title: 'Go to Console',
        href: GOOGLE_PLACES_API_CONSOLE,
      },
    ],
  },
  {
    title: 'Keybase',
    description: 'Secure file sharing',
    href: '/admin/services/keybase',
    logoUrl: '/services/keybase.png',
    links: [
      {
        title: 'Join Team',
        href: KEYBASE_CONSOLE,
      },
    ],
  },
  {
    title: 'Linear',
    description: 'Project management',
    href: '/admin/services/linear',
    logoUrl: '/services/linear.png',
    darkInvert: true,
    links: [
      {
        title: 'Go to Console',
        href: LINEAR_CONSOLE,
      },
    ],
  },
  {
    title: 'Postman',
    description: 'API testing and documentation',
    href: '/admin/services/postman',
    logoUrl: '/services/postman.png',
    links: [
      {
        title: 'View Collection',
        href: POSTMAN_COLLECTION,
      },
    ],
  },
  {
    title: 'Resend',
    description: 'Sending emails',
    href: '/admin/services/resend',
    logoUrl: '/services/resend.png',
    darkInvert: true,
    links: [
      {
        title: 'Go to Console',
        href: RESEND_CONSOLE,
      },
    ],
  },
  {
    title: 'Slack',
    description: 'Team communication',
    href: '/admin/services/slack',
    logoUrl: '/services/slack.png',
    links: [
      {
        title: 'Join Slack',
        href: SLACK_INVITE_LINK,
      },
      {
        title: 'Go to Workspace',
        href: SLACK_WORKSPACE,
      },
    ],
  },
  {
    title: 'Supabase',
    description: 'Database and backend services',
    href: '/admin/services/supabase',
    logoUrl: '/services/supabase.png',
    links: [
      {
        title: 'Go to Console',
        href: SUPABASE_CONSOLE,
      },
    ],
  },
  {
    title: 'Upstash',
    description: 'Serverless Redis',
    href: '/admin/services/upstash',
    logoUrl: '/services/upstash.png',
    links: [
      {
        title: 'Go to Console',
        href: UPSTASH_CONSOLE,
      },
    ],
  },
  {
    title: 'Vercel',
    description: 'Deployments, previews and hosting',
    href: '/admin/services/vercel',
    logoUrl: '/services/vercel.png',
    darkInvert: true,
    links: [
      {
        title: 'Go to Console',
        href: VERCEL_CONSOLE,
      },
    ],
  },
];
