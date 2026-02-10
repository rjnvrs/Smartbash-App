export function saveAuthTokens(access: string, refresh: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  }
}

export function getAccessToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access");
  }
  return null;
}

export function clearAuthTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }
}

import { API_BASE } from "@/lib/api";

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
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("access");
  }
  return false;
}
