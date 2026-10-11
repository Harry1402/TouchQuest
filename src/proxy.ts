import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Privacy & Safety: allow first-party camera for scene sensor; restrict geolocation, microphone, and tracking
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), camera=(self), microphone=(), interest-cohort=()"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
