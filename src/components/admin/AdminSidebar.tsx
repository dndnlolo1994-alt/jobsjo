"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminSidebarProps {
  user: {
    fullName: string;
    email: string;
  } | null;
}

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
  { label: "🤖 وكيل الترويج", href: "/admin/agent" },
  { label: "⚙️ الإعدادات", href: "/admin/settings" },
];

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Sticky Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40 shadow-md w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <div>
            <h3 className="font-extrabold text-sm">لوحة تحكم الإدارة</h3>
            <p className="text-[9px] text-slate-400">جوبز الأردن</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 bottom-0 right-0 z-50 w-72 bg-navy-950 text-slate-100 p-6 flex flex-col justify-between shrink-0
        transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:z-10 h-screen
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        border-l border-navy-900/60 shadow-[4px_0_24px_rgba(0,0,0,0.2)]
      `}>
        <div className="flex flex-col h-full justify-between overflow-y-auto scrollbar-none">
          <div>
            {/* Sidebar Branding */}
            <div className="pb-5 mb-5 border-b border-navy-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-extrabold text-base text-white">بوابة المشرفين</h3>
                  <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">لوحة الإدارة الكاملة</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg bg-navy-900 md:hidden hover:bg-navy-800 text-slate-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Sidebar Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group
                      ${isActive 
                        ? "bg-gradient-to-l from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/20 translate-x-1" 
                        : "text-slate-300 hover:bg-navy-900 hover:text-white hover:translate-x-1"}
                    `}
                  >
                    <span className="transition-transform duration-200 group-hover:scale-105">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile Box & Logout Button */}
          <div className="pt-4 mt-6 border-t border-navy-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white truncate">{user?.fullName}</p>
              <p className="text-[9px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST" className="shrink-0">
              <button 
                type="submit" 
                className="text-[10px] font-extrabold text-rose-350 bg-rose-950/65 border border-rose-900/50 hover:bg-rose-900 hover:text-white px-3 py-2 rounded-xl transition-all"
              >
                خروج
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
