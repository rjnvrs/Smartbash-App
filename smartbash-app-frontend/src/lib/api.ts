const API_BASE = "http://127.0.0.1:8000/api";

async function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access");
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return null;
    }
    const data = await res.json();
    localStorage.setItem("access", data.access);
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

  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // If 401, try to refresh and retry once
  if (response.status === 401 && typeof window !== "undefined") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
}

export async function signupUser(data: any) {
  const useFormData = typeof data !== "object" || data instanceof FormData;

  const res = await fetch(`${API_BASE}/auth/signup/`, {
    method: "POST",
    headers: useFormData ? undefined : { "Content-Type": "application/json" },
    body: useFormData ? data : JSON.stringify(data),
  });

  return res.json();
}