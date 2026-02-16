import { clearCookie, getCookie, setCookie } from "@/lib/cookies";

const browserApiBase =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:8000/api`
    : null;

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? browserApiBase ?? "http://127.0.0.1:8000/api";

export async function parseJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return { data: {}, text: "" };
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: null, text };
  }
}

async function getAuthToken() {
  if (typeof window === "undefined") return null;
  return getCookie("access_token");
}

async function refreshAccessToken() {
  if (typeof window === "undefined") return null;
  const refresh = getCookie("refresh_token");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearCookie("access_token");
      clearCookie("refresh_token");
      clearCookie("user_role");
      window.location.href = "/login";
      return null;
    }
    const data = await res.json();
    if (data?.access) {
      setCookie("access_token", data.access, 60 * 60 * 24);
    }
    return data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

export async function apiFetch(url: string, options: RequestInit = {}) {
  let token = await getAuthToken();
  
  if (!token && typeof window !== "undefined") {
    token = await refreshAccessToken();
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // If 401, try to refresh and retry once
  if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  // If backend returns token_not_valid in JSON body, refresh and retry once
  if (typeof window !== "undefined") {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (data && data.code === "token_not_valid") {
          const newToken = await refreshAccessToken();
          if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(`${API_BASE}${url}`, {
              ...options,
              headers,
              credentials: "include",
            });
          }
        }
      } catch {
        // ignore JSON parse errors
      }
    }
  }

  return response;
}

export async function signupUser(data: any) {
  const useFormData = typeof data !== "object" || data instanceof FormData;

  try {
    const res = await fetch(`${API_BASE}/auth/signup/`, {
      method: "POST",
      headers: useFormData ? undefined : { "Content-Type": "application/json" },
      body: useFormData ? data : JSON.stringify(data),
      credentials: "include",
    });

    const { data: payload, text } = await parseJsonSafe(res);
    if (!res.ok) {
      if (!payload) throw new Error(text || "Registration failed");
      throw new Error(payload.message || "Registration failed");
    }

    return payload || {};
  } catch (error: any) {
    throw new Error(error?.message || "Network error");
  }
}
