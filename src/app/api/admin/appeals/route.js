import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Appeal from "@/models/Appeal";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 15;
    const status = searchParams.get("status") || "pending";

    const query = {};
    if (status !== "all") query.status = status;

    await connectDB();

    const skip = (page - 1) * limit;
    const [appeals, total] = await Promise.all([
      Appeal.find(query)
        .populate("user", "name username email image isBanned banReason banExpiresAt")
        .sort({ createdAt: status === "pending" ? 1 : -1 }) // Oldest pending first
        .skip(skip)
        .limit(limit)
        .lean(),
      Appeal.countDocuments(query),
    ]);

    return NextResponse.json({
      appeals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + appeals.length < total,
      },
    }, { status: 200 });

  } catch (error) {
    console.error("Admin Appeals GET Error:", error);
    return NextResponse.json({ error: "Failed to load appeals" }, { status: 500 });
  }
}
