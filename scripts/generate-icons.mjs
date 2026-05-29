import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ICONS_DIR = join(ROOT, "public", "icons");
const SVG_PATH = join(ICONS_DIR, "icon.svg");
const MASKABLE_SVG_PATH = join(ICONS_DIR, "maskable.svg");

mkdirSync(ICONS_DIR, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svg = readFileSync(SVG_PATH);

// Check if maskable SVG exists, otherwise use regular icon
let maskableSvg;
try {
  maskableSvg = readFileSync(MASKABLE_SVG_PATH);
} catch {
  maskableSvg = svg; // fallback
}

for (const size of sizes) {
  const outPath = join(ICONS_DIR, `icon-${size}x${size}.png`);
  await sharp(svg).resize(size, size).png().toFile(outPath);
  console.log(`✅ icon-${size}x${size}.png`);
}

// Generate maskable icons (192 and 512)
for (const size of [192, 512]) {
  const outPath = join(ICONS_DIR, `maskable-${size}x${size}.png`);
  await sharp(maskableSvg).resize(size, size).png().toFile(outPath);
  console.log(`✅ maskable-${size}x${size}.png`);
}

// Generate Apple touch icon (180x180)
const applePath = join(ICONS_DIR, "apple-touch-icon.png");
await sharp(svg).resize(180, 180).png().toFile(applePath);
console.log("✅ apple-touch-icon.png");

// Generate favicon (32x32)
const faviconPath = join(ROOT, "public", "favicon.png");
await sharp(svg).resize(32, 32).png().toFile(faviconPath);
console.log("✅ favicon.png");

console.log("\n🎉 All PNG icons generated!");
