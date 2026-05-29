"use client";

import { useState, useTransition } from "react";
import { requestPlusUpgradeAction } from "@/lib/actions/platform";

export function RequestPlusButton({ className, label }: { className?: string; label?: string }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const res = await requestPlusUpgradeAction();
            setOk(res.ok);
            setMsg(res.message);
          })
        }
        className={className || "btn-primary text-sm w-full"}
      >
        {isPending ? "جارٍ الإرسال..." : label || "طلب الترقية إلى Plus ⚡"}
      </button>
      {msg && (
        <p className={`text-xs font-semibold leading-6 ${ok ? "text-emerald-700" : "text-rose-700"}`}>{msg}</p>
      )}
    </div>
  );
}
