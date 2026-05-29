import fs from "fs";
import os from "os";
import path from "path";
import nodemailer from "nodemailer";

export type NotificationProvider = {
  send(opts: { to: string; subject: string; html?: string; text?: string }): Promise<void>;
};

class ConsoleProvider implements NotificationProvider {
  async send(opts: { to: string; subject: string; html?: string; text?: string }) {
    // In production no email transport is configured here; warn without
    // leaking message contents (e.g. OTP codes) into the logs.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[notify] No email provider configured — message to ${opts.to} ("${opts.subject}") was NOT delivered. Set SMTP_HOST / SMTP_USER / SMTP_PASS to enable email.`
      );
      return;
    }

    // Development: print the full message and append to a temp outbox file.
    console.log("\n[notify]", JSON.stringify(opts, null, 2));
    try {
      const logFile = path.join(os.tmpdir(), "jojobs_emails_outbox.log");
      const timestamp = new Date().toISOString();
      const logEntry = `\n==================================================\n[${timestamp}] TO: ${opts.to}\nSUBJECT: ${opts.subject}\nTEXT:\n${opts.text || "No text content"}\nHTML:\n${opts.html || "No HTML content"}\n==================================================\n`;
      fs.appendFileSync(logFile, logEntry, "utf8");
    } catch (err) {
      console.error("Failed to write mock email log:", err);
    }
  }
}

class SmtpProvider implements NotificationProvider {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async send(opts: { to: string; subject: string; html?: string; text?: string }) {
    const fromAddress = process.env.SMTP_FROM || `"جوبز الأردن" <noreply@jojobs.jo>`;
    try {
      await this.transporter.sendMail({
        from: fromAddress,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
      });
      console.log(`[SMTP] Email sent successfully to ${opts.to}`);
    } catch (err) {
      console.error(`[SMTP] Failed to send email to ${opts.to}:`, err);
      // Fallback to console provider
      await new ConsoleProvider().send(opts);
    }
  }
}

const useSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
let provider: NotificationProvider = useSmtp ? new SmtpProvider() : new ConsoleProvider();

export function getNotifier(): NotificationProvider {
  const dynamicUseSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (dynamicUseSmtp && !(provider instanceof SmtpProvider)) {
    provider = new SmtpProvider();
  } else if (!dynamicUseSmtp && (provider instanceof SmtpProvider)) {
    provider = new ConsoleProvider();
  }
  return provider;
}

export function setNotifier(p: NotificationProvider) {
  provider = p;
}
