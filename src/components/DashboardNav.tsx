"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon?: string };

export function DashboardNav({ items }: { items: Item[] }) {
  const path = usePathname();
  return (
    <nav className="card p-2 space-y-1 sticky top-20">
      {items.map((it) => {
        const active = path === it.href || path.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold",
              active
                ? "bg-emerald-600 text-white"
                : "text-navy-700 hover:bg-navy-50"
            )}
          >
            {it.icon && <span>{it.icon}</span>}
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
