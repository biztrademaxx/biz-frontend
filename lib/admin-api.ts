/**
 * Admin API client – all requests go to the Express backend (NEXT_PUBLIC_API_URL).
 * Uses apiFetch with auth so the backend receives the Bearer token.
 */

import { apiFetch, ApiRequestOptions } from "./api";

// Reuse the ApiRequestOptions type from api.ts
export type AdminApiOptions = Omit<ApiRequestOptions, 'auth'> & {
  auth?: boolean;
};

export function adminApi<T = unknown>(path: string, options: AdminApiOptions = {}): Promise<T> {
  const { auth = true, ...rest } = options;
  const method = options.method ?? "GET";
  
  // Create a properly typed options object for apiFetch
  const fetchOptions: ApiRequestOptions = {
    ...rest,
    method,
    auth,
  };

  return apiFetch<T>(`/api/admin${path}`, fetchOptions);
}

export default adminApi;