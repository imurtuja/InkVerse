import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const post = await Post.findById(id)
      .populate("author", "name username image bio")
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, category, tags, language } = await request.json();

    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (title !== undefined) post.title = title.trim();
    post.content = content || post.content;
    post.category = category || post.category;
    if (category === "code" && language !== undefined) {
      post.lang = language.trim();
    } else if (category && category !== "code") {
      post.lang = undefined;
    }
    post.tags = tags || post.tags;
    await post.save();

    const updated = await Post.findById(id)
      .populate("author", "name username image")
      .lean();

    return NextResponse.json({ post: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await Comment.deleteMany({ post: id });
    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: "Post deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
