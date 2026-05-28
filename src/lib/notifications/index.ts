import fs from "fs";
import path from "path";

export type NotificationProvider = {
  send(opts: { to: string; subject: string; html?: string; text?: string }): Promise<void>;
};

class ConsoleProvider implements NotificationProvider {
  async send(opts: { to: string; subject: string; html?: string; text?: string }) {
    console.log("\n[notify]", JSON.stringify(opts, null, 2));
    
    try {
      const workspaceDir = "c:\\Users\\m4ah4\\Desktop\\اردن وظائف\\jojobs-os";
      const scratchDir = path.join(workspaceDir, "scratch");
      
      if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
      }
      
      const logFile = path.join(scratchDir, "emails_outbox.log");
      const timestamp = new Date().toISOString();
      const logEntry = `\n==================================================\n[${timestamp}] TO: ${opts.to}\nSUBJECT: ${opts.subject}\nTEXT:\n${opts.text || "No text content"}\nHTML:\n${opts.html || "No HTML content"}\n==================================================\n`;
      
      fs.appendFileSync(logFile, logEntry, "utf8");
    } catch (err) {
      console.error("Failed to write mock email log:", err);
    }
  }
}

let provider: NotificationProvider = new ConsoleProvider();

export function getNotifier(): NotificationProvider {
  return provider;
}

export function setNotifier(p: NotificationProvider) {
  provider = p;
}
