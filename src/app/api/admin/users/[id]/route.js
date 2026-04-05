import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import Notification from "@/models/Notification";
import PendingUser from "@/models/PendingUser";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(request, { params }) {
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(id).select("name username email image bio role provider createdAt");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (e) {
    console.error(`[Admin GET User Error]: ${e.message}`, e);
    return NextResponse.json({ error: "Internal server error while fetching user" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Empty or invalid request body" }, { status: 400 });
    }

    const { name, bio, image, username } = body;

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name !== undefined) {
      const n = String(name).trim();
      if (n.length < 1 || n.length > 50) {
        return NextResponse.json({ error: "Name must be 1–50 characters" }, { status: 400 });
      }
      user.name = n;
    }
    
    if (bio !== undefined) {
      user.bio = String(bio).slice(0, 300);
    }
    
    if (image !== undefined) {
      user.image = String(image).slice(0, 2000);
    }
    
    if (username !== undefined) {
      const u = String(username).trim().toLowerCase();
      if (!/^[a-zA-Z0-9_]+$/.test(u) || u.length < 3 || u.length > 30) {
        return NextResponse.json({ error: "Invalid username format" }, { status: 400 });
      }
      const clash = await User.findOne({ username: u, _id: { $ne: id } });
      if (clash) {
        return NextResponse.json({ error: "Username already taken" }, { status: 400 });
      }
      user.username = u;
    }

    if (body.isBanned !== undefined) {
      user.isBanned = Boolean(body.isBanned);
    }

    await user.save();

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        image: user.image,
        role: user.role,
        isBanned: user.isBanned,
        provider: user.provider,
        createdAt: user.createdAt,
      },
    });
  } catch (e) {
    console.error(`[Admin PATCH User Error]: ${e.message}`, e);
    return NextResponse.json({ error: "Internal server error while updating user" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { ok, status, session } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid user ID format" }, { status: 400 });
    }

    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot restrict your own admin account" }, { status: 400 });
    }

    await connectDB();

    const target = await User.findById(id).select("role isBanned");
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (target.role === "admin") {
      return NextResponse.json(
        { error: "Admin accounts cannot be banned." },
        { status: 403 }
      );
    }

    target.isBanned = !target.isBanned;
    if (target.isBanned) {
      target.banReason = "Banned by Administrator manually.";
      target.banExpiresAt = null; // Infinite duration
    } else {
      target.banReason = null;
      target.banExpiresAt = null;
    }
    await target.save();

    return NextResponse.json({ success: true, message: target.isBanned ? "User restricted successfully." : "User restrictions lifted.", isBanned: target.isBanned });
  } catch (e) {
    console.error(`[Admin DELETE Ban User Error]: ${e.message}`, e);
    return NextResponse.json({ error: "Internal server error while banning user" }, { status: 500 });
  }
}
