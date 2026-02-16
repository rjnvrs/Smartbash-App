import { NextRequest, NextResponse } from "next/server";

const protectedRoutePrefixes = ["/dashboards", "/admin"];

const roleAllowedPrefixes: Record<string, string[]> = {
  Resident: ["/dashboards/residents"],
  BrgyOfficials: ["/dashboards/officials"],
  Services: ["/dashboards/services"],
  Admin: ["/admin"],
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtected && token && !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isProtected && token && role) {
    const allowed = roleAllowedPrefixes[role] || [];
    const allowedPath = allowed.some((prefix) => pathname.startsWith(prefix));
    if (!allowedPath) {
      const target = allowed[0] || "/login";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  if (pathname === "/login" && token && role) {
    const allowed = roleAllowedPrefixes[role] || [];
    if (allowed[0]) {
      return NextResponse.redirect(new URL(allowed[0], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboards/:path*",
    "/admin/:path*",
    "/login",
  ],
};
