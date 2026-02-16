import { API_BASE } from "@/lib/api";
import { clearCookie, getCookie, setCookie } from "@/lib/cookies";

export function saveAuthTokens(access: string, refresh: string) {
  setCookie("access_token", access, 60 * 60 * 24);
  setCookie("refresh_token", refresh, 60 * 60 * 24 * 7);
}

export function getAccessToken() {
  return getCookie("access_token");
}

export function clearAuthTokens() {
  clearCookie("access_token");
  clearCookie("refresh_token");
  clearCookie("user_role");
}

export async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  } finally {
    clearAuthTokens();
  }
}

export function isAuthenticated() {
  return !!getCookie("access_token");
}
