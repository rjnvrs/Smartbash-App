import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboards/residents",
  "/dashboards/officials",
  "/dashboards/services",
  "/admin",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;
  
  // Check if route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboards/:path*",
    "/admin/:path*",
  ],
};