import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

function secret() {
  return env.SESSION_SECRET || env.SESSION_PASSWORD || "jojobs-review-token-development-secret";
}

function payload(applicationId: string, employerEmail: string | null | undefined) {
  return `${applicationId}:${(employerEmail ?? "").trim().toLowerCase()}`;
}

export function createApplicationReviewToken(applicationId: string, employerEmail: string | null | undefined) {
  return createHmac("sha256", secret()).update(payload(applicationId, employerEmail)).digest("base64url");
}

export function verifyApplicationReviewToken(applicationId: string, employerEmail: string | null | undefined, token: string | null | undefined) {
  if (!token) return false;
  const expected = createApplicationReviewToken(applicationId, employerEmail);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(token);
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
