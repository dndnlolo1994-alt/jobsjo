"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

interface NavbarClientProps {
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
}

const navLinks = [
  { href: "/jobs",       label: "الوظائف" },
  { href: "/companies",  label: "الشركات" },
  { href: "/cv-builder", label: "باني السيرة" },
  { href: "/pricing",    label: "الأسعار" },
  { href: "/about",      label: "قصتنا" },
];

export function NavbarClient({ user }: NavbarClientProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md border-b border-gray-100"
          : "bg-white/60 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="container-jo flex items-center justify-between h-16">
        
        {/* Logo and Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link href="/" className="transition-transform duration-200 active:scale-95">
            <span className="text-2xl font-black bg-gradient-to-r from-[#1B4FDB] to-[#7C3AED] bg-clip-text text-transparent" style={{ fontFamily: "var(--font-tajawal), sans-serif" }}>
              جوبز الأردن
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1.5 text-sm font-semibold">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full transition-all duration-250 ${
                    isActive
                      ? "text-primary-600 bg-primary-50 font-bold"
                      : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent-500" />
                  )}
                  <span className={isActive ? "pr-2" : ""}>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Auth / Action buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2.5 rounded-full transition-all duration-200"
                >
                  لوحة الأدمن
                </Link>
              )}
              {user.role === "EMPLOYER" && (
                <Link
                  href="/employer"
                  className="text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2.5 rounded-full transition-all duration-200"
                >
                  بوابة الشركات
                </Link>
              )}
              {user.role === "JOB_SEEKER" && (
                <Link
                  href="/me"
                  className="text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2.5 rounded-full transition-all duration-200"
                >
                  حسابي
                </Link>
              )}
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="text-sm font-bold border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-5 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-sm"
                >
                  خروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-5 py-2.5 rounded-full transition-all duration-200"
              >
                دخول
              </Link>
              <Link
                href="/register"
                className="btn-primary text-sm px-6 py-2.5 shadow-md shadow-accent/25 hover:shadow-accent/40"
              >
                إنشاء حساب
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Menu (Mobile Toggle) */}
        <div className="flex md:hidden items-center gap-3">
          {!user && (
            <Link
              href="/register"
              className="btn-primary text-xs px-4 py-2 shadow-sm"
            >
              سجل مجاناً
            </Link>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer/Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md shadow-lg animate-slide-up">
          <div className="container-jo py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            <div className="h-px bg-gray-100 my-2" />
            
            {user ? (
              <div className="flex flex-col gap-2 px-2">
                <span className="text-xs text-gray-400 font-semibold px-2 mb-1">
                  مرحباً بك: {user.email}
                </span>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex justify-center text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 py-3 rounded-full transition-all"
                  >
                    لوحة الأدمن
                  </Link>
                )}
                {user.role === "EMPLOYER" && (
                  <Link
                    href="/employer"
                    className="flex justify-center text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 py-3 rounded-full transition-all"
                  >
                    بوابة الشركات
                  </Link>
                )}
                {user.role === "JOB_SEEKER" && (
                  <Link
                    href="/me"
                    className="flex justify-center text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 py-3 rounded-full transition-all"
                  >
                    حسابي
                  </Link>
                )}
                <form action="/api/auth/logout" method="POST" className="w-full">
                  <button
                    type="submit"
                    className="w-full flex justify-center text-sm font-bold border border-gray-200 text-gray-600 py-3 rounded-full hover:bg-gray-50 transition-all"
                  >
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2">
                <Link
                  href="/login"
                  className="flex justify-center text-sm font-bold text-gray-600 border border-gray-200 py-3 rounded-full hover:bg-gray-50 transition-all"
                >
                  دخول
                </Link>
                <Link
                  href="/register"
                  className="flex justify-center text-sm font-bold text-white bg-[#FF6B35] hover:bg-[#e05621] py-3 rounded-full transition-all shadow-md shadow-accent/20"
                >
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
