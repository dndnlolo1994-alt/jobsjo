import "server-only";
import bcrypt from "bcryptjs";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getSessionUser, getSession, destroySession, type SessionUser } from "./session";
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

export const getCachedSessionUser = cache(getSessionUser);

const sessionUserExists = cache(async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
});

export async function requireUser(): Promise<SessionUser> {
  const u = await getCachedSessionUser();
  if (!u) redirect("/login");

  const userExists = await sessionUserExists(u.id);

  if (!userExists) {
    try {
      await destroySession();
    } catch (err) {
      console.error("[auth] Failed to destroy stale session:", err);
    }
    redirect("/login");
  }

  return u;
}

export async function requireRole(
  ...roles: Array<"ADMIN" | "JOB_SEEKER" | "EMPLOYER">
): Promise<SessionUser> {
  const u = await requireUser();
  
  // Bulletproof promote-to-admin:
  if (isAdminEmail(u.email) && u.role !== "ADMIN") {
    try {
      await prisma.user.update({
        where: { id: u.id },
        data: { role: "ADMIN" },
      });
      const session = await getSession();
      if (session.user) {
        session.user.role = "ADMIN";
        await (session as any).save();
      }
      u.role = "ADMIN";
    } catch (err) {
      console.error("[auth] Failed to auto-promote user to ADMIN:", err);
    }
  }

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
  const sess = await getCachedSessionUser();
  if (!sess) return null;
  
  if (isAdminEmail(sess.email) && sess.role !== "ADMIN") {
    try {
      await prisma.user.update({
        where: { id: sess.id },
        data: { role: "ADMIN" },
      });
      const session = await getSession();
      if (session.user) {
        session.user.role = "ADMIN";
        await (session as any).save();
      }
      sess.role = "ADMIN";
    } catch (err) {
      console.error("[auth] Failed to auto-promote user in getCurrentUserFull:", err);
    }
  }

  return prisma.user.findUnique({
    where: { id: sess.id },
    include: {
      jobSeekerProfile: true,
      employerProfile: { include: { company: true } },
    },
  });
}

