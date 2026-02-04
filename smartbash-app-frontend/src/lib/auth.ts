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

export function isAuthenticated() {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("access");
  }
  return false;
}