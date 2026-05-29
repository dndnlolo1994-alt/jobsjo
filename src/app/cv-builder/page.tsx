import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { privateMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privateMetadata("باني السيرة الذاتية", "باني السيرة الذاتية متاح بعد تسجيل الدخول إلى حساب الباحث عن عمل.");

export default function CvBuilderPage() {
  redirect("/me/cv");
}
