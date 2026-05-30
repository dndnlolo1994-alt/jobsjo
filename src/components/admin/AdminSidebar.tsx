"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Building2,
  CreditCard,
  Database,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  TriangleAlert,
  User,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface AdminSidebarProps {
  user: {
    fullName: string;
    email: string;
  } | null;
}

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "الرئيسية", href: "/admin", icon: LayoutDashboard },
  { label: "الوظائف", href: "/admin/jobs", icon: Briefcase },
  { label: "إضافة وظيفة", href: "/admin/jobs/new", icon: PlusCircle },
  { label: "الشركات", href: "/admin/companies", icon: Building2 },
  { label: "المدفوعات", href: "/admin/payments", icon: CreditCard },
  { label: "المطالبات", href: "/admin/claims", icon: ShieldCheck },
  { label: "أصحاب العمل", href: "/admin/employers", icon: Users },
  { label: "الباحثون عن عمل", href: "/admin/job-seekers", icon: User },
  { label: "طلبات التقديم", href: "/admin/applications", icon: FolderOpen },
  { label: "المصادر", href: "/admin/sources", icon: Database },
  { label: "البلاغات", href: "/admin/reports", icon: TriangleAlert },
  { label: "وكيل الترويج", href: "/admin/agent", icon: Megaphone },
  { label: "الإعدادات", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 flex w-full items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-3 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500 text-white">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold">بوابة المشرفين</h3>
            <p className="text-[10px] font-bold text-emerald-300">إدارة المنصة</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-slate-900 text-white transition-colors hover:bg-slate-800"
          aria-label="فتح قائمة الإدارة"
          type="button"
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`
          fixed bottom-0 right-0 top-0 z-50 flex h-screen w-72 shrink-0 flex-col justify-between border-l border-slate-800
          bg-[#07111f] p-5 text-slate-100 shadow-[0_20px_60px_rgba(2,6,23,0.45)] transition-transform duration-300 ease-out
          md:sticky md:z-10 md:translate-x-0
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto">
          <div>
            <div className="mb-5 flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-emerald-500 text-white shadow-lg shadow-emerald-950/40">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">بوابة المشرفين</h3>
                  <p className="text-[10px] font-bold tracking-wide text-emerald-300">لوحة تحكم تشغيلية</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white md:hidden"
                type="button"
                aria-label="إغلاق قائمة الإدارة"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors
                      ${isActive
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"}
                    `}
                  >
                    <span
                      className={`
                        grid h-8 w-8 place-items-center rounded-md border
                        ${isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-800 bg-slate-950 text-slate-400"}
                      `}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-4">
            <div className="mb-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <p className="truncate text-xs font-extrabold text-white">{user?.fullName || "مشرف المنصة"}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-400">{user?.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-900/60 bg-rose-950/60 px-3 py-2 text-xs font-extrabold text-rose-100 transition-colors hover:bg-rose-900"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                خروج
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
