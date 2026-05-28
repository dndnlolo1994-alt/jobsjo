import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { deleteSavedSearchAction, toggleSavedSearchAction } from "@/lib/actions/platform";
import { formatDateArabic } from "@/lib/utils";
import { SubmitButton } from "@/components/forms/SubmitButton";

export const metadata: Metadata = { title: "البحوث المحفوظة", robots: { index: false, follow: false } };

function describeQuery(queryJson: unknown) {
  if (!queryJson || typeof queryJson !== "object") return "كل الوظائف";
  const entries = Object.entries(queryJson as Record<string, string>).filter(([, v]) => v);
  if (!entries.length) return "كل الوظائف";
  return entries.map(([k, v]) => `${k}: ${v}`).join(" · ");
}

export default async function SavedSearchesPage() {
  const user = await requireUser();
  const searches = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliveries: true } } },
  });

  return (
    <section className="container-jo py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">البحوث المحفوظة</h1>
          <p className="section-sub">احفظ فلاتر الوظائف واستقبل تنبيهات عند نشر وظائف مطابقة.</p>
        </div>
        <Link href="/jobs" className="btn-primary text-sm">إنشاء بحث جديد</Link>
      </div>

      <div className="space-y-3">
        {searches.map((search) => (
          <div key={search.id} className="card-pad">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-extrabold text-navy-950">{search.name}</h2>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${search.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {search.isActive ? "مفعل" : "متوقف"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-navy-600">{describeQuery(search.queryJson)}</p>
                <p className="mt-2 text-xs text-navy-400">
                  آخر إرسال: {formatDateArabic(search.lastSentAt)} · وظائف أُرسلت: {search._count.deliveries.toLocaleString("ar-JO")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={toggleSavedSearchAction.bind(null, search.id)}>
                  <SubmitButton className="btn-outline px-3 py-2 text-xs" pendingText="جاري التحديث...">
                    {search.isActive ? "تعطيل" : "تفعيل"}
                  </SubmitButton>
                </form>
                <form action={deleteSavedSearchAction.bind(null, search.id)}>
                  <SubmitButton className="btn-danger px-3 py-2 text-xs" pendingText="جاري الحذف...">
                    حذف
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {searches.length === 0 && (
        <div className="card-pad text-center text-navy-500">
          لا توجد بحوث محفوظة بعد. ابدأ من صفحة الوظائف واحفظ الفلاتر المناسبة لك.
        </div>
      )}
    </section>
  );
}
