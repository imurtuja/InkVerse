import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, image } = body;
    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ("role" in body) {
      return NextResponse.json({ error: "Role cannot be changed here" }, { status: 403 });
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (image !== undefined) user.image = image;

    await user.save();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("PUT API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
