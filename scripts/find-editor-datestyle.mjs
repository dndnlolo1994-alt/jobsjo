import fs from "fs";
import path from "path";

const dir = "./src/components/cv";
const files = fs.readdirSync(dir);

console.log("Searching for Intl/DateTimeFormat/dateStyle in src/components/cv/...");
for (const file of files) {
  const fullPath = path.join(dir, file);
  if (fs.statSync(fullPath).isFile()) {
    const content = fs.readFileSync(fullPath, "utf-8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("DateTimeFormat") || line.includes("dateStyle") || line.includes("toLocaleDateString") || line.includes("Intl.")) {
        console.log(`${file} Line ${idx + 1}: ${line.trim()}`);
      }
    });
  }
}
console.log("Done.");
