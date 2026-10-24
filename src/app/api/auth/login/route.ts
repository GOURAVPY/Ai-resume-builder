import { NextResponse } from "next/server";
import { findUserByEmail, startSession, verifyPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = typeof email === "string" ? findUserByEmail(email) : undefined;
  if (!user || typeof password !== "string" || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: "Email or password is incorrect" }, { status: 401 });
  }
  await startSession(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
}
