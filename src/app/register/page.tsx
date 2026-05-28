import type { Metadata } from "next";
import { registerAction } from "@/lib/actions/platform";

export const metadata: Metadata = { title: "إنشاء حساب", robots: { index: false, follow: false } };

export default function RegisterPage() {
  async function action(formData: FormData) {
    "use server";
    await registerAction(null, formData);
  }

  return (
    <section className="container-jo py-10 max-w-2xl">
      <h1 className="section-title">إنشاء حساب جديد</h1>
      <p className="section-sub">اختر نوع الحساب وابدأ باستخدام جوبز الأردن.</p>
      <form action={action} className="card-pad grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><label className="label">الاسم الكامل</label><input className="input" name="fullName" required /></div>
            <div><label className="label">البريد الإلكتروني</label><input className="input" name="email" type="email" required /></div>
            <div><label className="label">رقم الهاتف</label><input className="input" name="phone" placeholder="0790000000" required /></div>
            <div><label className="label">كلمة المرور</label><input className="input" name="password" type="password" required /></div>
            <div><label className="label">تأكيد كلمة المرور</label><input className="input" name="confirmPassword" type="password" required /></div>
            <div className="sm:col-span-2"><label className="label">نوع الحساب</label><select className="input" name="role"><option value="JOB_SEEKER">باحث عن عمل</option><option value="EMPLOYER">صاحب عمل / شركة</option></select></div>
            <label className="sm:col-span-2 flex gap-2 text-sm text-navy-700"><input name="acceptTerms" type="checkbox" required /> أوافق على الشروط وسياسة الخصوصية</label>
            <button className="btn-primary sm:col-span-2">إنشاء الحساب</button>
      </form>
    </section>
  );
}
