import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PasswordReset from "@/models/PasswordReset";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, token, newPassword } = await req.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Hash the incoming token to match it against the DB
    const incomingHashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetDoc = await PasswordReset.findOne({
      userId: user._id,
      hashedToken: incomingHashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetDoc) {
      return NextResponse.json({ error: "Token is invalid or has expired." }, { status: 400 });
    }

    // Securely hash the new password
    const rawSalt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, rawSalt);

    // Patch User with new password
    await User.findByIdAndUpdate(user._id, {
      $set: { password: hashedPassword }
    });

    // Invalidate the token
    resetDoc.used = true;
    await resetDoc.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset confirmation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
