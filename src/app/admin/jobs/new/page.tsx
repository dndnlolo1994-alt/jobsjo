import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminJobForm } from "@/components/forms/AdminJobForm";

export const metadata: Metadata = { title: "إضافة وظيفة", robots: { index: false, follow: false } };

export default async function NewJobPage() {
  await requireAdmin();
  return <section className="container-jo py-8"><h1 className="section-title">إضافة وظيفة يدوية</h1><p className="section-sub">استخدم هذه الصفحة للوظائف المباشرة أو المنسّقة من مصادر عامة موثوقة.</p><AdminJobForm /></section>;
}
