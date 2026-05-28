export default function EmployerLoading() {
  return (
    <section className="container-jo py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-72 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="h-10 w-28 bg-slate-200 rounded-xl"></div>
          <div className="h-10 w-20 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="h-4 w-16 bg-slate-300 rounded"></div>
            <div className="h-8 w-24 bg-slate-300 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Loading Indicator Banner */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-center gap-2 mb-6 text-emerald-800 font-bold text-sm">
        <svg className="animate-spin h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>جاري تحميل بيانات الوظائف... يرجى الانتظار ثوانٍ معدودة</span>
      </div>

      {/* Jobs List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl border border-slate-100 p-5 flex justify-between items-center gap-4">
            <div className="space-y-2.5 flex-1">
              <div className="h-5 w-1/3 bg-slate-300 rounded"></div>
              <div className="h-4 w-1/4 bg-slate-300 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-slate-300 rounded-xl shrink-0"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
