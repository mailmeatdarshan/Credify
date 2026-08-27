import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that any student, recruiter, or verifier can access without sign-in
const isPublicRoute = createRouteMatcher([
  '/',
  '/verify(.*)',
  '/benchmark(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/verify(.*)',
  '/api/benchmark(.*)',
  '/api/certificates/[id](.*)',
  '/api/institutions',
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
