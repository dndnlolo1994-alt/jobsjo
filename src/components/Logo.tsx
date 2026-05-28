import Link from "next/link";
import { env } from "@/lib/env";

export function Logo({ size = "md", variant = "dark" }: { size?: "sm" | "md" | "lg"; variant?: "light" | "dark" }) {
  const dim = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const textClass = variant === "light" ? "text-white" : "text-navy-900";
  const subClass = variant === "light" ? "text-navy-200" : "text-navy-400";
  
  return (
    <Link href="/" className="flex items-center gap-2 group" aria-label={env.SITE_NAME}>
      <div className={`${dim} rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 grid place-items-center text-white shadow-md group-hover:shadow-lg transition-all duration-300`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
          <path d="M3 9.5L12 3l9 6.5V21H3V9.5Z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 21v-6h6v6" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`font-extrabold transition-colors duration-200 ${textClass} ${text}`}>جوبز الأردن</div>
        <div className={`text-[10px] font-semibold transition-colors duration-200 ${subClass}`}>نظام التوظيف المحلي</div>
      </div>
    </Link>
  );
}
