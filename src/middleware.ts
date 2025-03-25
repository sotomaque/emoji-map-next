import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a route matcher for public routes
const isPublic = createRouteMatcher([
  '/',
  '/api/webhooks/clerk(.*)',
  '/api/places(.*)',
  '/api/docs(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// Simple middleware configuration that allows public access to specified routes
export default clerkMiddleware((auth, req) => {
  if (isPublic(req)) {
    return;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
