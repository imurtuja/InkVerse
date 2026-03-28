import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    await connectDB();
    const [usersCount, postsCount, commentsCount, adminsCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ role: "admin" }),
    ]);

    return NextResponse.json({
      usersCount,
      postsCount,
      commentsCount,
      adminsCount,
    });
  } catch (e) {
    console.error("Admin stats error:", e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
