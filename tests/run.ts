import assert from "node:assert/strict";
import { normalizeJordanPhone } from "../src/lib/phone";
import { computeMatch } from "../src/lib/matching/job-score";
import { buildJobPostingJsonLd } from "../src/lib/seo/jobposting";
import { jobQualityChecklist } from "../src/lib/search/jobs";

assert.equal(normalizeJordanPhone("0791234567"), "962791234567");
assert.equal(normalizeJordanPhone("+962791234567"), "962791234567");
assert.equal(normalizeJordanPhone("123"), null);

const match = computeMatch(
  { city: "إربد", area: "وسط البلد", jobType: "FULL_TIME", skills: "Excel,مبيعات", experienceLevel: "ENTRY", educationLevel: "HIGH_SCHOOL", salaryMin: 300, salaryMax: 450, requiresDrivingLicense: true, jobCategory: "مبيعات" },
  { city: "إربد", area: "وسط البلد", preferredJobTypes: "FULL_TIME", skills: "Excel,مبيعات", experienceLevel: "ENTRY", educationLevel: "BACHELOR", expectedSalaryMin: 280, expectedSalaryMax: 500, availableImmediately: true, hasDrivingLicense: true, hasCv: true, preferredCategory: "مبيعات" }
);
assert.ok(match.score >= 80);

const schema = buildJobPostingJsonLd({
  slug: "test-job",
  title: "موظف مبيعات",
  description: "وظيفة تجريبية لاختبار البيانات المنظمة.",
  companyNameText: "شركة تجريبية",
  city: "إربد",
  jobType: "FULL_TIME",
  salaryMin: 300,
  salaryMax: 450,
  publishedAt: new Date("2026-01-01"),
  expiresAt: new Date("2026-02-01"),
  status: "PUBLISHED",
});
assert.equal(schema?.["@type"], "JobPosting");

const checklist = jobQualityChecklist({ title: "موظف مبيعات", city: "إربد", companyNameText: "شركة", contactMethod: "INTERNAL_APPLY", requirements: "خبرة بسيطة", expiresAt: new Date(), sourceType: "EMPLOYER_DIRECT" });
assert.equal(checklist.every((x) => x.ok), true);

console.log("All lightweight tests passed.");
