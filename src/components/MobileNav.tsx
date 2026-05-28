"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "الرئيسية", icon: "⌂" },
  { href: "/jobs", label: "الوظائف", icon: "▦" },
  { href: "/me/cv", label: "السيرة", icon: "▤" },
  { href: "/me", label: "حسابي", icon: "◉" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-navy-100 bg-white/95 backdrop-blur-md md:hidden mobile-safe shadow-[0_-4px_16px_rgba(10,19,32,0.04)]">
      <div className="grid grid-cols-4">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-all duration-200 relative ${
                isActive ? "text-emerald-700 font-extrabold" : "text-navy-400 hover:text-navy-800"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-b-full bg-emerald-600" />
              )}
              <span className={`text-xl leading-none transition-transform duration-200 ${isActive ? "scale-110 text-emerald-600" : "text-navy-300"}`} aria-hidden="true">
                {item.icon}
              </span>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
