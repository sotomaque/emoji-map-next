import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    // GOOGLE PLACES
    GOOGLE_PLACES_API_KEY: z.string().min(1),
    GOOGLE_PLACES_URL: z
      .string()
      .url()
      .default('https://places.googleapis.com/v1'),

    // NODE
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // LOGGING
    LOG_LEVEL: z
      .enum(['NONE', 'ERROR', 'WARN', 'SUCCESS', 'INFO', 'DEBUG'])
      .optional(),

    // CLERK
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_SIGNING_SECRET: z.string().min(1),
    CLERK_ORG_ID: z.string().min(1),

    // SUPABASE
    POSTGRES_URL: z.string().min(1),
    POSTGRES_PRISMA_URL: z.string().min(1),
    SUPABASE_URL: z.string().min(1),
    POSTGRES_URL_NON_POOLING: z.string().min(1),
    SUPABASE_JWT_SECRET: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),

    // UPSTASH
    KV_REST_API_TOKEN: z.string().min(1),
    KV_REST_API_URL: z.string().min(1),

    // CACHE KEYS
    SEARCH_CACHE_KEY_VERSION: z.string().min(1),
    DETAILS_CACHE_KEY_VERSION: z.string().min(1),
    PHOTOS_CACHE_KEY_VERSION: z.string().min(1),

    // APP STORE CONNECT
    APP_STORE_CONNECT_BASE_URL: z
      .string()
      .url()
      .default('https://api.appstoreconnect.apple.com'),
    APP_STORE_CONNECT_APP_SKU: z.string().min(1),
    APP_STORE_CONNECT_ISSUER_ID: z.string().min(1),
    APP_STORE_CONNECT_KEY_ID: z.string().min(1),
    APP_STORE_CONNECT_PRIVATE_KEY: z.string().min(1),
    APP_STORE_CONNECT_VENDOR_NUMBER: z.string().min(1),

    // RESEND
    RESEND_API_KEY: z.string().min(1),
  },

  /**
   * Client-side environment variables schema
   */
  client: {
    // NEXT
    NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
    NEXT_PUBLIC_SITE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),

    // CLERK
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),

    // SUPABASE
    NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side, so we need to destruct manually.
   */
  runtimeEnv: {
    // GOOGLE PLACES
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACES_URL: process.env.GOOGLE_PLACES_URL,

    // NODE
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_ENV: process.env.NEXT_PUBLIC_SITE_ENV,

    // LOGGING
    LOG_LEVEL: process.env.LOG_LEVEL,

    // CLERK
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_SIGNING_SECRET: process.env.CLERK_SIGNING_SECRET,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_ORG_ID: process.env.CLERK_ORG_ID,

    // SUPABASE
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    SUPABASE_URL: process.env.SUPABASE_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    // UPSTASH
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
    KV_REST_API_URL: process.env.KV_REST_API_URL,

    // CACHE KEYS
    SEARCH_CACHE_KEY_VERSION: process.env.SEARCH_CACHE_KEY_VERSION,
    DETAILS_CACHE_KEY_VERSION: process.env.DETAILS_CACHE_KEY_VERSION,
    PHOTOS_CACHE_KEY_VERSION: process.env.PHOTOS_CACHE_KEY_VERSION,

    // APP STORE CONNECT
    APP_STORE_CONNECT_BASE_URL: process.env.APP_STORE_CONNECT_BASE_URL,
    APP_STORE_CONNECT_APP_SKU: process.env.APP_STORE_CONNECT_APP_SKU,
    APP_STORE_CONNECT_ISSUER_ID: process.env.APP_STORE_CONNECT_ISSUER_ID,
    APP_STORE_CONNECT_KEY_ID: process.env.APP_STORE_CONNECT_KEY_ID,
    APP_STORE_CONNECT_PRIVATE_KEY: process.env.APP_STORE_CONNECT_PRIVATE_KEY,
    APP_STORE_CONNECT_VENDOR_NUMBER:
      process.env.APP_STORE_CONNECT_VENDOR_NUMBER,

    // RESEND
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
