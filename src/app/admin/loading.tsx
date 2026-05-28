export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-slate-200 rounded-xl"></div>
        <div className="h-4 w-96 bg-slate-200 rounded-lg"></div>
      </div>

      {/* Loading Banner */}
      <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
        <svg className="animate-spin h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>جاري فتح اللوحة وتحميل البيانات الحية...</span>
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl border border-slate-100 p-5 space-y-3">
            <div className="h-4 w-20 bg-slate-300 rounded"></div>
            <div className="h-8 w-28 bg-slate-300 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Content Box Skeleton */}
      <div className="h-96 bg-slate-200 rounded-2xl border border-slate-100 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-300 rounded"></div>
        <div className="space-y-3 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-300 rounded-xl w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
