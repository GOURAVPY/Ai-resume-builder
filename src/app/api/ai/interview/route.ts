import { NextResponse } from "next/server";
import { aiErrorResponse, askJson } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

// action "questions": interview questions from a resume and job description.
// action "feedback": scores one answer and suggests improvements.
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  try {
    if (body.action === "questions") {
      const result = await askJson<{ questions: string[] }>({
        system:
          "You are an experienced interviewer. Write 6 interview questions for this candidate and job: a mix of background, behavioural (STAR) and role-specific technical questions, each grounded in the resume or job description.",
        messages: [{ role: "user", content: `Resume:\n${body.resume || "(not given)"}\n\nJob description:\n${body.job || "(not given)"}` }],
        schema: {
          type: "object",
          properties: { questions: { type: "array", items: { type: "string" } } },
          required: ["questions"],
          additionalProperties: false,
        },
      });
      return NextResponse.json(result);
    }
    if (body.action === "feedback") {
      const result = await askJson<{ score: number; strengths: string; improvements: string; betterAnswer: string }>({
        system:
          "You are an interview coach. Give honest, encouraging feedback on the candidate's answer. Score it from 1 to 10. Keep each field to 2–4 sentences; betterAnswer is a stronger version of their answer in first person, using only facts from their answer or resume.",
        messages: [
          {
            role: "user",
            content: `Job description:\n${body.job || "(not given)"}\n\nResume:\n${body.resume || "(not given)"}\n\nQuestion: ${body.question}\n\nAnswer: ${body.answer || "(no answer)"}`,
          },
        ],
        schema: {
          type: "object",
          properties: {
            score: { type: "integer" },
            strengths: { type: "string" },
            improvements: { type: "string" },
            betterAnswer: { type: "string" },
          },
          required: ["score", "strengths", "improvements", "betterAnswer"],
          additionalProperties: false,
        },
      });
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown request" }, { status: 400 });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
