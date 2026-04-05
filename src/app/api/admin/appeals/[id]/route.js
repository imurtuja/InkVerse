import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appeal from "@/models/Appeal";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function PATCH(req, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, adminResponse } = await req.json();
    const { id } = await params;

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();

    const appeal = await Appeal.findById(id);
    if (!appeal) {
      return NextResponse.json({ error: "Appeal not found" }, { status: 404 });
    }

    appeal.status = status;
    if (adminResponse) appeal.adminResponse = adminResponse;
    await appeal.save();

    // System resolution
    if (status === "approved") {
      // Unban the user
      await User.findByIdAndUpdate(appeal.user, {
        isBanned: false,
        banReason: null,
        banExpiresAt: null,
      });
    }

    return NextResponse.json({ success: true, message: `Appeal ${status}.` });
  } catch (error) {
    console.error("Admin Appeal Resolution Error:", error);
    return NextResponse.json({ error: "Failed to resolve appeal" }, { status: 500 });
  }
}
