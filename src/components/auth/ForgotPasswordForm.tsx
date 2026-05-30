"use client";

import { useState } from "react";
import { requestPasswordResetAction } from "@/lib/actions/platform";

export default function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const res = await requestPasswordResetAction(null, new FormData(e.currentTarget));
    setLoading(false);

    if (!res.ok) {
      setError(res.message);
      return;
    }

    setMessage(res.message);
    if (res.redirect) window.location.href = res.redirect;
  }

  return (
    <form onSubmit={handleSubmit} className="card-pad max-w-md mx-auto space-y-4 shadow-xl">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-800 dark:bg-rose-950/35 dark:border-rose-800/60 dark:text-rose-100">{error}</div>}
      {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/35 dark:border-emerald-800/60 dark:text-emerald-100">{message}</div>}

      <div>
        <label className="label font-semibold mb-1">البريد الإلكتروني</label>
        <input
          className="input w-full focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
          name="email"
          type="email"
          placeholder="example@jojobs.local"
          required
          disabled={loading}
        />
      </div>

      <button type="submit" className="btn-primary w-full py-3 font-bold" disabled={loading}>
        {loading ? "جاري إرسال الرمز..." : "إرسال رمز إعادة الضبط"}
      </button>
    </form>
  );
}
