import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  console.log(`[Middleware] Path: ${nextUrl.pathname}, LoggedIn: ${isLoggedIn}`);

  // 1. Root route automatic navigation
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  }

  // 2. REDIRECTS: Automatically navigate users to another route
  // If user tries to visit `/old-dashboard` or `/home`, redirect them to `/dashboard`
  if (nextUrl.pathname === "/old-dashboard" || nextUrl.pathname === "/home") {
    console.log(`[Middleware] Redirecting ${nextUrl.pathname} -> /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 3. REQUEST REWRITING: Internally reroute requests without changing the browser URL
  // Rewrite requests to `/api/v1/candidates` internally to `/api/candidates`
  if (nextUrl.pathname === "/api/v1/candidates") {
    console.log(`[Middleware] Rewriting /api/v1/candidates -> /api/candidates`);
    return NextResponse.rewrite(new URL("/api/candidates", nextUrl));
  }

  // 4. PROTECTION GUARD: Secure private routes
  const protectedPaths = ["/dashboard", "/candidates", "/jobs", "/search", "/chat"];
  const isProtectedRoute = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute) {
    if (!isLoggedIn) {
      console.log(`[Middleware] Unauthorized. Redirecting to /login`);
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
  } else if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    console.log(`[Middleware] Authenticated user accessing auth pages. Redirecting to /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

// 5. MATCHER PATTERNS: Controls where the middleware executes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

