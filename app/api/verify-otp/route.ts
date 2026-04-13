import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Otp from "@/models/otp";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json({ message: "Email & OTP are required" }, { status: 400 });
    }

    await dbConnect();

    const normalizedEmail = email.trim().toLowerCase();

    // Find OTP
    const record = await Otp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!record) {
      return NextResponse.json({ message: "OTP not found" }, { status: 400 });
    }

    // Check expiry
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    // Check match
    if (record.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    // ✅ OTP is valid → delete it (one-time use)
    await Otp.deleteMany({ email: normalizedEmail });

    return NextResponse.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ message: "Failed to verify OTP" }, { status: 500 });
  }
}
