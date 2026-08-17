import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sessionCookie } from "@/lib/auth";

export async function POST() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (token) await prisma.session.deleteMany({ where: { token } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookie, "", { expires: new Date(0), path: "/" });
  return response;
}
