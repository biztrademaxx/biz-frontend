import { type NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Registration proxy error (Next.js -> backend):", error);
    return NextResponse.json(
      {
        error: "Registration failed. Please try again.",
        details: error?.message,
      },
      { status: 500 },
    );
  }
}
