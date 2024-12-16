// Middleware to protect admin routes
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuth } from "@/lib/adminAuth";

export async function middleware(request: NextRequest) {
  // Only run on admin API routes and admin pages
  if (
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }

  // Skip auth check for login endpoint
  if (
    request.nextUrl.pathname === "/admin/login" ||
    request.nextUrl.pathname === "/api/admin/auth"
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get("admin_session");

  if (!session?.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Verify session in KV
  const admin = await adminAuth.verifyAdmin(session.value);

  if (!admin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
