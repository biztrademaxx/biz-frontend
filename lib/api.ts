// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/** Backend API origin — same host used by {@link apiFetch} (not the Next.js app). */
export function getBackendApiBaseUrl(): string {
  return API_BASE_URL.replace(/\/$/, "");
}

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export type ApiRequestOptions = {
  method?: string;
  body?: any;
  headers?: HeadersInit;
  /**
   * Whether to attach Authorization header and perform auto-refresh on 401.
   * Defaults to true.
   */
  auth?: boolean;
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(params: { accessToken: string; refreshToken?: string }) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);
  if (params.refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken);
  }
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Decode JWT payload without verification (client-side only; for reading sub/role/permissions). */
function decodeJwtPayload(token: string): {
  sub?: string;
  role?: string;
  domain?: string;
  permissions?: string[];
  firstName?: string;
  lastName?: string;
  email?: string;
  displayName?: string;
} | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload;
  } catch {
    return null;
  }
}

/** Current user id from stored access token (for use when backend expects userId in body). */
export function getCurrentUserId(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload?.sub ?? null;
}

/** Current user role from stored access token. */
export function getCurrentUserRole(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload?.role ?? null;
}

/** Display name from JWT (`displayName` from backend) or first/last/email fallback. */
export function getCurrentUserDisplayName(): string {
  const token = getAccessToken();
  if (!token) return "User";
  const payload = decodeJwtPayload(token);
  const fromJwt = payload?.displayName?.trim();
  if (fromJwt) return fromJwt;
  if (payload?.firstName || payload?.lastName) {
    return [payload.firstName, payload.lastName].filter(Boolean).join(" ").replace(/\s+/g, " ").trim() || "User";
  }
  return payload?.email ?? "User";
}

/** Current user email from stored access token. */
export function getCurrentUserEmail(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  return payload?.email ?? null;
}

/** Current user permissions from stored access token (backend sets for ADMIN domain). */
export function getCurrentUserPermissions(): string[] {
  const token = getAccessToken();
  if (!token) return [];
  const payload = decodeJwtPayload(token);
  const p = payload?.permissions;
  return Array.isArray(p) ? p : [];
}

/** Whether the client has an access token (user considered logged in for API auth). */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

async function refreshAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const data = await response.json();
    const newAccessToken: string | undefined = data.accessToken;
    const newRefreshToken: string | undefined = data.refreshToken;

    if (!newAccessToken) {
      clearTokens();
      return null;
    }

    setTokens({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken ?? refreshToken,
    });

    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token", error);
    clearTokens();
    return null;
  }
}

/**
 * HTTP client for the **backend** (`NEXT_PUBLIC_API_URL`). Paths are backend routes (e.g. `/api/events/...`),
 * not relative to the Next.js site.
 */
export async function apiFetch<T = any>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const { method = "GET", body, headers, auth = true } = options;

  const makeHeaders = (authorization: string | null): Record<string, string> => {
    const h: Record<string, string> = {
      ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
    };
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, key) => {
          h[key] = value;
        });
      } else if (Array.isArray(headers)) {
        for (const [k, v] of headers) h[k] = v;
      } else {
        Object.assign(h, headers as Record<string, string>);
      }
    }
    if (authorization) h.Authorization = authorization;
    return h;
  };

  const requestBody =
    body && !(body instanceof FormData)
      ? JSON.stringify(body)
      : body instanceof FormData
        ? body
        : undefined;

  const token = auth && typeof window !== "undefined" ? getAccessToken() : null;
  const firstAuth = token ? `Bearer ${token}` : null;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: makeHeaders(firstAuth),
      body: requestBody,
    });
  } catch (cause: any) {
    const base = getBackendApiBaseUrl();
    const error: any = new Error(
      `Network error while calling ${url}. ` +
        `Ensure the Express API is running and reachable at ${base} (see biz-backend: npm run dev), ` +
        `CORS_ORIGIN includes this app’s origin, NEXT_PUBLIC_API_URL matches the API, and port 4000 is not blocked (e.g. EADDRINUSE).`,
    );
    error.path = path;
    error.url = url;
    error.cause = cause;
    throw error;
  }

  // Single refresh + retry on 401: rebuild headers + body so the new token is always sent
  if (auth && response.status === 401 && typeof window !== "undefined") {
    const newToken = await refreshAccessToken();
    if (newToken) {
      try {
        response = await fetch(url, {
          method,
          headers: makeHeaders(`Bearer ${newToken}`),
          body: requestBody,
        });
      } catch (cause: any) {
        const error: any = new Error(
          `Network error while retrying ${url} after token refresh.`,
        );
        error.path = path;
        error.url = url;
        error.cause = cause;
        throw error;
      }
    }
  }

  if (!response.ok) {
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      // ignore JSON parse errors
    }

    const primary =
      errorBody?.message ||
      errorBody?.error ||
      `Request to ${path} failed with status ${response.status}`;
    const detail = typeof errorBody?.details === "string" ? errorBody.details : "";
    const message =
      detail && !primary.includes(detail)
        ? `${primary}${primary.endsWith(".") ? "" : "."} ${detail}`
        : primary;

    const error: any = new Error(message);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  const data = await response.json();
  return data as T;
}

export async function loginWithEmailPassword(email: string, password: string) {
  const result = await apiFetch<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  setTokens({
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });

  return result;
}