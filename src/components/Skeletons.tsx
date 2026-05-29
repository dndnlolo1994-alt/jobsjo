export function JobCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_28px_rgba(15,23,42,0.045)]">
      <div className="h-1 bg-emerald-200" />
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200 shimmer" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-full bg-emerald-100 shimmer" />
            <div className="h-5 w-14 rounded-full bg-slate-100 shimmer" />
          </div>
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

export function JobDetailSkeleton() {
  return (
    <article className="container-jo py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <main className="space-y-5">
          <section className="card-pad">
            <div className="mb-3 flex flex-wrap gap-2">
              <div className="h-7 w-16 rounded-full bg-amber-100 shimmer" />
              <div className="h-7 w-20 rounded-full bg-emerald-100 shimmer" />
            </div>
            <div className="h-9 w-4/5 max-w-xl rounded bg-slate-200 shimmer" />
            <div className="mt-3 h-4 w-72 max-w-full rounded bg-slate-100 shimmer" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-navy-50 p-3">
                  <div className="h-3 w-16 rounded bg-slate-200 shimmer" />
                  <div className="mt-2 h-5 w-24 rounded bg-slate-200 shimmer" />
                </div>
              ))}
            </div>
          </section>

          {Array.from({ length: 3 }).map((_, i) => (
            <section key={i} className="card-pad">
              <div className="mb-4 h-6 w-36 rounded bg-slate-200 shimmer" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-slate-100 shimmer" />
                <div className="h-4 w-11/12 rounded bg-slate-100 shimmer" />
                <div className="h-4 w-3/4 rounded bg-slate-100 shimmer" />
              </div>
            </section>
          ))}
        </main>

        <aside className="space-y-4">
          <div className="card-pad sticky top-20">
            <div className="mb-4 h-6 w-36 rounded bg-slate-200 shimmer" />
            <div className="h-28 rounded-xl bg-slate-100 shimmer" />
            <div className="mt-3 h-12 rounded-xl bg-emerald-100 shimmer" />
            <div className="mt-5 space-y-2 border-t border-navy-50 pt-4">
              <div className="h-3 w-28 rounded bg-slate-100 shimmer" />
              <div className="h-3 w-32 rounded bg-slate-100 shimmer" />
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

export function CompanyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.045)]">
      <div className="flex gap-3">
        <div className="h-12 w-12 rounded-2xl bg-emerald-100 shimmer" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-2/3 rounded bg-slate-200 shimmer" />
          <div className="h-4 w-1/2 rounded bg-slate-100 shimmer" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-16 rounded-xl bg-slate-100 shimmer" />
        <div className="h-16 rounded-xl bg-slate-100 shimmer" />
      </div>
      <div className="mt-4 h-4 w-44 rounded bg-emerald-100 shimmer" />
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

export function CvBuilderSkeleton() {
  return (
    <section className="container-jo py-8">
      <div className="mb-6 space-y-3">
        <div className="h-8 w-72 max-w-full rounded bg-slate-200 shimmer" />
        <div className="h-4 w-[32rem] max-w-full rounded bg-slate-100 shimmer" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-4 h-5 w-40 rounded bg-slate-200 shimmer" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-12 rounded-xl bg-slate-100 shimmer" />
                <div className="h-12 rounded-xl bg-slate-100 shimmer" />
              </div>
            </div>
          ))}
        </div>
        <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="h-6 w-32 rounded bg-slate-200 shimmer" />
          <div className="mt-4 h-24 rounded-xl bg-slate-100 shimmer" />
          <div className="mt-4 h-12 rounded-xl bg-emerald-100 shimmer" />
        </aside>
      </div>
    </section>
  );
}
