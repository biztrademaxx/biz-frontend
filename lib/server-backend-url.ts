/**
 * Base URL for **server-side** Next.js fetches to the Express API (browse sections, etc.).
 *
 * - Prefer `API_INTERNAL_URL` in Docker/Kubernetes where `localhost` from the Next process
 *   is not the API (e.g. `http://api:4000` or `http://host.docker.internal:4000`).
 * - Falls back to `NEXT_PUBLIC_API_URL`, then `http://127.0.0.1:4000`.
 */
export function getBackendUrlForServerFetch(): string {
  const raw = (
    process.env.API_INTERNAL_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://127.0.0.1:4000"
  ).replace(/\/$/, "");
  return raw;
}
