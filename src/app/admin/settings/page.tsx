import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
export const metadata: Metadata = { title: "الإعدادات", robots: { index: false, follow: false } };
export default async function Page(){ await requireAdmin(); return <section className="container-jo py-8"><h1 className="section-title">إعدادات المنصة</h1><div className="card-pad space-y-2 text-sm"><p>عنوان الموقع: {env.SITE_URL}</p><p>واتساب الدعم: {env.PLATFORM_WHATSAPP}</p><p>بوابة دفع CV مطلوبة: {env.REQUIRE_CV_PAYMENT ? "نعم" : "لا"}</p><p>مصادر خارجية مفعّلة: {env.ENABLE_EXTERNAL_JOB_SOURCES ? "نعم" : "لا"}</p></div></section>; }
