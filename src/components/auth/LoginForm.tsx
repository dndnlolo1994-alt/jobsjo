"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/platform";
import { PasswordField } from "./PasswordField";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      const res = await loginAction(null, formData);
      if (res && !res.ok) {
        setError(res.message ?? "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }
      if (res?.ok) {
        const requestedRedirect = searchParams.get("redirect");
        const safeRedirect = requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
          ? requestedRedirect
          : null;
        router.push(safeRedirect || res.redirect || "/me");
      }
    } catch (err: any) {
      setError("حدث خطأ غير متوقع أثناء تسجيل الدخول. الرجاء التحقق من البيانات.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-pad space-y-4 shadow-xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded-xl flex items-start gap-2 animate-shake">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-bold">فشل تسجيل الدخول</h4>
            <p className="text-xs mt-1 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
      
      <div>
        <label className="label text-navy-800 font-semibold mb-1">البريد الإلكتروني</label>
        <div className="relative">
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-navy-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
            </svg>
          </span>
          <input 
            className="input pr-10 border-navy-150 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 w-full" 
            name="email" 
            type="email" 
            placeholder="info@jordan-job.shop" 
            required 
            disabled={loading}
          />
        </div>
        <p className="mt-1.5 text-[11px] font-semibold text-navy-500">
          للدخول إلى لوحة التحكم استخدم بريد الأدمن الكامل، وليس كلمة admin فقط.
        </p>
      </div>
      
      <div>
        <div className="flex items-center justify-between gap-3 mb-1">
          <label className="label text-navy-800 font-semibold mb-0">كلمة المرور</label>
          <Link href="/forgot-password" className="text-xs font-bold text-emerald-700 hover:text-emerald-600">
            نسيت كلمة المرور؟
          </Link>
        </div>
        <PasswordField name="password" placeholder="••••••••" disabled={loading} autoComplete="current-password" />
      </div>
      
      <button 
        type="submit" 
        className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform"
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>جاري التحقق...</span>
          </>
        ) : (
          <span>تسجيل الدخول</span>
        )}
      </button>
    </form>
  );
}
