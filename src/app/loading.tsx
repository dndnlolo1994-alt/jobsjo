import React from "react";

export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-20 text-center space-y-4">
      {/* Premium glowing spinner */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin" />
        <div className="absolute inset-0 rounded-full border-4 border-r-amber-500/30 animate-pulse" />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-sm font-extrabold tracking-wider text-emerald-600 animate-pulse">جاري التحميل...</span>
        <span className="text-[10px] text-navy-400 mt-1.5 font-bold">يرجى الانتظار قليلاً</span>
      </div>
    </div>
  );
}
