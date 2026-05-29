/**
 * Pre-deploy email delivery test.
 *
 * Usage:
 *   1. Add RESEND_API_KEY (and optionally RESEND_FROM) to .env
 *   2. npm run test:email -- you@example.com
 *
 * It uses the SAME getNotifier() the app uses, so a successful send here
 * proves production email will work once the same env vars are set on Vercel.
 */
import "dotenv/config";
import { getNotifier } from "../src/lib/notifications";

async function main() {
  const to = process.argv[2];
  if (!to) {
    console.error("Usage: npm run test:email -- you@example.com");
    process.exit(1);
  }

  const kind = process.env.RESEND_API_KEY
    ? "Resend"
    : process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
      ? "SMTP"
      : "Console (no real provider configured)";

  console.log(`[test:email] Provider selected from env: ${kind}`);
  console.log(`[test:email] From: ${process.env.RESEND_FROM || process.env.SMTP_FROM || "(provider default)"}`);
  console.log(`[test:email] Sending test email to: ${to} ...`);

  if (kind.startsWith("Console")) {
    console.warn(
      "[test:email] No RESEND_API_KEY / SMTP_* found in .env — this will NOT send a real email. Add credentials and retry."
    );
  }

  await getNotifier().send({
    to,
    subject: "اختبار البريد — جوبز الأردن | JoJobs email test",
    html: `<div dir="rtl" style="font-family: Arial, sans-serif; padding:16px; color:#0f172a;">
      <h2 style="color:#059669;">✅ يعمل البريد بنجاح</h2>
      <p>هذه رسالة اختبار من منصة <strong>جوبز الأردن</strong>. إذا وصلتك هذه الرسالة فإن إعداد مزوّد البريد صحيح وجاهز للإنتاج.</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;"/>
      <p style="color:#64748b; font-size:13px;">This is a JoJobs email-delivery test. If you received it, your email provider configuration works.</p>
    </div>`,
    text: "رسالة اختبار من جوبز الأردن — إذا وصلتك فإعداد البريد يعمل بنجاح. (JoJobs email delivery test)",
  });

  console.log(`[test:email] Done. If the provider was Resend/SMTP, check the inbox (and spam) of ${to}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("[test:email] FAILED:", err);
  process.exit(1);
});
