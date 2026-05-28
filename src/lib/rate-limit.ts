// Rate limiter بسيط جداً في الذاكرة — مناسب لحالة MVP بنسخة واحدة.
// للإنتاج متعدد العقد يُستبدل بـ Redis/Upstash.

type Bucket = { count: number; resetAt: number };
const store = new Map<string, Bucket>();

export type RateLimitResult = { ok: boolean; remaining: number; resetMs: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const b = store.get(key);
  if (!b || b.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetMs: windowMs };
  }
  if (b.count >= limit) {
    return { ok: false, remaining: 0, resetMs: b.resetAt - now };
  }
  b.count += 1;
  return { ok: true, remaining: limit - b.count, resetMs: b.resetAt - now };
}
