import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import User from "@/models/User";
import Post from "@/models/Post";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(request) {
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const q = searchParams.get("q") || "";
    const filterStatus = searchParams.get("status") || "all";
    
    await connectDB();
    
    // Validate models are loaded
    User.findOne(); 
    Post.findOne();

    const query = {};
    if (filterStatus !== "all") {
      query.status = filterStatus;
    }

    // Since we can't easily $text search populated models generically across disparate structures,
    // we query directly or pull everything. For now, strict fetching maps via Report parameters.
    
    const count = await Report.countDocuments(query);
    const pages = Math.ceil(count / limit);
    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate("reporter", "name username image email")
      .populate("handledBy", "name username")
      // populate the target based on refPath
      .populate("itemId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        pages,
        total: count,
        hasMore: page < pages,
      },
    });
  } catch (e) {
    console.error("Admin GET Reports Error:", e);
    return NextResponse.json({ error: "Failed to load reports" }, { status: 500 });
  }
}
