import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminToggleUserSuspensionAction, adminUpdateEmployerPlanAction } from "@/lib/actions/platform";

export const metadata: Metadata = { title: "إدارة أصحاب العمل | لوحة التحكم", robots: { index: false, follow: false } };

export default async function Page() {
  await requireAdmin();
  const items = await prisma.user.findMany({
    where: { role: "EMPLOYER" },
    include: {
      employerProfile: {
        include: { company: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight">إدارة أصحاب العمل</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">التحكم بصلاحيات الشركات، تفعيل الاشتراكات وإيقاف الحسابات.</p>
        </div>
        <div className="bg-slate-100 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full border border-slate-200">
          عدد الشركات الكلي: {items.length}
        </div>
      </div>

      <div className="grid gap-4">
        {items.length === 0 ? (
          <div className="card bg-white p-8 text-center text-slate-500 text-sm font-semibold border border-slate-100">
            🏢 لا يوجد أصحاب عمل مسجلين حالياً في المنصة.
          </div>
        ) : (
          items.map((user) => {
            const profile = user.employerProfile;
            const currentPlan = profile?.plan ?? "FREE";
            const companyName = profile?.company?.name ?? "لم يتم ربط شركة بعد";

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
                      currentPlan === "BUSINESS" ? "bg-purple-100 text-purple-700 border border-purple-200" :
                      currentPlan === "PRO" ? "bg-blue-100 text-blue-700 border border-blue-200" :
                      currentPlan === "BASIC" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                      "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}>
                      الباقة: {currentPlan === "FREE" ? "مجانية" : currentPlan === "BASIC" ? "أساسية (Basic)" : currentPlan === "PRO" ? "احترافية (Pro)" : "أعمال (Business)"}
                    </span>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <p className="break-all">📧 {user.email}</p>
                    {user.phone && <p>📞 {user.phone}</p>}
                    <p>🏢 {companyName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Plan Activation Quick Buttons */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1">
                    {(["FREE", "BASIC", "PRO", "BUSINESS"] as const).map((plan) => (
                      <form key={plan} action={adminUpdateEmployerPlanAction.bind(null, user.id, plan)}>
                        <button
                          type="submit"
                          className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all ${
                            currentPlan === plan
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-700 hover:bg-slate-200/70"
                          }`}
                        >
                          {plan === "FREE" ? "مجاني" : plan === "BASIC" ? "أساسي" : plan === "PRO" ? "برو" : "أعمال"}
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
