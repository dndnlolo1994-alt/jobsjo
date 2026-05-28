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
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      {/* Premium Right-Aligned Sidebar */}
      <AdminSidebar user={user ? { fullName: user.fullName, email: user.email } : null} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
