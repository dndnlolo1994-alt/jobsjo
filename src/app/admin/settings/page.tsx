import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { env } from "@/lib/env";
import { AdminDataManagement } from "@/components/admin/AdminDataManagement";

export const metadata: Metadata = {
  title: "الإعدادات",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSettingsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const sp = await searchParams;
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") flat[k] = v;
  }

  return (
    <section className="container-jo py-8 space-y-8">
      <div>
        <h1 className="section-title">إعدادات المنصة</h1>
        <p className="text-sm text-navy-500 mt-1">إعدادات التشغيل وإدارة بيانات قاعدة البيانات.</p>
      </div>

      <div className="card-pad space-y-2 text-sm">
        <p>
          عنوان الموقع: <strong>{env.SITE_URL}</strong>
        </p>
        <p>واتساب الدعم: {env.PLATFORM_WHATSAPP}</p>
        <p>بوابة دفع CV مطلوبة: {env.REQUIRE_CV_PAYMENT ? "نعم" : "لا"}</p>
        <p>مصادر خارجية مفعّلة: {env.ENABLE_EXTERNAL_JOB_SOURCES ? "نعم" : "لا"}</p>
      </div>

      <AdminDataManagement searchParams={flat} />
    </section>
  );
}
