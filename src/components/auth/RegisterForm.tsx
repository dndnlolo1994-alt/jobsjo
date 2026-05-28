"use client";

import { useState } from "react";
import { registerAction } from "@/lib/actions/platform";
import { PasswordField } from "./PasswordField";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Quick client-side check
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      setLoading(false);
      return;
    }

    try {
      const res = await registerAction(null, formData);
      if (res && !res.ok) {
        setError(res.message);
      }
    } catch (err: any) {
      if (err.digest?.startsWith("NEXT_REDIRECT") || err.message === "NEXT_REDIRECT") {
        throw err;
      }
      setError("حدث خطأ غير متوقع أثناء إنشاء الحساب. الرجاء التحقق من المدخلات.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-pad grid sm:grid-cols-2 gap-4 shadow-xl border border-navy-100 bg-white">
      {error && (
        <div className="sm:col-span-2 bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl flex items-start gap-2 animate-shake">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-bold">فشل إنشاء الحساب</h4>
            <p className="text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
      
      <div className="sm:col-span-2">
        <label className="label text-navy-800 font-semibold mb-1">الاسم الكامل</label>
        <input 
          className="input w-full border-navy-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" 
          name="fullName" 
          type="text" 
          placeholder="مثال: أحمد عبد الله" 
          required 
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="label text-navy-800 font-semibold mb-1">البريد الإلكتروني</label>
        <input 
          className="input w-full border-navy-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" 
          name="email" 
          type="email" 
          placeholder="name@example.com" 
          required 
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="label text-navy-800 font-semibold mb-1">رقم الهاتف</label>
        <input 
          className="input w-full border-navy-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" 
          name="phone" 
          type="tel" 
          placeholder="0790000000" 
          required 
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="label text-navy-800 font-semibold mb-1">كلمة المرور</label>
        <PasswordField name="password" placeholder="•••••••• (8 أحرف فأكثر)" disabled={loading} autoComplete="new-password" />
      </div>
      
      <div>
        <label className="label text-navy-800 font-semibold mb-1">تأكيد كلمة المرور</label>
        <PasswordField name="confirmPassword" placeholder="••••••••" disabled={loading} autoComplete="new-password" />
      </div>
      
      <div className="sm:col-span-2">
        <label className="label text-navy-800 font-semibold mb-1">نوع الحساب</label>
        <select 
          className="input w-full border-navy-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 bg-white" 
          name="role" 
          disabled={loading}
        >
          <option value="JOB_SEEKER">باحث عن عمل (إنشاء سيرة ذاتية والتقديم للوظائف)</option>
          <option value="EMPLOYER">صاحب عمل / شركة (نشر وظائف وإدارة المتقدمين)</option>
        </select>
      </div>
      
      <label className="sm:col-span-2 flex items-center gap-2 text-sm text-navy-700 select-none">
        <input 
          name="acceptTerms" 
          type="checkbox" 
          value="on"
          required 
          className="rounded border-navy-300 text-emerald-600 focus:ring-emerald-500"
          disabled={loading}
        /> 
        <span>أوافق على الشروط وسياسة الخصوصية لمنصة وظائف الأردن</span>
      </label>
      
      <button 
        type="submit" 
        className="btn-primary sm:col-span-2 py-3 flex items-center justify-center gap-2 font-bold hover:scale-[1.005] active:scale-[0.995] transition-transform"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>جاري إنشاء الحساب...</span>
          </>
        ) : (
          <span>إنشاء حساب جديد</span>
        )}
      </button>
    </form>
  );
}
