import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { privateMetadata } from "@/lib/seo/site";

export const metadata: Metadata = privateMetadata("تسجيل الدخول", "ادخل إلى حسابك لمتابعة طلباتك أو إدارة وظائف شركتك على جوبز الأردن.");

export default function LoginPage() {
  return (
    <section className="container-jo py-10 max-w-xl">
      <h1 className="section-title text-center mb-2">تسجيل الدخول</h1>
      <p className="section-sub text-center mb-8">ادخل إلى حسابك لمتابعة طلباتك أو إدارة وظائف شركتك.</p>
      <Suspense fallback={
        <div className="card-pad space-y-4 shadow-xl animate-pulse">
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-10 bg-slate-200 rounded-xl" />
          <div className="h-12 bg-emerald-100 rounded-2xl" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </section>
  );
}
