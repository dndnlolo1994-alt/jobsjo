import type { Metadata } from "next";
import { loginAction } from "@/lib/actions/platform";

export const metadata: Metadata = { title: "دخول", robots: { index: false, follow: false } };

export default function LoginPage() {
  async function action(formData: FormData) {
    "use server";
    await loginAction(null, formData);
  }

  return (
    <section className="container-jo py-10 max-w-xl">
      <h1 className="section-title">تسجيل الدخول</h1>
      <p className="section-sub">ادخل إلى حسابك لمتابعة طلباتك أو إدارة وظائف شركتك.</p>
      <form action={action} className="card-pad space-y-4">
        <div><label className="label">البريد الإلكتروني</label><input className="input" name="email" type="email" required /></div>
        <div><label className="label">كلمة المرور</label><input className="input" name="password" type="password" required /></div>
        <button className="btn-primary w-full">دخول</button>
      </form>
    </section>
  );
}
