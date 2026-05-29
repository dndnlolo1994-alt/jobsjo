import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireEmployer } from "@/lib/auth";
import { JORDAN_CITIES } from "@/lib/utils";

export const metadata: Metadata = {
  title: "البحث عن مرشحين | بوابة الشركات",
  robots: { index: false, follow: false },
};

export default async function EmployerCandidatesSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string; title?: string }>;
}) {
  // Ensure the user is an employer or admin
  const user = await requireEmployer();

  const params = await searchParams;
  const q = params.q?.trim() || "";
  const city = params.city?.trim() || "";
  const title = params.title?.trim() || "";

  // Build Prisma query filters
  const whereClause: any = {
    // Only show profiles where qrEnabled is true (public-facing / active CVs)
    qrEnabled: true,
  };

  if (city) {
    whereClause.city = city;
  }

  // Handle keyword searching
  if (q || title) {
    const searchConditions: any[] = [];

    if (q) {
      searchConditions.push(
        { fullName: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { skills: { some: { name: { contains: q, mode: "insensitive" } } } },
        { experiences: { some: { position: { contains: q, mode: "insensitive" } } } }
      );
    }

    if (title) {
      searchConditions.push(
        { jobTitle: { contains: title, mode: "insensitive" } }
      );
    }

    if (searchConditions.length > 0) {
      whereClause.AND = [
        {
          OR: searchConditions,
        },
      ];
    }
  }

  // Fetch candidates/CV profiles
  const candidates = await prisma.cVProfile.findMany({
    where: whereClause,
    include: {
      skills: { take: 5, orderBy: { order: "asc" } },
      experiences: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <section className="container-jo py-8">
      {/* Breadcrumbs / Back to dashboard */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/employer" className="text-sm font-semibold text-primary-500 hover:underline">
          🔙 العودة للوحة التحكم
        </Link>
        <span className="text-xs text-gray-500 font-medium">بحث الموظفين والمرشحين في الأردن</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-150/60 p-6 rounded-2xl shadow-sm mb-8">
        <h1 className="text-3xl font-extrabold text-navy-950">🔍 البحث عن الكفاءات والمرشحين</h1>
        <p className="text-sm text-navy-500 mt-1">
          ابحث عن الباحثين عن عمل الموثقين في الأردن، فلتر النتائج حسب المحافظة أو الاختصاص، واطلع على سيرهم الذاتية الرقمية.
        </p>
      </div>

      {/* Filter Form */}
      <div className="card card-pad bg-white border border-slate-100 shadow-sm mb-8">
        <form method="GET" className="grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="q" className="block text-xs font-bold text-gray-600 mb-2">
              كلمة بحث (الاسم، مهارة، أو شركة سابقة)
            </label>
            <input
              type="text"
              id="q"
              name="q"
              defaultValue={q}
              className="input w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="مثال: خدمة عملاء، محاسبة، Java..."
            />
          </div>

          <div>
            <label htmlFor="title" className="block text-xs font-bold text-gray-600 mb-2">
              المسمى الوظيفي
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={title}
              className="input w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              placeholder="مثال: كاشير، مندوب مبيعات..."
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-xs font-bold text-gray-600 mb-2">
              المحافظة / المدينة
            </label>
            <select
              id="city"
              name="city"
              defaultValue={city}
              className="input w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="">كل المحافظات</option>
              {JORDAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
            { (q || city || title) && (
              <Link href="/employer/candidates" className="btn-outline text-xs px-4 py-2.5 rounded-xl font-bold">
                🗑️ مسح الفلاتر
              </Link>
            )}
            <button type="submit" className="btn-primary text-xs px-6 py-2.5 rounded-xl font-bold">
              🔍 تطبيق البحث
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-extrabold text-navy-950 text-lg">المرشحون الموثقون ({candidates.length})</h2>
        </div>

        {candidates.length === 0 ? (
          <div className="card card-pad py-16 text-center text-gray-500 space-y-3 bg-white border border-slate-100">
            <div className="text-5xl">👤</div>
            <p className="font-bold text-base">لم نجد مرشحين يطابقون خيارات بحثك حالياً.</p>
            <p className="text-xs text-gray-400">حاول مسح الكلمات المفتاحية أو البحث بكلمات عامة مثل "مبيعات" أو تغيير المحافظة.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {candidates.map((c) => {
              const latestExp = c.experiences[0];
              return (
                <div key={c.id} className="card card-pad border border-slate-100/80 bg-white hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    {/* Header: Avatar, Name & Title */}
                    <div className="flex gap-4 items-start mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0 border border-primary-100 dark:border-primary-900/30">
                        {c.photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.photo} alt={c.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <span>🧑</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-navy-950 text-base flex items-center gap-1.5">
                          {c.fullName}
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            موثق ✓
                          </span>
                        </h3>
                        {c.jobTitle && (
                          <p className="text-sm font-semibold text-primary-500 truncate mt-0.5">{c.jobTitle}</p>
                        )}
                        <span className="inline-block text-xs text-gray-400 mt-1">📍 {c.city || "الأردن"}</span>
                      </div>
                    </div>

                    {/* Latest Experience */}
                    {latestExp ? (
                      <div className="mb-4 bg-gray-50/70 p-3 rounded-xl border border-gray-100/50 text-xs">
                        <span className="block text-gray-400 font-bold mb-1">الخبرة الأخيرة:</span>
                        <div className="font-bold text-navy-900">{latestExp.position}</div>
                        <div className="text-gray-500 mt-0.5">
                          {latestExp.company} {latestExp.city ? `· ${latestExp.city}` : ""}
                        </div>
                      </div>
                    ) : (
                      c.summary && (
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                          {c.summary}
                        </p>
                      )
                    )}

                    {/* Skills */}
                    {c.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {c.skills.map((s) => (
                          <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-50 flex justify-between items-center mt-2">
                    <span className="text-[10px] text-gray-400">آخر تحديث: {new Intl.DateTimeFormat("ar-JO", { dateStyle: "short" }).format(c.updatedAt)}</span>
                    <Link
                      href={`/cv/${c.userId}`}
                      className="btn-primary text-xs py-2 px-4 rounded-xl font-bold flex items-center gap-1 hover:scale-[1.01] active:scale-[0.99] transition-transform"
                    >
                      👁️ عرض الملف الكامل
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
