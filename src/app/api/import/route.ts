import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { AiNotConfiguredError, aiErrorResponse, askJson } from "@/lib/ai";
import { requireUser } from "@/lib/auth";
import { emptyResume, type ResumeData } from "@/lib/documents";

const MAX_BYTES = 10 * 1024 * 1024;

async function readText(file: File) {
  const buffer = new Uint8Array(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return value;
  }
  throw new Error("Upload a PDF or DOCX file.");
}

const str = { type: "string" };
const resumeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["fullName", "title", "email", "phone", "location", "links", "summary", "experience", "education", "skills"],
  properties: {
    fullName: str,
    title: str,
    email: str,
    phone: str,
    location: str,
    links: str,
    summary: str,
    skills: str,
    experience: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["role", "company", "location", "start", "end", "bullets"],
        properties: { role: str, company: str, location: str, start: str, end: str, bullets: str },
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["school", "degree", "start", "end", "details"],
        properties: { school: str, degree: str, start: str, end: str, details: str },
      },
    },
  },
};

// Reads text from an uploaded PDF/DOCX. With ?parse=1 (the default) it also
// turns a resume into structured fields, or a letter into its body text.
export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const form = await request.formData();
  const file = form.get("file");
  const type = String(form.get("type") ?? "resume");
  const parse = new URL(request.url).searchParams.get("parse") !== "0";
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a file to upload." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is larger than 10 MB." }, { status: 400 });

  let text: string;
  try {
    text = (await readText(file)).trim();
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Couldn't read that file." }, { status: 400 });
  }
  if (!text) return NextResponse.json({ error: "That file has no readable text (it may be a scanned image)." }, { status: 400 });

  const name = file.name.replace(/\.[^.]+$/, "");
  if (!parse) return NextResponse.json({ name, text, data: {} });
  if (type !== "resume") return NextResponse.json({ name, text, data: { body: text } });

  try {
    const fields = await askJson<Omit<ResumeData, "experienceLevel" | "language" | "targetJob">>({
      system:
        "Extract this resume into the given fields exactly as written. Put each experience's points in bullets, one per line without bullet symbols. Use empty strings for anything missing; never invent details.",
      messages: [{ role: "user", content: text }],
      schema: resumeSchema,
    });
    return NextResponse.json({ name, text, data: { ...emptyResume(), ...fields } });
  } catch (e) {
    // Without AI, keep the import working: put the raw text in the summary to edit by hand.
    if (e instanceof AiNotConfiguredError) {
      return NextResponse.json({ name, text, data: { ...emptyResume(), summary: text.slice(0, 4000) } });
    }
    return aiErrorResponse(e);
  }
}
