// src/lib/auth.ts
import { cookies } from "next/headers";

export type UserRole = "Resident" | "Services" | "BrgyOfficials" | "Admin";

export async function getCurrentUser() {
  const cookieStore = await cookies(); // MUST await

  const token = cookieStore.get("access_token")?.value;
  const role = cookieStore.get("user_role")?.value as UserRole | undefined;

  if (!token || !role) return null;

  return {
    token,
    role,
  };
}
