/**
 * Loads env the same way as Next.js locally:
 * .env first, then .env.local overrides (single source of truth: .env.local).
 */
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
for (const file of [".env", ".env.local"]) {
  const fullPath = path.join(root, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: true });
  }
}
