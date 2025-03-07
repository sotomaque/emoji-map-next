import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Server-side environment variables schema
   */
  server: {
    GOOGLE_PLACES_API_KEY: z.string().min(1),
    GOOGLE_PLACES_URL: z.string().url().default("https://maps.googleapis.com/maps/api/place/nearbysearch/json"),
    GOOGLE_PLACES_DETAILS_URL: z.string().url().default("https://maps.googleapis.com/maps/api/place/details/json"),
    GOOGLE_PLACES_PHOTO_URL: z.string().url().default("https://maps.googleapis.com/maps/api/place/photo"),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /**
   * Client-side environment variables schema
   */
  client: {
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side, so we need to destruct manually.
   */
  runtimeEnv: {
    GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
    GOOGLE_PLACES_URL: process.env.GOOGLE_PLACES_URL,
    GOOGLE_PLACES_DETAILS_URL: process.env.GOOGLE_PLACES_DETAILS_URL,
    GOOGLE_PLACES_PHOTO_URL: process.env.GOOGLE_PLACES_PHOTO_URL,
    NODE_ENV: process.env.NODE_ENV,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
}); 