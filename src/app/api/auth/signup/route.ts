import { NextResponse } from "next/server";
import { createUser, findUserByEmail, startSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  }
  if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (findUserByEmail(email)) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }
  const user = createUser(email, name.trim(), password);
  await startSession(user.id);
  return NextResponse.json({ user });
}
