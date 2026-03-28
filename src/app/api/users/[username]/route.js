import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { username } = await params;

    const user = await User.findOne({ username })
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await Post.find({ author: user._id })
      .populate("author", "name username image")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      user: {
        ...user,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      },
      posts,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}
