"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { JOB_TYPE_LABEL, JOB_CATEGORIES, JORDAN_CITIES, EXPERIENCE_LEVEL_LABEL, EDUCATION_LEVEL_LABEL } from "@/lib/utils";

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function apply(form: FormData) {
    const sp = new URLSearchParams();
    for (const [k, v] of form.entries()) {
      if (typeof v === "string" && v.trim() !== "") sp.set(k, v.toString());
    }
    const next = sp.toString() ? `/jobs?${sp.toString()}` : "/jobs";
    startTransition(() => router.push(next));
  }

  return (
    <form
      action={apply}
      className="w-full max-w-full rounded-2xl border border-emerald-400/15 bg-slate-950 p-4 shadow-xl shadow-slate-950/10 space-y-3 lg:sticky lg:top-24"
    >
      <div>
        <label className="label text-white">بحث</label>
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="اكتب وظيفة، شركة، مهارة..."
          className="input h-11 text-sm"
        />
      </div>

      <div>
        <label className="label text-white">المدينة</label>
        <select name="city" defaultValue={params.get("city") ?? ""} className="input h-11 text-sm">
          <option value="">جميع المدن</option>
          {JORDAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label text-white">المنطقة</label>
        <input name="area" defaultValue={params.get("area") ?? ""} className="input h-11 text-sm" placeholder="مثال: الحي الشرقي" />
      </div>

      <div>
        <label className="label text-white">نوع الدوام</label>
        <select name="jobType" defaultValue={params.get("jobType") ?? ""} className="input h-11 text-sm">
          <option value="">الكل</option>
          {Object.entries(JOB_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label text-white">التصنيف</label>
        <select name="category" defaultValue={params.get("category") ?? ""} className="input h-11 text-sm">
          <option value="">جميع التصنيفات</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label text-white">حد أدنى للراتب (دينار)</label>
        <input
          type="number"
          name="salaryMin"
          min="0"
          step="50"
          defaultValue={params.get("salaryMin") ?? ""}
          className="input h-11 text-sm"
          placeholder="مثال: 300"
        />
      </div>

      <div>
        <label className="label text-white">حد أعلى للراتب المطلوب</label>
        <input type="number" name="salaryMax" min="0" step="50" defaultValue={params.get("salaryMax") ?? ""} className="input h-11 text-sm" placeholder="مثال: 500" />
      </div>

      <div>
        <label className="label text-white">الخبرة</label>
        <select name="experience" defaultValue={params.get("experience") ?? ""} className="input h-11 text-sm">
          <option value="">كل مستويات الخبرة</option>
          {Object.entries(EXPERIENCE_LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div>
        <label className="label text-white">التعليم</label>
        <select name="education" defaultValue={params.get("education") ?? ""} className="input h-11 text-sm">
          <option value="">كل المستويات التعليمية</option>
          {Object.entries(EDUCATION_LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-300/40 hover:bg-emerald-500/10">
          <input
            type="checkbox"
            name="noExperience"
            value="1"
            defaultChecked={params.get("noExperience") === "1"}
            className="rounded border-navy-300"
          />
          <span>بدون خبرة</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-300/40 hover:bg-emerald-500/10">
          <input
            type="checkbox"
            name="womenFriendly"
            value="1"
            defaultChecked={params.get("womenFriendly") === "1"}
            className="rounded border-navy-300"
          />
          <span>مناسبة للسيدات</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-300/40 hover:bg-emerald-500/10">
          <input
            type="checkbox"
            name="hasWhatsApp"
            value="1"
            defaultChecked={params.get("hasWhatsApp") === "1"}
            className="rounded border-navy-300"
          />
          <span>تقديم بالواتساب</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-300/40 hover:bg-emerald-500/10">
          <input type="checkbox" name="remote" value="1" defaultChecked={params.get("remote") === "1"} className="rounded border-navy-300" />
          <span>عن بُعد</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition-colors hover:border-emerald-300/40 hover:bg-emerald-500/10">
          <input type="checkbox" name="hybrid" value="1" defaultChecked={params.get("hybrid") === "1"} className="rounded border-navy-300" />
          <span>هجين</span>
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary h-12 w-full disabled:cursor-not-allowed disabled:opacity-70">
        {pending && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
        <span>{pending ? "جاري تطبيق الفلاتر..." : "تطبيق الفلاتر"}</span>
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => router.push("/jobs"))}
        className="h-11 w-full rounded-xl px-4 text-sm font-bold text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        إعادة تعيين
      </button>
    </form>
  );
}
