import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";
import { env } from "./env";

export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "JOB_SEEKER" | "EMPLOYER";
  fullName: string;
};

export type AppSession = {
  user?: SessionUser;
  createdAt?: number;
};

export const sessionOptions: SessionOptions = {
  password: env.SESSION_PASSWORD || "dev-only-please-change-this-secret-32chars",
  cookieName: "jojobs_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
};

export async function getSession(): Promise<AppSession> {
  const store = await cookies();
  try {
    return await getIronSession<AppSession>(store, sessionOptions);
  } catch (err) {
    console.error("[session] Decryption or parse failed. Wiping corrupt session cookie:", err);
    try {
      store.delete("jojobs_session");
      return await getIronSession<AppSession>(store, sessionOptions);
    } catch (retryErr) {
      console.error("[session] Failed to recover iron session:", retryErr);
      return {};
    }
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const s = await getSession();
  return s.user ?? null;
}

export async function destroySession() {
  const s = await getSession();
  // @ts-expect-error iron-session destroy()
  s.destroy?.();
}
