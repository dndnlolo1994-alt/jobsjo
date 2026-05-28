import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "إعادة ضبط كلمة المرور",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const sp = await searchParams;
  const email = sp.email || "";

  return (
    <section className="container-jo py-10">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h1 className="section-title">إعادة ضبط كلمة المرور</h1>
        <p className="section-sub">أدخل رمز التحقق وكلمة المرور الجديدة. يمكنك طلب رمز جديد إذا انتهت صلاحيته أو نسيته.</p>
      </div>
      <ResetPasswordForm email={email} />
    </section>
  );
}
