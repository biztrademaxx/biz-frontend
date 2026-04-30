import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ProxyJsonOptions = {
  /**
   * For GET only: cache the upstream response in Next.js Data Cache and allow CDN caching.
   * Use for public read endpoints (e.g. events list). Omit for auth / user-specific routes.
   */
  revalidateSeconds?: number;
};

export async function proxyJson(
  req: Request,
  backendPath: string,
  init?: RequestInit,
  options?: ProxyJsonOptions
): Promise<Response> {
  const url = new URL(req.url);
  const search = url.search ? url.search : "";

  const target = `${API_BASE_URL}${backendPath}${search}`;

  const auth = req.headers.get("authorization") ?? undefined;
  const method = init?.method ?? req.method;

  let body: BodyInit | undefined = init?.body ?? undefined;

  if (!body && method !== "GET" && method !== "HEAD") {
    try {
      const json = await req.json();
      body = JSON.stringify(json);
    } catch {
      // ignore body-less requests
    }
  }

  const isGetOrHead = method === "GET" || method === "HEAD";
  const revalidate =
    isGetOrHead &&
    options?.revalidateSeconds != null &&
    options.revalidateSeconds > 0
      ? options.revalidateSeconds
      : undefined;

  const res = await fetch(target, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: auth } : {}),
      ...(init?.headers ?? {}),
    },
    body: isGetOrHead ? undefined : body,
    ...(revalidate != null
      ? { next: { revalidate } }
      : { cache: "no-store" as RequestInit["cache"] }),
  });

  const data = await res.json().catch(() => ({}));

  const cacheHeaders =
    revalidate != null
      ? {
          "Cache-Control": `public, s-maxage=${revalidate}, stale-while-revalidate=${Math.min(revalidate * 4, 300)}`,
        }
      : undefined;

  // NextResponse.json avoids Node/undici "transformAlgorithm is not a function" with some Response bodies on Next 16.
  return NextResponse.json(data, {
    status: res.status,
    ...(cacheHeaders ? { headers: cacheHeaders } : {}),
  });
}

