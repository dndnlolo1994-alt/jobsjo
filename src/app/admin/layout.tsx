import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "لوحة تحكم الإدارة",
    template: "%s | لوحة إدارة جوبز الأردن",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950 md:flex" dir="rtl">
      <AdminSidebar user={user ? { fullName: user.fullName, email: user.email } : null} />

      <div className="min-w-0 flex-1">
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
