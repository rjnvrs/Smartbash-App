import { cookies } from "next/headers";

export type UserRole = "Resident" | "Services" | "BrgyOfficials" | "Admin";

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = Buffer.from(padded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const payload = token ? decodeJwtPayload(token) : null;
  const tokenRole = payload?.role as UserRole | undefined;
  const role = tokenRole;
  const exp = Number(payload?.exp || 0);

  if (!token || !role || !exp || exp * 1000 <= Date.now()) return null;

  return { token, role };
}
