"use client";

import { useState } from "react";
import { resendPasswordResetCodeAction, resetPasswordAction } from "@/lib/actions/platform";
import { PasswordField } from "./PasswordField";

export default function ResetPasswordForm({ email }: { email: string }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const res = await resetPasswordAction(null, new FormData(e.currentTarget));
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setMessage(res.message);
    if (res.redirect) setTimeout(() => (window.location.href = res.redirect!), 700);
  }

  async function handleResend() {
    setMessage("");
    setError("");
    setResending(true);
    const res = await resendPasswordResetCodeAction(email);
    setResending(false);

    if (!res.ok) setError(res.message);
    else setMessage("تم إرسال رمز جديد لإعادة ضبط كلمة المرور.");
  }

  return (
    <form onSubmit={handleSubmit} className="card-pad max-w-md mx-auto space-y-4 shadow-xl border border-navy-100 bg-white">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">{message}</div>}

      <input type="hidden" name="email" value={email} />

      <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-3 text-xs text-navy-700">
        إعادة الضبط للبريد: <strong dir="ltr">{email || "غير محدد"}</strong>
      </div>

      <div>
        <label className="label text-navy-800 font-semibold mb-1">رمز التحقق</label>
        <input
          className="input w-full border-navy-150 text-center text-xl font-extrabold tracking-[0.35em] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          name="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="******"
          required
          disabled={loading}
        />
      </div>

      <div>
        <label className="label text-navy-800 font-semibold mb-1">كلمة المرور الجديدة</label>
        <PasswordField name="password" placeholder="•••••••• (8 أحرف فأكثر)" disabled={loading} autoComplete="new-password" />
      </div>

      <div>
        <label className="label text-navy-800 font-semibold mb-1">تأكيد كلمة المرور</label>
        <PasswordField name="confirmPassword" placeholder="••••••••" disabled={loading} autoComplete="new-password" />
      </div>

      <button type="submit" className="btn-primary w-full py-3 font-bold" disabled={loading || !email}>
        {loading ? "جاري تغيير كلمة المرور..." : "تغيير كلمة المرور"}
      </button>

      <button
        type="button"
        onClick={handleResend}
        className="btn-outline w-full py-3 text-xs font-bold"
        disabled={resending || loading || !email}
      >
        {resending ? "جاري إعادة الإرسال..." : "إعادة إرسال الرمز"}
      </button>
    </form>
  );
}
