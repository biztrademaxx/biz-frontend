import { getBackendApiBaseUrl } from "@/lib/api";

/**
 * Forward a browser (or Route Handler) request to the Express API.
 * Forwards `Authorization` and `Cookie` when present so Bearer JWT and NextAuth cookies can reach the backend.
 */
export async function proxyGetToBackend(
  request: Request,
  backendPathAndQuery: string,
): Promise<Response> {
  const path = backendPathAndQuery.startsWith("/") ? backendPathAndQuery : `/${backendPathAndQuery}`;
  const url = `${getBackendApiBaseUrl()}${path}`;
  const auth = request.headers.get("authorization");
  const cookie = request.headers.get("cookie");
  const headers = new Headers();
  if (auth) headers.set("Authorization", auth);
  if (cookie) headers.set("Cookie", cookie);
  return fetch(url, { method: "GET", headers, cache: "no-store" });
}
