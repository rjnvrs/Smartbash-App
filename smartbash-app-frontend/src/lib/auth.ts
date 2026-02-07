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

export async function logout() {
  try {
    await fetch("http://127.0.0.1:8000/api/auth/logout/", {
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
