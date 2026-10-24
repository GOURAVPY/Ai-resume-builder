import { NextResponse } from "next/server";
import type Anthropic from "@anthropic-ai/sdk";
import { aiErrorResponse, askStream } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

const system = `You are the AI Resume Agent inside a resume builder app. You help with resumes, cover letters, job search strategy and interview prep.
Be practical and specific. When the user shares a resume, give concrete improvements (rewritten bullets, missing keywords, structure). Use short headings or lists when they help.`;

// Streams the agent's reply as plain text.
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { messages } = (await request.json()) as { messages: { role: "user" | "assistant"; content: string }[] };
  const clean: Anthropic.Beta.BetaMessageParam[] = (messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-30)
    .map((m) => ({ role: m.role, content: m.content }));
  if (!clean.length || clean[0].role !== "user") return NextResponse.json({ error: "Send a message first" }, { status: 400 });
  try {
    return new Response(askStream({ system, messages: clean, effort: "medium" }), {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
