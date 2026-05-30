import fs from "fs";
import os from "os";
import path from "path";
import nodemailer from "nodemailer";
import { Resend } from "resend";

export type NotificationAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};

export type NotificationMessage = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: NotificationAttachment[];
};

export type NotificationSendResult = {
  ok: boolean;
  provider: "resend" | "smtp" | "console";
  messageId?: string;
  error?: string;
};

export type NotificationProvider = {
  send(opts: NotificationMessage): Promise<NotificationSendResult>;
};

class ConsoleProvider implements NotificationProvider {
  async send(opts: NotificationMessage) {
    // In production no email transport is configured here; warn without
    // leaking message contents (e.g. OTP codes) into the logs.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[notify] No email provider configured — message to ${opts.to} ("${opts.subject}") was NOT delivered. Set SMTP_HOST / SMTP_USER / SMTP_PASS to enable email.`
      );
      return { ok: false, provider: "console" as const, error: "NO_EMAIL_PROVIDER_CONFIGURED" };
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
    return { ok: true, provider: "console" as const };
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

  async send(opts: NotificationMessage) {
    const fromAddress = process.env.SMTP_FROM || `"جوبز الأردن" <noreply@jojobs.jo>`;
    try {
      const info = await this.transporter.sendMail({
        from: fromAddress,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
        attachments: opts.attachments,
      });
      console.log(`[SMTP] Email sent successfully to ${opts.to}`);
      return { ok: true, provider: "smtp" as const, messageId: info.messageId };
    } catch (err) {
      console.error(`[SMTP] Failed to send email to ${opts.to}:`, err);
      // Fallback to console provider
      await new ConsoleProvider().send(opts);
      return {
        ok: false,
        provider: "smtp" as const,
        error: err instanceof Error ? err.message : "SMTP_SEND_FAILED",
      };
    }
  }
}

class ResendProvider implements NotificationProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(process.env.RESEND_API_KEY);
  }

  async send(opts: NotificationMessage) {
    const from = process.env.RESEND_FROM || `جوبز الأردن <onboarding@resend.dev>`;
    try {
      const { data, error } = await this.client.emails.send({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html || opts.text || "",
        text: opts.text,
        attachments: opts.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: Buffer.isBuffer(attachment.content) ? attachment.content.toString("base64") : attachment.content,
          contentType: attachment.contentType,
        })),
      });
      if (error) {
        console.error(`[Resend] Failed to send to ${opts.to}:`, error);
        // Fallback so the flow never crashes (no content leaked in prod).
        await new ConsoleProvider().send(opts);
        return {
          ok: false,
          provider: "resend" as const,
          error: error.message ?? "RESEND_SEND_FAILED",
        };
      }
      console.log(`[Resend] Email sent to ${opts.to} (id: ${data?.id ?? "n/a"})`);
      return { ok: true, provider: "resend" as const, messageId: data?.id };
    } catch (err) {
      console.error(`[Resend] Exception sending to ${opts.to}:`, err);
      await new ConsoleProvider().send(opts);
      return {
        ok: false,
        provider: "resend" as const,
        error: err instanceof Error ? err.message : "RESEND_EXCEPTION",
      };
    }
  }
}

// Provider priority: Resend (transactional) > SMTP > Console fallback.
type ProviderKind = "resend" | "smtp" | "console";

function isInternalQaRecipient(email: string) {
  const normalized = email.trim().toLowerCase();
  return /^qa[-\w]*@jordan-job\.shop$/.test(normalized) || /^qa-launch[-\w]*@jordan-job\.shop$/.test(normalized);
}

class QaSafeProvider implements NotificationProvider {
  constructor(private readonly next: NotificationProvider) {}

  async send(opts: NotificationMessage) {
    if (isInternalQaRecipient(opts.to)) {
      console.warn(`[notify] Skipped internal QA recipient ${opts.to} to avoid production bounce emails.`);
      return { ok: true, provider: "console" as const, messageId: "skipped-internal-qa-recipient" };
    }

    return this.next.send(opts);
  }
}

function desiredKind(): ProviderKind {
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) return "smtp";
  return "console";
}

function makeProvider(kind: ProviderKind): NotificationProvider {
  if (kind === "resend") return new ResendProvider();
  if (kind === "smtp") return new SmtpProvider();
  return new ConsoleProvider();
}

let currentKind: ProviderKind = desiredKind();
let provider: NotificationProvider = new QaSafeProvider(makeProvider(currentKind));

export function getNotifier(): NotificationProvider {
  const kind = desiredKind();
  if (kind !== currentKind) {
    currentKind = kind;
    provider = new QaSafeProvider(makeProvider(kind));
  }
  return provider;
}

export function setNotifier(p: NotificationProvider) {
  provider = p;
}
