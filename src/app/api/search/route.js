import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const type = searchParams.get("type") || "all";

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ posts: [], users: [] });
    }

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    let posts = [];
    let users = [];

    if (type === "all" || type === "posts") {
      posts = await Post.find({
        $or: [
          { title: regex },
          { content: regex },
          { tags: regex },
          { category: regex },
        ],
      })
        .populate("author", "name username image")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    }

    if (type === "all" || type === "users") {
      users = await User.find({
        $or: [
          { name: regex },
          { username: regex },
          { bio: regex },
        ],
      })
        .select("name username image bio")
        .limit(10)
        .lean();
    }

    return NextResponse.json({ posts, users });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
