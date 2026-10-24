import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

type Row = { id: string; type: string; sectionId: string | null; name: string; data: string; createdAt: number; updatedAt: number };

function findDoc(id: string, userId: string) {
  return db
    .prepare(
      "SELECT id, type, section_id AS sectionId, name, data, created_at AS createdAt, updated_at AS updatedAt FROM documents WHERE id = ? AND user_id = ?",
    )
    .get(id, userId) as Row | undefined;
}

const notFound = () => NextResponse.json({ error: "Document not found" }, { status: 404 });

export async function GET(_request: Request, ctx: RouteContext<"/api/documents/[id]">) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const row = findDoc((await ctx.params).id, user.id);
  if (!row) return notFound();
  return NextResponse.json({ document: { ...row, data: JSON.parse(row.data) } });
}

export async function PATCH(request: Request, ctx: RouteContext<"/api/documents/[id]">) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { id } = await ctx.params;
  const row = findDoc(id, user.id);
  if (!row) return notFound();
  const body = await request.json();
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim().slice(0, 200) : row.name;
  const data = body.data !== undefined ? JSON.stringify(body.data) : row.data;
  const now = Date.now();
  db.prepare("UPDATE documents SET name = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?").run(name, data, now, id, user.id);
  return NextResponse.json({ ok: true, updatedAt: now });
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/documents/[id]">) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  db.prepare("DELETE FROM documents WHERE id = ? AND user_id = ?").run((await ctx.params).id, user.id);
  return NextResponse.json({ ok: true });
}
