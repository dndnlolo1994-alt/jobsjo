import Link from "next/link";
import { env } from "@/lib/env";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label={env.SITE_NAME}>
      <div className={`${dim} rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center text-white shadow-md group-hover:shadow-lg`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M3 9.5L12 3l9 6.5V21H3V9.5Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21v-6h6v6" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`font-extrabold text-navy-900 ${text}`}>جوبز الأردن</div>
        <div className="text-[10px] text-navy-400 font-semibold">نظام التوظيف المحلي</div>
      </div>
    </Link>
  );
}
