import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/cheermark/job-store";

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const job = await getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    imageUrl: job.imageUrl,
    error: job.error,
  });
}
