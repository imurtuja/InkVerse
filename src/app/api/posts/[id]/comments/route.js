import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import Notification from "@/models/Notification";
import { auth } from "@/lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const comments = await Comment.find({ post: id, parentComment: null })
      .populate("author", "name username image")
      .sort({ createdAt: -1 })
      .lean();

    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate("author", "name username image")
      .sort({ createdAt: 1 })
      .lean();

    const commentsWithReplies = comments.map((comment) => ({
      ...comment,
      replies: replies.filter(
        (r) => r.parentComment.toString() === comment._id.toString()
      ),
    }));

    return NextResponse.json({ comments: commentsWithReplies });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { content, parentComment } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comment = await Comment.create({
      author: session.user.id,
      post: id,
      content,
      parentComment: parentComment || null,
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    if (post.author.toString() !== session.user.id) {
      await Notification.create({
        recipient: post.author,
        sender: session.user.id,
        type: "comment",
        post: post._id,
      });
    }

    const populated = await Comment.findById(comment._id)
      .populate("author", "name username image")
      .lean();

    return NextResponse.json({ comment: { ...populated, replies: [] } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
