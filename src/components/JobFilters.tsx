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
      className="card p-4 space-y-4"
    >
      <div>
        <label className="label">بحث</label>
        <input
          name="q"
          defaultValue={params.get("q") ?? ""}
          placeholder="اكتب وظيفة، شركة، مهارة..."
          className="input"
        />
      </div>

      <div>
        <label className="label">المدينة</label>
        <select name="city" defaultValue={params.get("city") ?? ""} className="input">
          <option value="">جميع المدن</option>
          {JORDAN_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">المنطقة</label>
        <input name="area" defaultValue={params.get("area") ?? ""} className="input" placeholder="مثال: الحي الشرقي" />
      </div>

      <div>
        <label className="label">نوع الدوام</label>
        <select name="jobType" defaultValue={params.get("jobType") ?? ""} className="input">
          <option value="">الكل</option>
          {Object.entries(JOB_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">التصنيف</label>
        <select name="category" defaultValue={params.get("category") ?? ""} className="input">
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
          className="input"
          placeholder="مثال: 300"
        />
      </div>

      <div>
        <label className="label">حد أعلى للراتب المطلوب</label>
        <input type="number" name="salaryMax" min="0" step="50" defaultValue={params.get("salaryMax") ?? ""} className="input" placeholder="مثال: 500" />
      </div>

      <div>
        <label className="label">الخبرة</label>
        <select name="experience" defaultValue={params.get("experience") ?? ""} className="input">
          <option value="">كل مستويات الخبرة</option>
          {Object.entries(EXPERIENCE_LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div>
        <label className="label">التعليم</label>
        <select name="education" defaultValue={params.get("education") ?? ""} className="input">
          <option value="">كل المستويات التعليمية</option>
          {Object.entries(EDUCATION_LEVEL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="noExperience"
            value="1"
            defaultChecked={params.get("noExperience") === "1"}
            className="rounded border-navy-300"
          />
          <span className="text-sm">بدون خبرة</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="womenFriendly"
            value="1"
            defaultChecked={params.get("womenFriendly") === "1"}
            className="rounded border-navy-300"
          />
          <span className="text-sm">مناسبة للسيدات</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="hasWhatsApp"
            value="1"
            defaultChecked={params.get("hasWhatsApp") === "1"}
            className="rounded border-navy-300"
          />
          <span className="text-sm">تقديم بالواتساب</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="remote" value="1" defaultChecked={params.get("remote") === "1"} className="rounded border-navy-300" />
          <span className="text-sm">عن بُعد</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="hybrid" value="1" defaultChecked={params.get("hybrid") === "1"} className="rounded border-navy-300" />
          <span className="text-sm">هجين</span>
        </label>
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "..." : "تطبيق الفلاتر"}
      </button>
      <button
        type="button"
        onClick={() => router.push("/jobs")}
        className="btn-ghost w-full text-sm"
      >
        إعادة تعيين
      </button>
    </form>
  );
}
