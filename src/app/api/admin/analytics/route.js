import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Report from "@/models/Report";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const { ok, status } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    await connectDB();

    // Calculate dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      dates.push(d);
    }

    const today = new Date();
    const sevenDaysAgo = dates[0];

    const generateDailyStats = async (Model) => {
      const result = await Model.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo, $lte: today } } },
        { 
          $group: {
            _id: { 
              year: { $year: "$createdAt" }, 
              month: { $month: "$createdAt" }, 
              day: { $dayOfMonth: "$createdAt" } 
            },
            count: { $sum: 1 }
          }
        }
      ]);

      return dates.map(date => {
        const matchingGroup = result.find(r => 
          r._id.year === date.getFullYear() && 
          r._id.month === (date.getMonth() + 1) && 
          r._id.day === date.getDate()
        );
        return matchingGroup ? matchingGroup.count : 0;
      });
    };

    // Parallel aggregation
    const [userCounts, postCounts, reportCounts] = await Promise.all([
      generateDailyStats(User),
      generateDailyStats(Post),
      generateDailyStats(Report)
    ]);

    // Format output mapping Recharts parameters natively
    const chartData = dates.map((d, index) => ({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      users: userCounts[index],
      posts: postCounts[index],
      reports: reportCounts[index]
    }));

    // Aggregate high-risk leaderboard
    const highRiskUsers = await User.find({ riskScore: { $gte: 4 } })
      .sort({ riskScore: -1 })
      .limit(5)
      .select("name username image riskScore role")
      .lean();

    // Active 24h checks
    const activeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Total aggregate stats logic
    const [totalUsers, totalPosts, pendingReports, activeBans, dailyPosts] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments({ createdAt: { $gte: activeThreshold } })
    ]);

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalPosts,
        pendingReports,
        activeBans,
        dailyPosts
      },
      chartData,
      suspiciousUsers: highRiskUsers
    });

  } catch (e) {
    console.error("Analytics Aggregation Error:", e);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
