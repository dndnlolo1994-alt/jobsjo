/**
 * حذف بيانات المنصة من سطر الأوامر (نفس منطق لوحة الأدمن).
 *
 *   npx tsx scripts/purge-platform-data.ts demo
 *   npx tsx scripts/purge-platform-data.ts full
 */
import { createRequire } from "node:module";
createRequire(import.meta.url)("./load-env.cjs");
import {
  getPlatformDataCounts,
  purgeDemoSeedData,
  resetPlatformKeepAdmins,
  getPreservedAdminEmails,
} from "../src/lib/admin/purge-data";

const mode = process.argv[2];

async function main() {
  if (mode !== "demo" && mode !== "full") {
    console.error("Usage: npx tsx scripts/purge-platform-data.ts <demo|full>");
    process.exit(1);
  }

  console.log("Before:", await getPlatformDataCounts());

  const stats =
    mode === "demo" ? await purgeDemoSeedData() : await resetPlatformKeepAdmins();

  console.log("Deleted:", stats);
  if (mode === "full") {
    console.log("Preserved admins:", getPreservedAdminEmails());
  }

  console.log("After:", await getPlatformDataCounts());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
