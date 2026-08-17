import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sessionCookie } from "@/lib/auth";

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const supplied = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({ where: { email: String(email).trim().toLowerCase() } });
  if (!user || !verifyPassword(String(password), user.passwordHash)) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { token, userId: user.id, expiresAt } });
  const response = NextResponse.json({ role: user.role });
  response.cookies.set(sessionCookie, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", expires: expiresAt, path: "/" });
  return response;
}
