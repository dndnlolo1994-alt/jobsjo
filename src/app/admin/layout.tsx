import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = {
  title: {
    default: "لوحة تحكم الإدارة",
    template: "%s | لوحة إدارة جوبز الأردن",
  },
  robots: { index: false, follow: false },
};

const navItems = [
  { label: "📊 الرئيسية", href: "/admin" },
  { label: "💼 الوظائف", href: "/admin/jobs" },
  { label: "➕ إضافة وظيفة", href: "/admin/jobs/new" },
  { label: "🏢 الشركات", href: "/admin/companies" },
  { label: "💳 المدفوعات", href: "/admin/payments" },
  { label: "🛡️ المطالبات", href: "/admin/claims" },
  { label: "🧑‍💼 أصحاب العمل", href: "/admin/employers" },
  { label: "👤 الباحثون عن عمل", href: "/admin/job-seekers" },
  { label: "📂 طلبات التقديم", href: "/admin/applications" },
  { label: "📡 المصادر", href: "/admin/sources" },
  { label: "⚠️ البلاغات", href: "/admin/reports" },
  { label: "⚙️ الإعدادات", href: "/admin/settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const user = await getSessionUser();

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop Only */}
      <aside className="w-72 bg-white border-l border-slate-150/60 p-6 hidden md:flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(15,23,42,0.015)]">
        <div>
          <div className="pb-6 mb-6 border-b border-slate-100">
            <h3 className="font-extrabold text-navy-950 text-base">بوابة المشرفين</h3>
            <p className="text-xs text-navy-400 mt-1 font-medium">لوحة تحكم جوبز الأردن</p>
          </div>
          
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-bold text-navy-700 hover:bg-slate-50 hover:text-emerald-700 transition-all duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Info Footer in Sidebar */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-navy-900 truncate">{user?.fullName}</p>
            <p className="text-[10px] text-navy-400 truncate">أدمن المنصة</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button className="text-[10px] font-extrabold text-rose-800 bg-rose-50 border border-rose-100/70 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition-all">
              خروج
            </button>
          </form>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Horizontal Navigation */}
        <div className="bg-white border-b border-slate-150/60 p-3 md:hidden overflow-x-auto flex gap-2 snap-x scrollbar-none shadow-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 rounded-xl bg-slate-50 text-xs font-bold text-navy-700 shrink-0 hover:bg-emerald-50 hover:text-emerald-700 snap-center transition-all duration-200 border border-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
