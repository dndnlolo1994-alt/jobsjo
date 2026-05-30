import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: {
    default: "لوحة تحكم الإدارة",
    template: "%s | لوحة إدارة جوبز الأردن",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#0A0C16] text-slate-100 md:flex" dir="rtl">
      <AdminSidebar user={user ? { fullName: user.fullName, email: user.email } : null} />

      <div className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_right,rgba(192,163,104,0.14),transparent_28rem),radial-gradient(circle_at_bottom_left,rgba(27,79,219,0.10),transparent_28rem)]">
        <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
