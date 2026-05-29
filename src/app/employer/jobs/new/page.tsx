import type { Metadata } from "next";
import { requireEmployer } from "@/lib/auth";
import { AdminJobForm } from "@/components/forms/AdminJobForm";
export const metadata: Metadata = { title: "نشر وظيفة", robots: { index: false, follow: false } };
export default async function Page(){ await requireEmployer(); return <section className="container-jo py-8"><h1 className="section-title">نشر وظيفة</h1><p className="section-sub">في هذه النسخة ترسل الوظيفة للمراجعة اليدوية. عرض الإطلاق: رسوم النشر تبدأ من 5 دنانير بدلاً من 8.</p><AdminJobForm /></section>; }
