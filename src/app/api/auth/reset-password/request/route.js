import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import { sendPasswordResetEmail } from "@/lib/mail";
import { requireAdmin } from "@/lib/require-admin";
import crypto from "crypto";

export async function POST(req) {
  // Security Hardening: Only an admin can generate a reset link
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Rate Limiting: Max 3 reset requests per user per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentResets = await PasswordReset.countDocuments({
      userId: user._id,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentResets >= 3) {
      return NextResponse.json({ error: "Rate limit exceeded. Maximum 3 resets per hour." }, { status: 429 });
    }

    // Generate Token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await PasswordReset.create({
      userId: user._id,
      hashedToken,
      expiresAt,
    });

    // Send Email
    await sendPasswordResetEmail(user.email, rawToken, user.name);

    return NextResponse.json({ message: "Password reset link sent securely to the user." });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
