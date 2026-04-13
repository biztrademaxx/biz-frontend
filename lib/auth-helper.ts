export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Try localStorage first
  const token = 
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("adminToken");

  if (token) {
    return token;
  }

  // Fallback to cookies
  const cookieToken = document.cookie
    .split("; ")
    .find(row => row.startsWith("superAdminToken=") || row.startsWith("adminToken="))
    ?.split("=")[1];

  return cookieToken || null;
}

export function setAuthToken(token: string, isSuperAdmin: boolean = true): void {
  if (typeof window === "undefined") return;

  const tokenName = isSuperAdmin ? "superAdminToken" : "adminToken";
  
  // Set in localStorage
  localStorage.setItem(tokenName, token);
  
  // Also set in cookies for middleware access
  const maxAge = 24 * 60 * 60; // 24 hours
  document.cookie = `${tokenName}=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;

  // Clear from localStorage
  localStorage.removeItem("superAdminToken");
  localStorage.removeItem("adminToken");

  // Clear from cookies
  document.cookie = "superAdminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}