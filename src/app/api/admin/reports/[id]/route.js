import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Report from "@/models/Report";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(request, { params }) {
  const { ok, status, session } = await requireAdmin();
  if (!ok) {
    return NextResponse.json({ error: status === 401 ? "Unauthorized" : "Forbidden" }, { status });
  }

  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid report ID format" }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.status || !body.adminAction) {
      return NextResponse.json({ error: "Missing action payload" }, { status: 400 });
    }

    await connectDB();

    const report = await Report.findById(id);
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    report.status = body.status;
    report.adminAction = body.adminAction;
    report.handledBy = session.user.id;

    await report.save();

    return NextResponse.json({ success: true, message: "Report processed successfully" });
  } catch (e) {
    console.error("Admin Process Report Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
