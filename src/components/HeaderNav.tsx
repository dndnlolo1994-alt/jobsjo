"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/jobs",       label: "الوظائف" },
  { href: "/companies",  label: "الشركات" },
  { href: "/cv-builder", label: "باني السيرة" },
  { href: "/pricing",    label: "الأسعار" },
  { href: "/about",      label: "عن المنصة" },
];

export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1 text-sm font-semibold">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname?.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "relative px-3.5 py-2 rounded-full transition-all duration-200 nav-link-underline flex items-center gap-1.5",
              isActive
                ? "text-primary-600 bg-primary-50 font-bold"
                : "text-gray-600 hover:text-primary-600 hover:bg-gray-50",
            ].join(" ")}
          >
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse shrink-0" />
            )}
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
