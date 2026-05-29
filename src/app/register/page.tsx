import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { privateMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privateMetadata("إنشاء حساب", "أنشئ حساب باحث عن عمل أو صاحب عمل على جوبز الأردن.");

export default function RegisterPage() {
  return (
    <section className="container-jo py-10 max-w-2xl">
      <h1 className="section-title text-center mb-2">إنشاء حساب جديد</h1>
      <p className="section-sub text-center mb-8">اختر نوع الحساب وابدأ باستخدام جوبز الأردن.</p>
      <RegisterForm />
    </section>
  );
}
