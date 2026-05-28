export function JobCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-200" />
      <div className="flex gap-4 pt-1">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200 shimmer" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded bg-slate-200 shimmer" />
          <div className="h-3 w-1/2 rounded bg-slate-100 shimmer" />
          <div className="flex flex-wrap gap-2">
            <div className="h-7 w-20 rounded-lg bg-slate-100 shimmer" />
            <div className="h-7 w-28 rounded-lg bg-slate-100 shimmer" />
            <div className="h-7 w-16 rounded-lg bg-slate-100 shimmer" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function JobFiltersSkeleton() {
  return (
    <div className="sticky top-24 space-y-3 rounded-2xl border border-emerald-400/15 bg-slate-950 p-4 shadow-xl shadow-slate-950/10">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-3 w-20 rounded bg-white/20 shimmer" />
          <div className="h-11 rounded-xl bg-white/10 shimmer" />
        </div>
      ))}
      <div className="h-12 rounded-xl bg-emerald-500/40 shimmer" />
    </div>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-200 shimmer" />
      <div className="mb-3 h-5 w-2/3 rounded bg-slate-200 shimmer" />
      <div className="h-4 w-1/2 rounded bg-slate-100 shimmer" />
      <div className="mt-4 h-7 w-24 rounded-full bg-emerald-100 shimmer" />
    </div>
  );
}

export function CompanyProfileSkeleton() {
  return (
    <section className="container-jo py-8">
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="h-44 bg-slate-200 shimmer" />
        <div className="p-6">
          <div className="-mt-14 mb-4 h-24 w-24 rounded-3xl border-4 border-white bg-slate-200 shimmer" />
          <div className="h-8 w-64 rounded bg-slate-200 shimmer" />
          <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-100 shimmer" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
        <div className="h-80 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-5 w-32 rounded bg-slate-200 shimmer" />
          <div className="mt-4 space-y-3">
            <div className="h-11 rounded-xl bg-slate-100 shimmer" />
            <div className="h-24 rounded-xl bg-slate-100 shimmer" />
            <div className="h-11 rounded-xl bg-emerald-100 shimmer" />
          </div>
        </div>
      </div>
    </section>
  );
}
