"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Turn off loading once path or search params change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      // Find the closest anchor tag
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const targetAttr = anchor.getAttribute("target");
      const downloadAttr = anchor.getAttribute("download");

      // Ignore external links, mailto, tel, target="_blank", or download links
      if (
        !href ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        targetAttr === "_blank" ||
        downloadAttr !== null
      ) {
        return;
      }

      // Check for modifier keys (e.g. Cmd/Ctrl click to open in new tab)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
        return;
      }

      // Skip loader if clicking the exact same URL (unless it's a form or search query)
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      setIsLoading(true);
    };

    document.addEventListener("click", handleLinkClick);
    return () => {
      document.removeEventListener("click", handleLinkClick);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-navy-950/40 backdrop-blur-md text-center animate-fade-in duration-200">
      <div className="bg-white/95 p-6 sm:p-8 rounded-2xl shadow-2xl border border-emerald-100 flex flex-col items-center space-y-4 max-w-xs mx-4">
        {/* Premium glowing spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-emerald-600 animate-spin" />
          <div className="absolute inset-0 rounded-full border-4 border-r-amber-500/30 animate-pulse" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-sm font-extrabold text-emerald-700 animate-pulse">جاري التحميل...</span>
          <span className="text-[10px] text-navy-400 mt-1 font-bold">يرجى الانتظار قليلاً</span>
        </div>
      </div>
    </div>
  );
}

export function NavigationLoader() {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderContent />
    </Suspense>
  );
}
