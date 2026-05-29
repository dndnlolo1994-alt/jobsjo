import type { Metadata } from "next";
import Link from "next/link";
import { JobFilters } from "@/components/JobFilters";
import { JobCard } from "@/components/JobCard";
import { EmptyState } from "@/components/EmptyState";
import { JobSearchInput } from "@/components/JobSearchInput";
import { SaveSearchForm } from "@/components/SaveSearchForm";
import { parseJobSearchParams, searchJobsAdvanced } from "@/lib/search/jobs";
import { getSessionUser } from "@/lib/session";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const city = typeof sp.city === "string" ? sp.city : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const type = typeof sp.type === "string" ? sp.type : "";

  let title = "وظائف شاغرة في الأردن | جوبز الأردن";
  let description = "ابحث عن أحدث وظائف الأردن الشاغرة اليوم. تصفح فرص العمل بالقطاع المحلي في عمان وإربد وسائر المحافظات وقدم مجاناً.";

  if (city && category) {
    title = `وظائف ${category} في ${city} | جوبز الأردن`;
    description = `ابحث عن أحدث وظائف ${category} الشاغرة في مدينة ${city}، الأردن. اعثر على فرص عمل تناسب مهاراتك وقدّم بسيرتك الذاتية فوراً.`;
  } else if (city) {
    title = `وظائف شاغرة في ${city} | جوبز الأردن`;
    description = `تصفح أحدث الوظائف وفرص العمل الشاغرة في مدينة ${city}، الأردن. ابحث عن فرص دوام كامل، جزئي وعن بعد وقدم الآن.`;
  } else if (category) {
    title = `وظائف ${category} شاغرة في الأردن | جوبز الأردن`;
    description = `ابحث عن فرص عمل وظائف ${category} في الأردن. تصفح الوظائف المتاحة في مختلف المحافظات الأردنية وقدم سيرتك الذاتية مجاناً.`;
  } else if (type) {
    const typeLabel = type === "FULL_TIME" ? "دوام كامل" : type === "PART_TIME" ? "دوام جزئي" : type === "REMOTE" ? "عمل عن بعد" : type === "HYBRID" ? "عمل هجين" : "شواغر عمل";
    title = `وظائف ${typeLabel} في الأردن | جوبز الأردن`;
    description = `تصفح وظائف ${typeLabel} المتاحة في الأردن. اعثر على فرص عمل مرنة وتناسب أوقاتك وقدم طلبك اليوم.`;
  }

  return {
    title,
    description,
    keywords: ["وظائف الأردن", "شغل في الأردن", "توظيف", city, category].filter(Boolean) as string[],
  };
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const params = parseJobSearchParams(sp);
  const [result, user] = await Promise.all([searchJobsAdvanced(params), getSessionUser()]);
  const query = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => typeof v === "string" ? [[k, v]] : []));
  const savedQuery = Object.fromEntries(query.entries());

  return (
    <section className="container-jo py-8">
      <div className="mb-6">
        <h1 className="section-title">وظائف الأردن</h1>
        <p className="section-sub">فلترة سريعة وروابط قابلة للمشاركة للوظائف المحلية.</p>
      </div>
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="no-print min-w-0"><JobFilters /></aside>
        <main className="min-w-0">
          <div className="mb-4 space-y-3">
            <JobSearchInput />
            {user && query.toString() && (
              <SaveSearchForm
                queryJson={JSON.stringify(savedQuery)}
                defaultName={params.q ? `بحث عن ${params.q}` : "بحث وظائف محفوظ"}
              />
            )}
          </div>
          <div className="card p-3 mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <span className="text-sm text-navy-600">وجدنا {result.total.toLocaleString("ar-JO")} وظيفة</span>
            <form className="flex gap-2">
              {Array.from(query.entries()).filter(([k]) => k !== "sort").map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
              <select name="sort" defaultValue={params.sort} className="input max-w-48" aria-label="ترتيب النتائج">
                <option value="newest">الأحدث</option>
                <option value="featured">المميزة أولاً</option>
                <option value="urgent">العاجلة أولاً</option>
                <option value="best-match">الأفضل مطابقة</option>
                <option value="salary-high">الراتب الأعلى</option>
                <option value="salary-low">الراتب الأقل</option>
              </select>
              <button className="btn-outline">ترتيب</button>
            </form>
          </div>
          {result.items.length === 0 ? (
            <div className="card p-6 text-center">
              <EmptyState title="لم نجد وظائف بهذه الفلاتر" description="جرّب إزالة بعض الفلاتر أو البحث في مدينة قريبة." />
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Link href="/jobs" className="btn-primary text-sm">إزالة الفلاتر</Link>
                <Link href="/jobs?sort=newest" className="btn-outline text-sm">أحدث الوظائف</Link>
                <Link href="/jobs?city=عمّان" className="btn-ghost text-sm">ابحث في مدينة قريبة</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {result.items.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          )}
          <div className="mt-6 flex max-w-full flex-wrap justify-center gap-2 overflow-hidden px-1">
            {Array.from({ length: result.pages }).slice(0, 10).map((_, i) => {
              const p = i + 1;
              query.set("page", String(p));
              return <Link key={p} className={p === result.page ? "btn-primary" : "btn-outline"} href={`/jobs?${query.toString()}`}>{p.toLocaleString("ar-JO")}</Link>;
            })}
          </div>
        </main>
      </div>
    </section>
  );
}
