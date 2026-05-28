"use client";

import React from "react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform cursor-pointer"
      title="اضغط لطباعة أو حفظ السيرة الذاتية بصيغة PDF"
    >
      <span>📥</span>
      <span>اضغط هنا لطباعة وحفظ السيرة PDF</span>
    </button>
  );
}
