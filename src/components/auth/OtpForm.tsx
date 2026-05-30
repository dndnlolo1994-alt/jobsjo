"use client";

import { useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtpAction, resendOtpAction } from "@/lib/actions/platform";

export default function OtpForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resending, setResending] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (code.trim().length !== 6) {
      setError("الرجاء إدخال رمز صحيح مكون من 6 أرقام.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await verifyOtpAction(email, code);
        if (res.ok) {
          setSuccess(res.message);
          setTimeout(() => {
            if (res.redirect) {
              window.location.href = res.redirect;
            }
          }, 800);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("حدث خطأ غير متوقع أثناء التحقق. الرجاء المحاولة مرة أخرى.");
        console.error(err);
      }
    });
  }

  async function handleResend() {
    if (resending) return;
    setError(null);
    setSuccess(null);
    setResending(true);

    try {
      const res = await resendOtpAction(email);
      if (res.ok) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("فشل إعادة إرسال الرمز. الرجاء المحاولة لاحقاً.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="card-pad max-w-md mx-auto shadow-xl text-right">
      <div className="text-center mb-6">
        <span className="text-4xl block mb-2">✉️</span>
        <h2 className="text-xl font-extrabold text-[color:var(--text)]">تأكيد البريد الإلكتروني</h2>
        <p className="text-xs text-[color:var(--muted)] mt-2 leading-relaxed">
          لقد أرسلنا رمز تحقق مؤقت (OTP) إلى البريد الإلكتروني:
          <strong className="block text-[color:var(--text)] mt-1 font-bold break-all">{email || "بريدك الإلكتروني"}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/35 dark:border-rose-800/60 dark:text-rose-100 text-xs p-3 rounded-xl mb-4 animate-shake leading-relaxed">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/35 dark:border-emerald-800/60 dark:text-emerald-100 text-xs p-3 rounded-xl mb-4 leading-relaxed font-bold">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="label font-bold mb-2 block text-sm">رمز التحقق (6 أرقام)</label>
          <input
            className="input w-full text-center text-xl font-extrabold tracking-[0.4em] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 placeholder:tracking-normal placeholder:font-normal"
            name="code"
            type="text"
            maxLength={6}
            placeholder="******"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            disabled={isPending}
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold hover:scale-[1.01] active:scale-[0.99] transition-transform"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>جاري التحقق وتفعيل الحساب...</span>
            </>
          ) : (
            <span>تأكيد الرمز وتفعيل الحساب</span>
          )}
        </button>
      </form>

      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-[color:var(--muted)]">لم يصلك الرمز؟</span>
        <button
          onClick={handleResend}
          disabled={resending || isPending}
          className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-300 dark:hover:text-emerald-200 font-bold hover:underline transition-all disabled:text-slate-400"
        >
          {resending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
        </button>
      </div>

      {/* Developer Helper Hint Box */}
      <div className="bg-amber-50/70 border border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/50 p-3 rounded-xl mt-6 text-right">
        <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-100 block">⚙️ تلميح بيئة التطوير (Developer Hint):</span>
        <p className="text-[11px] text-amber-700 dark:text-amber-200 mt-1 leading-relaxed">
          نظراً لأن تفعيل إرسال البريد SMTP قيد التجهيز، فإن رمز الـ **OTP** مطبوع بخط عريض وواضح في **لوحة تشغيل الخادم (Server Console / Terminal)**. يمكنك نسخه وإدخاله فوراً لتجربة سير العمل.
        </p>
      </div>
    </div>
  );
}
