/**
 * Logs only outside production. Prefer over `console.log` so:
 * - `next.config` `compiler.removeConsole` can still strip stray `console.*` in prod bundles
 * - Dev debugging stays explicit and grep-friendly (`devLog` vs `console.log`)
 *
 * For user-visible failures, use toasts/UI; for reporting, use Sentry (or similar), not `console.log`.
 */
export function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "production") return;
  // eslint-disable-next-line no-console -- intentional development-only sink
  console.log(...args);
}
