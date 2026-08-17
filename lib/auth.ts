import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const sessionCookie = "pathway_session";

export async function getCurrentUser() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { student: true } } }
  });
  if (!session || session.expiresAt <= new Date()) return null;
  return session.user;
}

export async function requireUser(role?: "STUDENT" | "ADMIN") {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(user.role === "ADMIN" ? "/admin" : "/student");
  return user;
}
