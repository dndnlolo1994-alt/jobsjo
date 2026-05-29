"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an analytics or monitoring service
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <section
      className="min-h-[calc(100svh-4rem)] flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12 px-6"
      dir="rtl"
    >
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 text-3xl">
          ⚠️
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-navy-950">حدث خطأ غير متوقع</h1>
          <p className="text-sm text-navy-600 leading-relaxed">
            نعتذر عن هذا الخلل الفني. لقد تم تسجيل تفاصيل الخطأ تلقائياً للعمل على إصلاحه في أقرب وقت.
          </p>
        </div>

        {error.digest && (
          <div className="text-xs bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-lg text-slate-400 font-mono select-all">
            رمز الخطأ: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 btn-primary py-3 text-sm font-bold shadow-sm"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/"
            className="flex-1 btn-outline py-3 text-sm font-bold border-slate-200 hover:bg-slate-50"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
