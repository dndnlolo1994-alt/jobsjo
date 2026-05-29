"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function JobSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
    setIsDirty(false);
  }, [searchParams]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("q", value.trim());
      else params.delete("q");
      params.delete("page");
      const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      const current = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      if (next === current) return;
      startTransition(() => router.replace(next, { scroll: false }));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [pathname, router, searchParams, value, isDirty]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setIsDirty(true);
        }}
        className="input h-12 pr-10 text-sm"
        placeholder="ابحث بالمسمى، الشركة، المهارة..."
        aria-label="بحث نصي في الوظائف"
      />
      {isPending && (
        <span className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      )}
    </div>
  );
}
