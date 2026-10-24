import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Bookmarked samples on the Sample Library page.
export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const rows = db.prepare("SELECT sample_id AS id FROM saved_samples WHERE user_id = ?").all(user.id) as { id: string }[];
  return NextResponse.json({ saved: rows.map((r) => r.id) });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { sampleId, saved } = await request.json();
  if (typeof sampleId !== "string") return NextResponse.json({ error: "Missing sample" }, { status: 400 });
  if (saved) {
    db.prepare("INSERT INTO saved_samples (user_id, sample_id) VALUES (?, ?) ON CONFLICT DO NOTHING").run(user.id, sampleId);
  } else {
    db.prepare("DELETE FROM saved_samples WHERE user_id = ? AND sample_id = ?").run(user.id, sampleId);
  }
  return NextResponse.json({ ok: true });
}
