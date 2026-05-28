import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { StatCard } from "@/components/StatCard";

export const metadata: Metadata = { title: "حسابي", robots: { index: false, follow: false } };

export default async function MePage() {
  const user = await requireJobSeeker();
  const seekerProfile = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } });
  const plan = seekerProfile?.plan || "FREE";

  const [apps, saved, cv] = await Promise.all([
    prisma.application.count({ where: { jobSeekerId: user.id } }),
    prisma.savedJob.count({ where: { userId: user.id } }),
    prisma.cVProfile.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <section className="container-jo py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="section-title mb-1">أهلاً {user.fullName}</h1>
          <p className="text-sm text-navy-500">لوحة التحكم الخاصة بك للوظائف والسيرة الذاتية.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-navy-600 bg-navy-100 px-3 py-1.5 rounded-lg">
            نوع الباقة: {plan === "PLUS" ? "👑 باقة Plus المميزة" : "💼 باقة مجانية"}
          </span>
          {plan === "FREE" && (
            <Link href="/pricing" className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all">
              ترقية الحساب ⚡
            </Link>
          )}
          <form action="/api/auth/logout" method="POST" className="inline-block">
            <button className="text-xs font-bold text-rose-800 bg-rose-50 border border-rose-100 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all">
              خروج
            </button>
          </form>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="طلبات التقديم" value={apps} />
        <StatCard label="وظائف محفوظة" value={saved} />
        <StatCard label="حالة CV" value={cv ? "جاهز ونشط" : "غير مكتمل"} />
      </div>

      {plan === "FREE" && (
        <div className="card-pad mt-6 bg-slate-50 border border-slate-200">
          <h3 className="font-bold text-navy-900 text-sm mb-2">استهلاك التقديم على الوظائف</h3>
          <div className="flex justify-between items-center text-xs text-navy-600 mb-1">
            <span>الحد الأقصى المجاني: {apps} / 5 تقديمات</span>
            <span>{apps >= 5 ? "وصلت للحد الأقصى" : `${5 - apps} تقديمات متبقية`}</span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${apps >= 5 ? "bg-red-500" : apps >= 3 ? "bg-amber-500" : "bg-emerald-500"}`}
              style={{ width: `${Math.min((apps / 5) * 100, 100)}%` }}
            ></div>
          </div>
          {apps >= 5 && (
            <p className="text-xs text-red-600 font-bold mt-2">
              ⚠️ لقد استهلكت جميع التقديمات المجانية المتاحة لك. يرجى الاشتراك في باقة Plus للتقديم غير المحدود!
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Link className="card-pad hover:border-emerald-300 hover:text-emerald-700 text-center font-bold transition-all" href="/jobs">🔍 ابحث عن وظائف</Link>
        <Link className="card-pad hover:border-emerald-300 hover:text-emerald-700 text-center font-bold transition-all" href="/me/cv">📄 سيرتي الذاتية</Link>
        <Link className="card-pad hover:border-emerald-300 hover:text-emerald-700 text-center font-bold transition-all" href="/me/applications">📂 طلبات التقديم</Link>
        <Link className="card-pad hover:border-emerald-300 hover:text-emerald-700 text-center font-bold transition-all" href="/me/billing">💳 الرسوم والفواتير</Link>
      </div>
    </section>
  );
}
