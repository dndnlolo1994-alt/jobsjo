import Link from "next/link";
import { env } from "@/lib/env";

export function Logo({
  size    = "md",
  variant = "dark",
}: {
  size?:    "sm" | "md" | "lg";
  variant?: "light" | "dark";
}) {
  const dim  = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-8 w-8"  : "h-10 w-10";
  const text = size === "lg" ? "text-2xl"  : size === "sm" ? "text-base" : "text-lg";
  const nameClass =
    variant === "light"
      ? "text-white"
      : "text-gradient-primary";            /* gradient on light bg */
  const subClass =
    variant === "light" ? "text-white/60" : "text-gray-400";

  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label={env.SITE_NAME}>
      {/* Icon square */}
      <div
        className={`${dim} rounded-xl grid place-items-center text-white shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-[1.04]`}
        style={{ background: "linear-gradient(135deg, #1B4FDB, #7C3AED)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="w-[55%] h-[55%]">
          <path
            d="M12 3L3 9v12h6v-7h6v7h6V9L12 3Z"
            stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round"
          />
          <circle cx="12" cy="10" r="2" fill="white" opacity=".9" />
        </svg>
      </div>

      {/* Text */}
      <div className="leading-tight">
        <div className={`font-extrabold transition-all duration-200 ${nameClass} ${text}`}
             style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
          جوبز الأردن
        </div>
        <div className={`text-[10px] font-semibold ${subClass}`}>
          نظام التوظيف المحلي
        </div>
      </div>
    </Link>
  );
}
