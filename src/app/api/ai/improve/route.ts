import { NextResponse } from "next/server";
import { aiErrorResponse, ask } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

const instructions = {
  summary:
    "Write a 2–4 sentence professional resume summary. Use concrete skills and outcomes from the context; never invent employers, numbers or credentials that aren't given.",
  bullets:
    "Rewrite the work experience as 3–6 strong resume bullet points, one per line, no bullet symbols. Start each with an action verb and keep any real numbers. If the input is empty, write generic points for the role without invented numbers.",
};

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { kind, text, context } = await request.json();
  if (kind !== "summary" && kind !== "bullets") return NextResponse.json({ error: "Unknown request" }, { status: 400 });

  const details = Object.entries(context ?? {})
    .filter(([, v]) => typeof v === "string" && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  try {
    const result = await ask({
      system: `You are an expert resume writer. ${instructions[kind as keyof typeof instructions]} If a target job is given, tailor the wording to it. Reply with only the finished text, no preamble or quotes.`,
      messages: [{ role: "user", content: `Context:\n${details || "(none)"}\n\nCurrent text:\n${text || "(empty)"}` }],
    });
    return NextResponse.json({ text: result });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
