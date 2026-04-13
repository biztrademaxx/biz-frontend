import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

// POST — Send email verification code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ OTP Error: Unauthorized - No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();
    console.log("📧 OTP Request:", { userId: session.user.id, email });

    if (!email) {
      console.log("❌ OTP Error: Email is required");
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ OTP Error: Invalid email format");
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Get current user to check if it's their own email
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      console.log("❌ OTP Error: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by ANOTHER user (not the current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id }, // Exclude current user
      },
    });

    if (existingUser) {
      console.log("❌ OTP Error: Email already registered with another account");
      return NextResponse.json(
        { error: "This email is already registered with another account" },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    console.log("🔐 Generated OTP:", {
      userId: session.user.id,
      email: email,
      otp: otp,
      expiresAt: expiresAt.toISOString()
    });

    // Store OTP
    await prisma.verificationCode.upsert({
      where: {
        userId_type: { userId: session.user.id, type: "EMAIL" },
      },
      update: { code: otp, expiresAt, verified: false },
      create: {
        userId: session.user.id,
        type: "EMAIL",
        code: otp,
        expiresAt,
        verified: false,
      },
    });

    // Send the email
    await sendVerificationEmail(email, otp);

    console.log("✅ OTP sent successfully to:", email);
    return NextResponse.json({
      message: "Verification code sent successfully",
    });
  } catch (error: any) {
    console.error("🔥 OTP Send Error:", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}

// PUT — Verify email code
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log("❌ OTP Verification Error: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, email } = await request.json();
    console.log("🔍 OTP Verification Request:", { 
      userId: session.user.id, 
      email: email, 
      code: code 
    });

    if (!code || !email) {
      console.log("❌ OTP Verification Error: Code and email are required");
      return NextResponse.json(
        { error: "Code and email are required" },
        { status: 400 }
      );
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      console.log("❌ OTP Verification Error: Invalid code format");
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ OTP Verification Error: Invalid email format");
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      console.log("❌ OTP Verification Error: User not found");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by ANOTHER user (not the current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: session.user.id }, // Exclude current user
      },
    });

    if (existingUser) {
      console.log("❌ OTP Verification Error: Email already registered with another account");
      return NextResponse.json(
        { error: "This email is already registered with another account" },
        { status: 400 }
      );
    }

    // Retrieve verification entry
    const verification = await prisma.verificationCode.findUnique({
      where: { userId_type: { userId: session.user.id, type: "EMAIL" } },
    });

    if (!verification) {
      console.log("❌ OTP Verification Error: No verification code found for user");
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    console.log("📋 Stored OTP Details:", {
      storedCode: verification.code,
      enteredCode: code,
      expiresAt: verification.expiresAt,
      isVerified: verification.verified,
      isExpired: verification.expiresAt < new Date()
    });

    if (verification.verified) {
      console.log("❌ OTP Verification Error: Code already used");
      return NextResponse.json(
        { error: "This code has already been used. Please request a new one." },
        { status: 400 }
      );
    }

    if (verification.expiresAt < new Date()) {
      console.log("❌ OTP Verification Error: Code expired");
      return NextResponse.json(
        { error: "Verification code expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (verification.code !== code) {
      console.log("❌ OTP Verification Error: Invalid code");
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Mark as verified
    await prisma.verificationCode.update({
      where: { id: verification.id },
      data: { verified: true },
    });

    // Update user email and mark as verified
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        email, 
        emailVerified: true 
      },
    });

    console.log("✅ OTP Verification Successful:", {
      userId: session.user.id,
      email: email,
      verified: true
    });

    return NextResponse.json({
      message: "Email verified successfully",
      verified: true,
    });
  } catch (error: any) {
    console.error("🔥 OTP Verification Error:", {
      error: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    if (error.code === "P2002") {
      console.log("❌ OTP Verification Error: Email already exists in database");
      return NextResponse.json(
        { error: "This email is already registered with another account" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}