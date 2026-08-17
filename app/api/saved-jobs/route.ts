import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { studentId, jobId } = await request.json();
  await prisma.savedJob.upsert({ where: { studentId_jobId: { studentId, jobId } }, update: {}, create: { studentId, jobId } });
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const { studentId, jobId } = await request.json();
  await prisma.savedJob.deleteMany({ where: { studentId, jobId } });
  return NextResponse.json({ saved: false });
}
