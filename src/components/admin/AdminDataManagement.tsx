import {
  adminPurgeDemoDataAction,
  adminResetPlatformAction,
} from "@/lib/actions/platform";
import { getPlatformDataCounts, getPreservedAdminEmails } from "@/lib/admin/purge-data";

type Props = {
  searchParams?: { purged?: string; users?: string; jobs?: string; companies?: string; kept?: string; error?: string };
};

export async function AdminDataManagement({ searchParams }: Props) {
  const counts = await getPlatformDataCounts();
  const preserved = getPreservedAdminEmails();

  const success =
    searchParams?.purged === "demo"
      ? `تم حذف البيانات التجريبية: ${searchParams.users ?? "0"} حساب، ${searchParams.jobs ?? "0"} وظيفة، ${searchParams.companies ?? "0"} شركة.`
      : searchParams?.purged === "full"
        ? `تمت إعادة ضبط المنصة. حُذف ${searchParams.users ?? "0"} حساباً. الحسابات المحفوظة: ${searchParams.kept ? decodeURIComponent(searchParams.kept) : preserved.join("، ")}.`
        : null;

  const error =
    searchParams?.error === "confirm"
      ? "لم يتم التنفيذ: اكتب عبارة التأكيد بالضبط كما هو موضّح في الحقل."
      : null;

  return (
    <div className="space-y-6">
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900">
          {error}
        </div>
      )}

      <div className="card-pad bg-slate-50/80 border border-slate-100">
        <h2 className="font-extrabold text-navy-950 text-base mb-2">من أين يأتي رقم «الباحثون عن عمل»؟</h2>
        <p className="text-sm text-navy-600 leading-relaxed">
          العدد في لوحة الأدمن يأتي من قاعدة البيانات:{" "}
          <code className="text-xs bg-white px-1.5 py-0.5 rounded">User</code> بدور{" "}
          <strong>JOB_SEEKER</strong>. سكربت البذرة{" "}
          <code className="text-xs bg-white px-1.5 py-0.5 rounded">prisma/seed.ts</code> ينشئ{" "}
          <strong>٦٠</strong> باحثاً تجريبياً (
          <code className="text-xs">seeker1@jojobs.local</code> …{" "}
          <code className="text-xs">seeker60@jojobs.local</code>). إذا ظهر{" "}
          <strong>٦١</strong> فغالباً هناك <strong>حساب حقيقي أو تجريبي إضافي</strong> سجّل على الموقع.
        </p>
        <ul className="mt-3 text-sm text-navy-600 space-y-1 list-disc list-inside">
          <li>
            الباحثون عن عمل الآن: <strong className="text-navy-900">{counts.seekers}</strong>
          </li>
          <li>
            حسابات <code className="text-xs">@jojobs.local</code>:{" "}
            <strong className="text-navy-900">{counts.demoUsers}</strong>
          </li>
          <li>
            أصحاب عمل: {counts.employers} · وظائف: {counts.jobs} · شركات: {counts.companies} ·
            تقديمات: {counts.applications}
          </li>
        </ul>
      </div>

      <div className="card-pad border border-amber-200/80 bg-amber-50/40">
        <h2 className="font-extrabold text-navy-950 text-base mb-1">حذف البيانات التجريبية (موصى به)</h2>
        <p className="text-sm text-navy-600 mb-4 leading-relaxed">
          يمسح كل الوظائف والشركات والتقديمات والسير الذاتية التجريبية، ويحذف حسابات{" "}
          <code className="text-xs">@jojobs.local</code> فقط. يبقي حسابك كأدمن وأي مستخدم سجّل ببريد
          حقيقي.
        </p>
        <form action={adminPurgeDemoDataAction} className="space-y-3 max-w-md">
          <label className="block text-xs font-bold text-navy-700">
            للتأكيد اكتب: <span className="text-rose-700">حذف-التجريبي</span>
          </label>
          <input
            name="confirm"
            type="text"
            required
            autoComplete="off"
            placeholder="حذف-التجريبي"
            className="input w-full"
          />
          <button type="submit" className="btn-danger w-full sm:w-auto">
            حذف البيانات التجريبية
          </button>
        </form>
      </div>

      <div className="card-pad border border-rose-200 bg-rose-50/30">
        <h2 className="font-extrabold text-rose-950 text-base mb-1">إعادة ضبط كاملة للمنصة</h2>
        <p className="text-sm text-navy-600 mb-2 leading-relaxed">
          يحذف <strong>كل</strong> المحتوى و<strong>كل</strong> المستخدمين ما عدا حسابات الأدمن
          المعرّفة في <code className="text-xs">ADMIN_EMAILS</code>:
        </p>
        <p className="text-xs font-mono text-navy-500 mb-4 break-all">{preserved.join(" · ")}</p>
        <form action={adminResetPlatformAction} className="space-y-3 max-w-md">
          <label className="block text-xs font-bold text-navy-700">
            للتأكيد اكتب: <span className="text-rose-700">إعادة-ضبط-المنصة</span>
          </label>
          <input
            name="confirm"
            type="text"
            required
            autoComplete="off"
            placeholder="إعادة-ضبط-المنصة"
            className="input w-full"
          />
          <button type="submit" className="btn-danger w-full sm:w-auto">
            إعادة ضبط كاملة (لا يمكن التراجع)
          </button>
        </form>
      </div>
    </div>
  );
}
