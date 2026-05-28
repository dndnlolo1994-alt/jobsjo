"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/jobs", label: "الوظائف" },
  { href: "/companies", label: "الشركات" },
  { href: "/cv-builder", label: "باني السيرة" },
  { href: "/pricing", label: "الأسعار" },
  { href: "/about", label: "عن المنصة" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-2 text-sm font-semibold text-navy-200">
      {links.map((link) => {
        const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative px-3 py-2 rounded-xl transition-all duration-200 nav-link-underline hover:text-white flex items-center gap-1.5 ${
              isActive ? "text-white bg-white/5" : "text-navy-200"
            }`}
          >
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
