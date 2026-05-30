"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FileText, Home, Search, UserRound } from "lucide-react";

const items = [
  { href: "/", label: "الرئيسية", Icon: Home },
  { href: "/jobs", label: "الوظائف", Icon: Search },
  { href: "/companies", label: "الشركات", Icon: Building2 },
  { href: "/me/cv", label: "السيرة", Icon: FileText },
  { href: "/me", label: "حسابي", Icon: UserRound },
];

export function MobileNav() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-navy-100 bg-white/95 shadow-[0_-4px_16px_rgba(10,19,32,0.04)] backdrop-blur-md md:hidden mobile-safe">
      <div className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex min-h-[58px] flex-col items-center justify-center gap-0.5 px-0.5 text-[8.5px] sm:text-[9px] font-bold tracking-tight transition-all duration-200 ${
                isActive ? "text-emerald-700" : "text-navy-400 hover:text-navy-800"
              }`}
            >
              {isActive && <span className="absolute top-0 h-1 w-7 rounded-b-full bg-emerald-600" />}
              <Icon className={`h-[21px] w-[21px] transition-transform duration-200 ${isActive ? "scale-110 text-emerald-600" : "text-navy-300"}`} strokeWidth={2} />
              <span className="mt-0.5 max-w-full truncate leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
