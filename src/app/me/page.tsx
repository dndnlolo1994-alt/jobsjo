import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireJobSeeker } from "@/lib/auth";
import { 
  Search, 
  FileText, 
  History, 
  KanbanSquare, 
  SlidersHorizontal, 
  CreditCard,
  Crown,
  LogOut,
  User,
  Sparkles,
  ChevronLeft
} from "lucide-react";

export const metadata: Metadata = { 
  title: "لوحة التحكم الشخصية", 
  robots: { index: false, follow: false } 
};

export default async function MePage() {
  const user = await requireJobSeeker();
  const seekerProfile = await prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } });
  const plan = seekerProfile?.plan || "FREE";

  const [apps, saved, cv] = await Promise.all([
    prisma.application.count({ where: { jobSeekerId: user.id } }),
    prisma.savedJob.count({ where: { userId: user.id } }),
    prisma.cVProfile.findUnique({ where: { userId: user.id } }),
  ]);

  // Initials for avatar
  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")
    : "ح";

  return (
    <section className="container-jo py-8 pb-20">
      {/* 1. Header Profile Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-navy-150 bg-[linear-gradient(135deg,#0a192f_0%,#112240_50%,#020c1b_100%)] p-6 shadow-xl mb-8 text-white">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_15%_15%,rgba(16,185,129,0.22),transparent_16rem),radial-gradient(circle_at_80%_80%,rgba(209,179,111,0.15),transparent_16rem)]" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-l from-emerald-500 via-amber-300 to-transparent" />
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 z-10">
          <div className="flex items-center gap-4">
            {/* Round Initials Avatar */}
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-xl font-extrabold text-white shadow-lg border border-white/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> لوحة التحكم الشخصية
                </span>
              </div>
              <h1 className="text-2xl font-extrabold mt-1 tracking-tight">أهلاً بك، {user.fullName}</h1>
              <p className="text-navy-200 text-xs mt-0.5 opacity-90">{user.email}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Plan Badge */}
            {plan === "PLUS" ? (
              <span className="inline-flex items-center gap-1 text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-navy-950 px-3.5 py-2 rounded-xl shadow-md border border-amber-300/30">
                <Crown className="h-3.5 w-3.5 fill-navy-950" /> باقة Plus المميزة
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/10 text-white/90 px-3 py-2 rounded-xl border border-white/10">
                💼 باقة الباحث المجانية
              </span>
            )}

            {plan === "FREE" && (
              <Link href="/pricing" className="inline-flex items-center gap-1 text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl shadow-md transition-all">
                ترقية الحساب ⚡
              </Link>
            )}

            <form action="/api/auth/logout" method="POST" className="inline-block">
              <button className="inline-flex items-center gap-1 text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3.5 py-2 rounded-xl transition-all">
                <LogOut className="h-3.5 w-3.5" /> تسجيل الخروج
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        <div className="space-y-6">
          {/* 2. Stat Cards Grid (Styled to look very clean and professional) */}
          <div>
            <h2 className="text-sm font-extrabold text-navy-950 mb-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span> إحصائيات عامة
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest block">طلبات التقديم</span>
                <span className="text-3xl font-black text-navy-900 block mt-1">{apps}</span>
                <span className="text-[11px] text-emerald-700 font-semibold block mt-1 bg-emerald-50 px-2 py-0.5 rounded-md w-max">طلب مكتمل</span>
              </div>
              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest block">الوظائف المفضلة</span>
                <span className="text-3xl font-black text-navy-900 block mt-1">{saved}</span>
                <span className="text-[11px] text-indigo-700 font-semibold block mt-1 bg-indigo-50 px-2 py-0.5 rounded-md w-max">وظيفة محفوظة</span>
              </div>
              <div className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
                <span className="text-[10px] font-bold text-navy-400 uppercase tracking-widest block">السيرة الذاتية PDF</span>
                <span className="text-3xl font-black text-navy-900 block mt-1">{cv ? "جاهزة" : "غير منشأة"}</span>
                <span className={`text-[11px] font-semibold block mt-1 px-2 py-0.5 rounded-md w-max ${cv ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                  {cv ? "نشطة وعامة" : "يرجى تعبئتها"}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Redesigned Action Items: Dashboard Icons for clear identity */}
          <div>
            <h2 className="text-sm font-extrabold text-navy-950 mb-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span> إجراءات حسابي السريعة
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link 
                href="/jobs" 
                className="flex items-center justify-between p-4 rounded-2xl border border-navy-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100/70">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-900">البحث عن وظائف</h3>
                    <p className="text-[11px] text-navy-500 mt-0.5">تصفح أحدث الفرص الحقيقية في الأردن</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-navy-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </Link>

              <Link 
                href="/me/cv" 
                className="flex items-center justify-between p-4 rounded-2xl border border-navy-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100/70">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-900">تعديل وبناء السيرة الذاتية</h3>
                    <p className="text-[11px] text-navy-500 mt-0.5">بياناتك، مهاراتك وتنزيل الـ PDF المنسق</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-navy-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </Link>

              <Link 
                href="/me/applications" 
                className="flex items-center justify-between p-4 rounded-2xl border border-navy-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100/70">
                    <History className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-900">طلبات التقديم السابقة</h3>
                    <p className="text-[11px] text-navy-500 mt-0.5">سجل كامل بطلباتك والشركات المقدم لها</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-navy-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </Link>

              <Link 
                href="/me/applications/board" 
                className="flex items-center justify-between p-4 rounded-2xl border border-navy-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100/70">
                    <KanbanSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-900">لوحة تتبع التوظيف (Board)</h3>
                    <p className="text-[11px] text-navy-500 mt-0.5">تابع حالات طلباتك وتغيّرها التفاعلي</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-navy-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </Link>

              <Link 
                href="/me/saved-searches" 
                className="flex items-center justify-between p-4 rounded-2xl border border-navy-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100/70">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-900">البحوث والتنبيهات المحفوظة</h3>
                    <p className="text-[11px] text-navy-500 mt-0.5">إدارة إشعارات الوظائف الجديدة لبريدك</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-navy-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </Link>

              <Link 
                href="/me/billing" 
                className="flex items-center justify-between p-4 rounded-2xl border border-navy-100 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100/70">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-navy-900">إدارة الاشتراكات والفواتير</h3>
                    <p className="text-[11px] text-navy-500 mt-0.5">عرض الفواتير، التحقق من الدفع، والرسوم</p>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-navy-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right column sidebar */}
        <aside className="space-y-4">
          {/* 4. Detailed Usage Tracker */}
          {plan === "FREE" && (
            <div className="rounded-3xl border border-navy-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📊</span>
                <h3 className="font-extrabold text-navy-900 text-sm">حد التقديم المجاني للوظائف</h3>
              </div>
              <p className="text-xs text-navy-500 leading-relaxed mb-3">
                تمنحك الخطة المجانية 5 طلبات تقديم للمحاولة وفحص جودة النظام.
              </p>
              
              <div className="flex justify-between items-center text-xs font-bold text-navy-600 mb-1.5">
                <span>{apps} / 5 تقديمات مستهلكة</span>
                <span>{apps >= 5 ? "منتهية" : `${5 - apps} متبقية`}</span>
              </div>
              
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-50">
                <div 
                  className={`h-full transition-all duration-500 ${apps >= 5 ? "bg-red-500" : apps >= 3 ? "bg-amber-400" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min((apps / 5) * 100, 100)}%` }}
                ></div>
              </div>

              {apps >= 5 ? (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-2xl text-red-800 text-[11px] font-bold leading-relaxed">
                  ⚠️ لقد استهلكت تقديماتك المجانية بالكامل. قم بالترقية لباقة Plus للتقديم غير المحدود.
                </div>
              ) : (
                <p className="text-[10px] text-navy-400 mt-2">
                  * الترقية إلى باقة Plus تفتح لك التقديم بشكل لا محدود فوراً.
                </p>
              )}
            </div>
          )}

          {/* 5. Support Box */}
          <div className="rounded-3xl border border-navy-100 bg-[linear-gradient(135deg,#fcfcfd_0%,#f8fafc_100%)] p-5 shadow-sm text-center">
            <h3 className="font-extrabold text-navy-950 text-sm">هل تواجه أي مشكلة فنية؟</h3>
            <p className="text-xs text-navy-500 leading-relaxed mt-1 mb-4">
              فريق دعم جوبز الأردن جاهز لمساعدتك وحل أي مشكلة بخصوص الفوترة أو باني السيرة.
            </p>
            <Link href="/contact" className="btn-outline w-full text-xs font-bold block text-center py-2.5">
              تواصل مع الدعم الفني
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
