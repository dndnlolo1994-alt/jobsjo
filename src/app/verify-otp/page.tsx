import type { Metadata } from "next";
import { Suspense } from "react";
import OtpForm from "@/components/auth/OtpForm";

export const metadata: Metadata = { title: "تأكيد الحساب برمز OTP", robots: { index: false, follow: false } };

export default function VerifyOtpPage() {
  return (
    <section className="container-jo py-12 max-w-xl">
      <Suspense fallback={
        <div className="card-pad text-center text-navy-500 py-10 bg-white border border-slate-100 rounded-2xl">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full"></div>
            <div className="w-40 h-4 bg-slate-100 rounded"></div>
            <div className="w-60 h-3 bg-slate-100 rounded mt-1"></div>
          </div>
        </div>
      }>
        <OtpForm />
      </Suspense>
    </section>
  );
}
