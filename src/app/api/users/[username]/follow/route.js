import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { auth } from "@/lib/auth";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await params;
    await connectDB();

    const targetUser = await User.findOne({ username });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUser._id.toString() === session.user.id) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const currentUser = await User.findById(session.user.id);
    const isFollowing = currentUser.following.includes(targetUser._id);

    if (isFollowing) {
      currentUser.following.pull(targetUser._id);
      targetUser.followers.pull(currentUser._id);
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      await Notification.create({
        recipient: targetUser._id,
        sender: currentUser._id,
        type: "follow",
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    return NextResponse.json({
      following: !isFollowing,
      followersCount: targetUser.followers.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}
