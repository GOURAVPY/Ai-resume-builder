import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db, newId } from "@/lib/db";
import { docTypes, emptyLetter, emptyResume, type DocType } from "@/lib/documents";

const summaryColumns = "id, type, section_id AS sectionId, name, created_at AS createdAt, updated_at AS updatedAt";

// Lists the user's documents and sections for one tab of the dashboard.
export async function GET(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const type = new URL(request.url).searchParams.get("type") ?? "resume";
  const documents = db
    .prepare(`SELECT ${summaryColumns} FROM documents WHERE user_id = ? AND type = ? ORDER BY created_at DESC`)
    .all(user.id, type);
  const sections = db
    .prepare("SELECT id, type, name FROM sections WHERE user_id = ? AND type = ? ORDER BY created_at")
    .all(user.id, type);
  return NextResponse.json({ documents, sections });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const body = await request.json();
  const type = body.type as DocType;
  if (!docTypes.includes(type)) return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 200) : "Untitled";
  const data = { ...(type === "resume" ? emptyResume() : emptyLetter()), ...(body.data ?? {}) };
  const now = Date.now();
  const id = newId();
  db.prepare(
    "INSERT INTO documents (id, user_id, type, section_id, name, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).run(id, user.id, type, body.sectionId ?? null, name, JSON.stringify(data), now, now);
  return NextResponse.json({ document: { id, type, sectionId: body.sectionId ?? null, name, createdAt: now, updatedAt: now, data } });
}
