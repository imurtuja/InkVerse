import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import Post from "@/models/Post";
import User from "@/models/User";

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { itemType, itemId, reason, isAuto } = await req.json();

    if (!itemType || !itemId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (itemType !== "Post" && itemType !== "User") {
      return NextResponse.json({ error: "Invalid itemType" }, { status: 400 });
    }

    await connectDB();

    // Verify Target exists
    if (itemType === "Post") {
      const target = await Post.findById(itemId);
      if (!target) return NextResponse.json({ error: "Target post not found" }, { status: 404 });
    } else {
      const target = await User.findById(itemId);
      if (!target) return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Rate Limiter: Prevent Duplicate Reports from same user on same target
    const existingReport = await Report.findOne({
      reporter: session.user.id,
      itemType,
      itemId,
    });

    if (existingReport) {
      return NextResponse.json({ error: "You have already reported this item." }, { status: 429 });
    }

    // Rate Limiter: Limit to 10 manual reports per user max per 24 hours to prevent spam flagging
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReportsCount = await Report.countDocuments({
      reporter: session.user.id,
      isAuto: false,
      createdAt: { $gte: last24h }
    });

    if (recentReportsCount >= 10 && !isAuto) {
      return NextResponse.json({ error: "You have reached the daily reporting limit. Please try again tomorrow." }, { status: 429 });
    }

    // Create Report
    const report = await Report.create({
      reporter: session.user.id,
      itemType,
      itemId,
      reason,
      status: "pending",
      severity: "low", // baseline for manual
      isAuto: isAuto === true,
    });

    // Update risk score on manual reports (increase by 1)
    if (!isAuto) {
      const targetUserId = itemType === "Post" 
            ? (await Post.findById(itemId).select("author")).author 
            : itemId;
            
      await User.findByIdAndUpdate(targetUserId, {
        $inc: { riskScore: 1 }
      });
    }

    return NextResponse.json({ success: true, message: "Report submitted successfully." });
  } catch (error) {
    console.error("Report submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
