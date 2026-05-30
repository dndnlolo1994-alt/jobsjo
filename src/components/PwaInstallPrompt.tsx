"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const dismissed = localStorage.getItem("jojobs-install-dismissed") === "1";
    const handler = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setHidden(dismissed);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (pathname?.startsWith("/admin") || !event || hidden) return null;

  async function install() {
    if (!event) return;
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") {
      setHidden(true);
    }
  }

  function dismiss() {
    localStorage.setItem("jojobs-install-dismissed", "1");
    setHidden(true);
  }

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 md:bottom-5 md:right-auto md:left-5 md:w-96">
      <div className="rounded-lg border border-emerald-200 bg-white p-3 shadow-cardHover">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-extrabold text-navy-900">ثبّت جوبز الأردن على هاتفك</h2>
            <p className="mt-1 text-sm text-navy-600">افتح الوظائف والسيرة بسرعة من الشاشة الرئيسية.</p>
          </div>
          <button onClick={dismiss} className="rounded-md px-2 text-navy-400 hover:bg-navy-50" aria-label="إغلاق">×</button>
        </div>
        <button onClick={install} className="btn-primary mt-3 w-full">تثبيت التطبيق</button>
      </div>
    </div>
  );
}
