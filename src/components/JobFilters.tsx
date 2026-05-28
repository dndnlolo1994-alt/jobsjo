"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { JOB_TYPE_LABEL, JOB_CATEGORIES, JORDAN_CITIES, EXPERIENCE_LEVEL_LABEL, EDUCATION_LEVEL_LABEL } from "@/lib/utils";

export function JobFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, setPending] = useState(false);

  function apply(form: FormData) {
    const sp = new URLSearchParams();
    for (const [k, v] of form.entries()) {
      if (typeof v === "string" && v.trim() !== "") sp.set(k, v.toString());
    }
    setPending(true);
    router.push(`/jobs?${sp.toString()}`);
    setPending(false);
  }

  return (
    <form
      action={apply}
      className="sticky top-24 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm space-y-3"
    >
      <div>
        <label className="label">بحث</label>
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="اكتب وظيفة، شركة، مهارة..."
          className="input h-11 text-sm"
        />
      </div>

      <div>
        <label className="label">المدينة</label>
        <select name="city" defaultValue={params.get("city") ?? ""} className="input h-11 text-sm">
          <option value="">جميع المدن</option>
          {JORDAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">المنطقة</label>
        <input name="area" defaultValue={params.get("area") ?? ""} className="input h-11 text-sm" placeholder="مثال: الحي الشرقي" />
      </div>

      <div>
        <label className="label">نوع الدوام</label>
        <select name="jobType" defaultValue={params.get("jobType") ?? ""} className="input h-11 text-sm">
          <option value="">الكل</option>
          {Object.entries(JOB_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">التصنيف</label>
        <select name="category" defaultValue={params.get("category") ?? ""} className="input h-11 text-sm">
          <option value="">جميع التصنيفات</option>
          {JOB_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">حد أدنى للراتب (دينار)</label>
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
        <label className="label">حد أعلى للراتب المطلوب</label>
        <input type="number" name="salaryMax" min="0" step="50" defaultValue={params.get("salaryMax") ?? ""} className="input h-11 text-sm" placeholder="مثال: 500" />
      </div>

      <div>
        <label className="label">الخبرة</label>
        <select name="experience" defaultValue={params.get("experience") ?? ""} className="input h-11 text-sm">
          <option value="">كل مستويات الخبرة</option>
          {Object.entries(EXPERIENCE_LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div>
        <label className="label">التعليم</label>
        <select name="education" defaultValue={params.get("education") ?? ""} className="input h-11 text-sm">
          <option value="">كل المستويات التعليمية</option>
          {Object.entries(EDUCATION_LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
          <input
            type="checkbox"
            name="noExperience"
            value="1"
            defaultChecked={params.get("noExperience") === "1"}
            className="rounded border-navy-300"
          />
          <span>بدون خبرة</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
          <input
            type="checkbox"
            name="womenFriendly"
            value="1"
            defaultChecked={params.get("womenFriendly") === "1"}
            className="rounded border-navy-300"
          />
          <span>مناسبة للسيدات</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
          <input
            type="checkbox"
            name="hasWhatsApp"
            value="1"
            defaultChecked={params.get("hasWhatsApp") === "1"}
            className="rounded border-navy-300"
          />
          <span>تقديم بالواتساب</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
          <input type="checkbox" name="remote" value="1" defaultChecked={params.get("remote") === "1"} className="rounded border-navy-300" />
          <span>عن بُعد</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm font-semibold text-navy-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/40">
          <input type="checkbox" name="hybrid" value="1" defaultChecked={params.get("hybrid") === "1"} className="rounded border-navy-300" />
          <span>هجين</span>
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary h-12 w-full">
        {pending ? "..." : "تطبيق الفلاتر"}
      </button>
      <button
        type="button"
        onClick={() => router.push("/jobs")}
        className="btn-ghost h-11 w-full text-sm"
      >
        إعادة تعيين
      </button>
    </form>
  );
}
