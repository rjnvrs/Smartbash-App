import { NextRequest, NextResponse } from "next/server";

const protectedRoutePrefixes = ["/dashboards", "/admin"];
const allowedRoles = new Set(["Resident", "BrgyOfficials", "Services", "Admin"]);

const roleAllowedPrefixes: Record<string, string[]> = {
  Resident: ["/dashboards/residents"],
  BrgyOfficials: ["/dashboards/officials"],
  Services: ["/dashboards/services"],
  Admin: ["/admin"],
};

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutePrefixes.some((prefix) => pathname.startsWith(prefix));
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let role = "";
  if (isProtected && token) {
    const payload = parseJwtPayload(token);
    const exp = Number(payload?.exp || 0);
    if (!payload || !exp || exp * 1000 <= Date.now()) {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.delete("access_token");
      res.cookies.delete("refresh_token");
      res.cookies.delete("user_role");
      return res;
    }
    role = String(payload?.role || "");
  }

  if (isProtected && token && (!role || !allowedRoles.has(role))) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    res.cookies.delete("user_role");
    return res;
  }

  if (isProtected && token && role) {
    const allowed = roleAllowedPrefixes[role] || [];
    const allowedPath =
      pathname === "/dashboards" || allowed.some((prefix) => pathname.startsWith(prefix));
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
