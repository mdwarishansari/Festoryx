import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/superadmin(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();

  // Redirect /admin to /dashboard
  if (url.pathname.startsWith("/admin")) {
    url.pathname = url.pathname.replace(/^\/admin/, "/dashboard");
    return NextResponse.redirect(url);
  }

  const isSuperAdminLogin = req.nextUrl.pathname === "/superadmin/login";
  if (isProtectedRoute(req) && !isSuperAdminLogin) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
