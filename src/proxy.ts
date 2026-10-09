import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Strict Privacy: explicitly disable geolocation, camera, and microphone permissions
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), interest-cohort=()"
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
