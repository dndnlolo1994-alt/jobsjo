import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "نسيت كلمة المرور",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <section className="container-jo py-10">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h1 className="section-title">نسيت كلمة المرور؟</h1>
        <p className="section-sub">أدخل بريدك الإلكتروني وسننشئ رمز تحقق لإعادة ضبط كلمة المرور.</p>
      </div>
      <ForgotPasswordForm />
    </section>
  );
}
