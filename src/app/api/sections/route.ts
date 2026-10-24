import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db, newId } from "@/lib/db";
import { docTypes, type DocType } from "@/lib/documents";

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { type, name } = await request.json();
  if (!docTypes.includes(type as DocType) || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Enter a section name" }, { status: 400 });
  }
  const section = { id: newId(), type, name: name.trim().slice(0, 100) };
  db.prepare("INSERT INTO sections (id, user_id, type, name, created_at) VALUES (?, ?, ?, ?, ?)").run(
    section.id,
    user.id,
    type,
    section.name,
    Date.now(),
  );
  return NextResponse.json({ section });
}
