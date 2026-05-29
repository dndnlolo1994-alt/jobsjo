/**
 * يلتقط لقطة من /cv/sample (قالب CvPreview الحقيقي) ويحفظها في public/cv-mockup.png
 * التشغيل: node scripts/capture-cv-mockup.mjs [baseUrl]
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "public", "cv-mockup.png");
const baseUrl = process.argv[2] || "http://127.0.0.1:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  });

  await page.goto(`${baseUrl}/cv/sample`, { waitUntil: "networkidle", timeout: 120_000 });
  await page.waitForSelector(".cv-print", { timeout: 60_000 });
  await page.waitForTimeout(1500);

  const cv = page.locator(".cv-print").first();
  await mkdir(path.dirname(outPath), { recursive: true });
  await cv.screenshot({ path: outPath, type: "png" });

  await browser.close();
  console.log(`Saved CV mockup → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
