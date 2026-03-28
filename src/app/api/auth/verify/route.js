import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import PendingUser from "@/models/PendingUser";

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the pending signup
    const pending = await PendingUser.findOne({ 
      email: email.toLowerCase(),
      otp: otp.trim()
    });

    if (!pending) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Check if user already exists (just in case of parallel signups)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      await PendingUser.deleteOne({ _id: pending._id });
      return NextResponse.json(
        { error: "Account already verified. Please login." },
        { status: 400 }
      );
    }

    // Create the final user
    const newUser = await User.create({
      name: pending.name,
      username: pending.username,
      email: pending.email,
      password: pending.password,
      provider: "credentials",
    });

    // Delete the pending record
    await PendingUser.deleteOne({ _id: pending._id });

    // Send Welcome Email
    const { sendWelcomeEmail } = await import("@/lib/mail");
    await sendWelcomeEmail(newUser.email, newUser.name);

    return NextResponse.json(
      {
        message: "Email verified successfully!",
        user: {
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
