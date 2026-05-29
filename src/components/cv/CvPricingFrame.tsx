"use client";

import { useEffect, useRef, useState } from "react";

const CV_WIDTH = 794;
const CV_HEIGHT = 1123;

type CvPricingFrameProps = {
  children: React.ReactNode;
  /** أقصى ارتفاع للإطار (px) — تُحسب نسبة التصغير لتناسب العرض والارتفاع معاً */
  maxHeight?: number;
};

/**
 * يعرض السيرة كاملة داخل الإطار بدون تمرير: تصغير متناسب ومتمركز.
 */
export function CvPricingFrame({ children, maxHeight = 560 }: CvPricingFrameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const update = () => {
      const width = host.clientWidth || CV_WIDTH;
      const byWidth = width / CV_WIDTH;
      const byHeight = maxHeight / CV_HEIGHT;
      const next = Math.min(byWidth, byHeight, 1);
      setScale(Math.max(0.32, next));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(host);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [maxHeight]);

  const scaledH = Math.ceil(CV_HEIGHT * scale);

  return (
    <div
      ref={hostRef}
      className="relative w-full rounded-lg border border-[#c2a06c]/40 bg-white shadow-inner overflow-hidden"
      style={{ height: scaledH }}
    >
      <div
        className="absolute left-1/2 top-0"
        style={{
          width: CV_WIDTH,
          height: CV_HEIGHT,
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div className="[&_.cv-print]:mb-0 [&_.cv-print]:shadow-none [&_.cv-print]:border-0 pricing-cv-embed">
          {children}
        </div>
      </div>
    </div>
  );
}
