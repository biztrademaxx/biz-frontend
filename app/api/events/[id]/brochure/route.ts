import { type NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const VALID_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/gif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

// PUT — Upload brochure to Cloudinary, then update event via backend
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(ctx.params);
    const formData = await request.formData();
    const brochureFile = formData.get("brochure") as File | null;

    if (!brochureFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!VALID_FILE_TYPES.includes(brochureFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or image file." },
        { status: 400 }
      );
    }
    if (brochureFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Please upload a file smaller than 10MB." },
        { status: 400 }
      );
    }

    const uploadResult = await uploadToCloudinary(brochureFile, "events/brochures");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
    };
    const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ brochure: uploadResult.secure_url }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({ brochure: uploadResult.secure_url, ...data }, { status: 200 });
  } catch (error) {
    console.error("Error updating brochure:", error);
    return NextResponse.json(
      { error: "Failed to update brochure" },
      { status: 500 }
    );
  }
}

// GET — Proxy to backend
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  const { id } = await Promise.resolve(ctx.params);
  const url = new URL(request.url);
  const query = url.search || "";
  try {
    const res = await fetch(`${API_BASE_URL}/api/events/${id}/brochure${query}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Error fetching brochure:", e);
    return NextResponse.json({ error: "Failed to fetch brochure" }, { status: 500 });
  }
}

// DELETE — Remove brochure via backend PATCH
export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(ctx.params);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(INTERNAL_SECRET ? { "X-Internal-Secret": INTERNAL_SECRET } : {}),
    };
    const res = await fetch(`${API_BASE_URL}/api/events/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ brochure: null }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json({ message: "Brochure removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting brochure:", error);
    return NextResponse.json(
      { error: "Failed to delete brochure" },
      { status: 500 }
    );
  }
}
