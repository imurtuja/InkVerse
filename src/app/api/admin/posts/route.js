import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
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
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const q = (searchParams.get("q") || "").trim();
    const category = searchParams.get("category");

    await connectDB();

    const query = {};
    if (category && category !== "all") {
      query.category = category;
    }
    if (q) {
      const safe = escapeRegex(q);
      query.$or = [
        { content: { $regex: safe, $options: "i" } },
        { title: { $regex: safe, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name username image role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        hasMore: skip + posts.length < total,
      },
    });
  } catch (e) {
    console.error("Admin posts list error:", e);
    return NextResponse.json({ error: "Failed to load posts" }, { status: 500 });
  }
}
