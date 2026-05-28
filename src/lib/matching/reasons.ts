// تنسيق أسباب التطابق للعرض في الواجهة العربية

import type { MatchBreakdown } from "./job-score";

export function scoreColor(score: number): string {
  if (score >= 75) return "bg-emerald-600 text-white";
  if (score >= 50) return "bg-emerald-100 text-emerald-800";
  if (score >= 30) return "bg-sand-100 text-sand-800";
  return "bg-navy-100 text-navy-700";
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "تطابق ممتاز";
  if (score >= 65) return "تطابق جيد جداً";
  if (score >= 45) return "تطابق جيد";
  if (score >= 25) return "تطابق منخفض";
  return "تطابق ضعيف";
}

export function topReasons(b: MatchBreakdown, n = 4) {
  return [...b.reasons]
    .sort((a, b) => (b.positive ? 1 : 0) - (a.positive ? 1 : 0))
    .slice(0, n);
}
