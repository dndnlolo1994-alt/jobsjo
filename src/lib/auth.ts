import "server-only";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSessionUser, type SessionUser } from "./session";
import { env } from "./env";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function isAdminEmail(email: string): boolean {
  return env.ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireRole(
  ...roles: Array<"ADMIN" | "JOB_SEEKER" | "EMPLOYER">
): Promise<SessionUser> {
  const u = await requireUser();
  if (!roles.includes(u.role)) {
    redirect("/");
  }
  return u;
}

export async function requireAdmin(): Promise<SessionUser> {
  return requireRole("ADMIN");
}

export async function requireEmployer(): Promise<SessionUser> {
  return requireRole("EMPLOYER", "ADMIN");
}

export async function requireJobSeeker(): Promise<SessionUser> {
  return requireRole("JOB_SEEKER", "ADMIN");
}

export async function getCurrentUserFull() {
  const sess = await getSessionUser();
  if (!sess) return null;
  return prisma.user.findUnique({
    where: { id: sess.id },
    include: {
      jobSeekerProfile: true,
      employerProfile: { include: { company: true } },
    },
  });
}
