import { NextResponse } from "next/server";
import { aiErrorResponse, ask } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { db, newId } from "@/lib/db";

const depth: Record<string, { effort: "low" | "medium" | "high"; note: string }> = {
  detailed: { effort: "high", note: "a thorough, detailed review" },
  standard: { effort: "medium", note: "a focused review" },
  quick: { effort: "low", note: "a quick, high-impact review" },
};

// Lists the user's past reviews.
export async function GET() {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const reviews = db
    .prepare("SELECT id, source, speed, result, created_at AS createdAt FROM reviews WHERE user_id = ? ORDER BY created_at DESC")
    .all(user.id);
  return NextResponse.json({ reviews });
}

// Reviews a resume's text with AI and saves the result.
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { source, text, speed, notes, preserveFormatting } = await request.json();
  if (typeof text !== "string" || text.trim().length < 50) {
    return NextResponse.json({ error: "There isn't enough text in that resume to review." }, { status: 400 });
  }
  const mode = depth[speed] ?? depth.standard;
  try {
    const result = await ask({
      effort: mode.effort,
      system: `You are an expert resume reviewer and recruiter. Give ${mode.note} in Markdown with these sections:
## Overall score (x/100, one line why)
## What works
## What to fix (ordered by impact, each with a concrete rewrite)
## ATS and keywords
## Rewritten summary
${preserveFormatting ? "The candidate wants to keep their current layout, so suggest wording changes only." : ""}
Be specific to this resume; avoid generic advice.`,
      messages: [{ role: "user", content: `Notes from the candidate: ${notes || "(none)"}\n\nResume:\n${text}` }],
    });
    const review = { id: newId(), source: String(source || "Resume"), speed: String(speed || "standard"), result, createdAt: Date.now() };
    db.prepare("INSERT INTO reviews (id, user_id, source, speed, notes, result, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      review.id,
      user.id,
      review.source,
      review.speed,
      String(notes || ""),
      result,
      review.createdAt,
    );
    return NextResponse.json({ review });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
