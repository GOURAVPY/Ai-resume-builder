import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Saved / applied state for jobs on the Job Search page.
export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const rows = db.prepare("SELECT job_id AS jobId, saved, status FROM job_status WHERE user_id = ?").all(user.id) as {
    jobId: string;
    saved: number;
    status: string | null;
  }[];
  return NextResponse.json({
    saved: rows.filter((r) => r.saved).map((r) => r.jobId),
    applied: rows.filter((r) => r.status === "applied").map((r) => r.jobId),
  });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { jobId, saved, status } = await request.json();
  if (typeof jobId !== "string") return NextResponse.json({ error: "Missing job" }, { status: 400 });
  db.prepare("INSERT INTO job_status (user_id, job_id) VALUES (?, ?) ON CONFLICT DO NOTHING").run(user.id, jobId);
  if (typeof saved === "boolean") {
    db.prepare("UPDATE job_status SET saved = ? WHERE user_id = ? AND job_id = ?").run(saved ? 1 : 0, user.id, jobId);
  }
  if (typeof status === "string") {
    db.prepare("UPDATE job_status SET status = ? WHERE user_id = ? AND job_id = ?").run(status, user.id, jobId);
  }
  return NextResponse.json({ ok: true });
}
