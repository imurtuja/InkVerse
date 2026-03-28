import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/require-admin";
import { escapeRegex } from "@/lib/utils";

export async function GET(request) {
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const q = (searchParams.get("q") || "").trim();

    await connectDB();

    const query = {};
    if (q) {
      const safe = escapeRegex(q);
      query.$or = [
        { username: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { name: { $regex: safe, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("name username email image bio role provider createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        hasMore: skip + users.length < total,
      },
    });
  } catch (e) {
    console.error("Admin users list error:", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
