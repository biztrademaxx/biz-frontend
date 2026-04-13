import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
// Use auth-options (OAuth + safe prisma), NOT lib/auth — that file calls prisma.user
// when prisma is null and crashes GET before any handler logic runs.
import { authOptions } from "@/lib/auth-options";

/**
 * @deprecated User settings are persisted by the Express backend (`GET/PATCH /api/settings`).
 * The dashboard uses `apiFetch` → `NEXT_PUBLIC_API_URL` (e.g. localhost:4000). This route is unused.
 */

function settingsFromSession(session: { user: Record<string, unknown> }) {
  const u = session.user as {
    id?: string;
    email?: string | null;
    phone?: string | null;
    role?: string;
    image?: string | null;
  };
  return {
    profileVisibility: "public",
    phoneNumber: u.phone ?? "",
    email: u.email ?? "",
    introduceMe: true,
    emailNotifications: true,
    eventReminders: true,
    newMessages: true,
    connectionRequests: true,
    isVerified: false,
    emailVerified: false,
    phoneVerified: false,
    role: u.role ?? "ATTENDEE",
  };
}

// GET - Get user settings (no DB on frontend)
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(settingsFromSession(session));
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH - Update user settings (no DB on frontend until backend exists)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const base = settingsFromSession(session);
    const merged = {
      ...base,
      ...(body.profileVisibility !== undefined && {
        profileVisibility: body.profileVisibility,
      }),
      ...(body.phoneNumber !== undefined && { phoneNumber: body.phoneNumber }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.introduceMe !== undefined && { introduceMe: body.introduceMe }),
      ...(body.emailNotifications !== undefined && {
        emailNotifications: body.emailNotifications,
      }),
      ...(body.eventReminders !== undefined && {
        eventReminders: body.eventReminders,
      }),
      ...(body.newMessages !== undefined && { newMessages: body.newMessages }),
      ...(body.connectionRequests !== undefined && {
        connectionRequests: body.connectionRequests,
      }),
    };

    // TODO: proxy to backend when POST/PATCH /api/settings is implemented
    return NextResponse.json({
      message: "Settings updated successfully (session-only until backend persists)",
      settings: merged,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
