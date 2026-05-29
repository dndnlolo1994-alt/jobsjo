export default function GlobalLoading() {
  return (
    <section
      className="min-h-[calc(100svh-4rem)] bg-gradient-to-b from-slate-50 via-white to-slate-50 py-6"
      aria-label="جاري تجهيز الصفحة"
    >
      <div className="container-jo space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_16px_48px_rgba(15,23,42,0.06)]">
          <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
            <div className="space-y-5 p-5 sm:p-8">
              <div className="h-8 w-44 rounded-full bg-emerald-100 shimmer" />
              <div className="space-y-3">
                <div className="h-9 w-full max-w-xl rounded-2xl bg-slate-200 shimmer" />
                <div className="h-9 w-4/5 max-w-lg rounded-2xl bg-slate-200 shimmer" />
                <div className="h-4 w-11/12 max-w-2xl rounded bg-slate-100 shimmer" />
                <div className="h-4 w-3/4 max-w-xl rounded bg-slate-100 shimmer" />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-36 rounded-2xl bg-emerald-100 shimmer" />
                <div className="h-12 w-32 rounded-2xl bg-slate-100 shimmer" />
              </div>
            </div>
            <div className="hidden bg-slate-100 p-6 lg:block">
              <div className="h-full min-h-72 rounded-3xl bg-slate-200 shimmer" />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)]"
            >
              <div className="mb-4 h-12 w-12 rounded-2xl bg-emerald-100 shimmer" />
              <div className="h-5 w-3/4 rounded bg-slate-200 shimmer" />
              <div className="mt-3 h-4 w-full rounded bg-slate-100 shimmer" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-100 shimmer" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
