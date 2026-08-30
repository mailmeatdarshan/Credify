import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Certificate UUIDs are the only safe public surface under /api/certificates.
// Note: Clerk's pathToRegexp treats [id] literally (not as a param), and
// ':id' would also match /api/certificates/issue and /bulk. So scope with a UUID regex.
const uuidPattern = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

// Define public routes that any student, recruiter, or verifier can access without sign-in
const isPublicRoute = createRouteMatcher([
  '/',
  '/verify(.*)',
  '/benchmark(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/verify(.*)',
  '/api/benchmark(.*)',
  new RegExp(`^\\/api\\/certificates\\/${uuidPattern}$`),
  new RegExp(`^\\/api\\/certificates\\/${uuidPattern}\\/pdf$`),
  new RegExp(`^\\/certificates\\/${uuidPattern}$`),
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
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
