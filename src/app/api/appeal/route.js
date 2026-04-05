import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appeal from "@/models/Appeal";
import { auth } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await req.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Appeal message is required" }, { status: 400 });
    }

    await connectDB();

    // Prevent duplicate pending appeals to avoid spamming the admin dashboard
    const existingAppeal = await Appeal.findOne({ 
      user: session.user.id, 
      status: "pending" 
    });

    if (existingAppeal) {
      return NextResponse.json({ error: "You already have a pending appeal. Please wait for a response." }, { status: 429 });
    }

    const appeal = await Appeal.create({
      user: session.user.id,
      message: message.trim(),
      status: "pending",
    });

    return NextResponse.json({ success: true, appeal }, { status: 201 });
  } catch (error) {
    console.error("[Appeal Creation Error]:", error);
    return NextResponse.json({ error: "Internal server error submitting appeal" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const appeals = await Appeal.find({ user: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({ appeals }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch appeals" }, { status: 500 });
  }
}
