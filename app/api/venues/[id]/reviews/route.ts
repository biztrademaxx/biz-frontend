import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { proxyJson } from "@/lib/backend-proxy";

// Disable static generation for this route
export const dynamic = "force-dynamic";

// POST: Create a new venue review – proxy to backend and include userId from session
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be logged in to submit a review" },
      { status: 401 },
    );
  }

  // Attach userId into the body before proxying
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const enrichedRequest = new Request(req.url, {
    method: "POST",
    headers: req.headers,
    body: JSON.stringify({
      ...body,
      userId: session.user.id,
    }),
  });

  return proxyJson(enrichedRequest, `/api/venues/${params.id}/reviews`, {
    method: "POST",
  });
}

// GET: Fetch reviews for a venue – proxy to backend
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return proxyJson(req, `/api/venues/${params.id}/reviews`);
}