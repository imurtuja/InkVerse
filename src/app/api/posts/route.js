import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { autoModeratePost } from "@/lib/moderationService";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const category = searchParams.get("category");
    const author = searchParams.get("author");

    const bannedUsers = await User.find({ isBanned: true }).select('_id').lean();
    const bannedUserIds = bannedUsers.map(u => u._id);

    const query = { 
      $or: [{ status: "active" }, { status: { $exists: false } }],
      author: { $nin: bannedUserIds }
    };
    
    if (category && category !== "all") query.category = category;
    if (author) {
      if (bannedUserIds.some(id => id.toString() === author.toString())) {
        return NextResponse.json({ posts: [], pagination: null });
      }
      query.author = author;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name username image")
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
        pages: Math.ceil(total / limit),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, category, tags, language, images } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.create({
      author: session.user.id,
      title: title?.trim() || "",
      content,
      category: category || "general",
      lang: category === "code" ? language : undefined,
      tags: tags || [],
      images: images || [],
      status: "active",
      autoFlagged: false,
    });

    // Asynchronously moderate evaluating flags transparently allowing frontends rapid resolutions.
    await autoModeratePost(session.user.id, post._id, content, title);

    const populated = await Post.findById(post._id)
      .populate("author", "name username image")
      .lean();

    return NextResponse.json({ post: populated }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
