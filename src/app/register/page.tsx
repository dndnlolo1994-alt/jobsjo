import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "إنشاء حساب", robots: { index: false, follow: false } };

export default function RegisterPage() {
  return (
    <section className="container-jo py-10 max-w-2xl">
      <h1 className="section-title text-center mb-2">إنشاء حساب جديد</h1>
      <p className="section-sub text-center mb-8">اختر نوع الحساب وابدأ باستخدام جوبز الأردن.</p>
      <RegisterForm />
    </section>
  );
}

