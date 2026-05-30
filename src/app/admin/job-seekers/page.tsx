import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminToggleUserSuspensionAction, adminUpdateJobSeekerPlanAction } from "@/lib/actions/platform";
import { formatDateArabic } from "@/lib/utils";

export const metadata: Metadata = { title: "إدارة الباحثين عن عمل | لوحة التحكم", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();
  const items = await prisma.user.findMany({
    where: { role: "JOB_SEEKER" },
    include: {
      jobSeekerProfile: true,
      cvProfile: true
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">إدارة الباحثين عن عمل</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">التحكم بعضويات الباحثين عن عمل، ترقية الباقات وإيقاف الحسابات.</p>
        </div>
        <div className="bg-slate-100 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200">
          عدد المشتركين الكلي: {items.length}
        </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="card bg-white p-8 text-center text-slate-500 text-sm font-semibold border border-slate-100">
            👤 لا يوجد باحثون عن عمل مسجلين حالياً في المنصة.
          </div>
        ) : (
          items.map((user) => {
            const profile = user.jobSeekerProfile;
            const currentPlan = profile?.plan ?? "FREE";
            const cvStatus = user.cvProfile ? "📄 سيرة ذاتية مكتملة" : "❌ سيرة ذاتية غير منشأة";
            const planExpires = profile?.planExpiresAt ? formatDateArabic(profile.planExpiresAt) : null;

            return (
              <div key={user.id} className="card bg-white p-6 text-slate-900 shadow-sm border border-slate-200 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-slate-950 text-base">{user.fullName || "مستخدم بدون اسم"}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      user.isSuspended 
                        ? "bg-rose-50 text-rose-700 border-rose-100" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-100"
                    }`}>
                      {user.isSuspended ? "🚫 موقوف" : "🟢 نشط"}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      currentPlan === "PLUS" ? "bg-amber-50 text-amber-800 border border-amber-300" : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      باقة: {currentPlan === "PLUS" ? "Plus المميزة ⚡" : "المجانية"}
                    </span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <p className="break-all">📧 {user.email}</p>
                    {user.phone && <p>📞 {user.phone}</p>}
                    <p>📍 {profile?.city ?? "المدينة غير حددت"}</p>
                    <p className={user.cvProfile ? "text-emerald-700 font-bold" : "text-rose-600"}>{cvStatus}</p>
                    {planExpires && <p className="text-amber-700 font-bold">⏳ Plus حتى {planExpires}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Plan Activation Quick Buttons */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                    {(["FREE", "PLUS"] as const).map((plan) => (
                      <form key={plan} action={adminUpdateJobSeekerPlanAction.bind(null, user.id, plan)}>
                        <button
                          type="submit"
                          className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all ${
                            currentPlan === plan
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          {plan === "FREE" ? "مجاني" : "تفعيل Plus + إيميل"}
                        </button>
                      </form>
                    ))}
                  </div>

                  {/* Suspension Toggle */}
                  <form action={adminToggleUserSuspensionAction.bind(null, user.id)}>
                    <button
                      type="submit"
                      className={`text-[10px] font-extrabold px-3 py-2 rounded-xl transition-all border ${
                        user.isSuspended
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      }`}
                    >
                      {user.isSuspended ? "🔓 إلغاء الحظر" : "🔒 حظر الحساب"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
