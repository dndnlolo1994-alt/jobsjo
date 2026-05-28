import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { Logo } from "./Logo";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-navy-100">
      <div className="container-jo flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-navy-700">
            <Link href="/jobs" className="hover:text-emerald-700">الوظائف</Link>
            <Link href="/companies" className="hover:text-emerald-700">الشركات</Link>
            <Link href="/cv-builder" className="hover:text-emerald-700">باني السيرة</Link>
            <Link href="/pricing" className="hover:text-emerald-700">الأسعار</Link>
            <Link href="/about" className="hover:text-emerald-700">عن المنصة</Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hidden sm:inline-flex btn-ghost">
                  لوحة الأدمن
                </Link>
              )}
              {user.role === "EMPLOYER" && (
                <Link href="/employer" className="hidden sm:inline-flex btn-ghost">
                  بوابة الشركات
                </Link>
              )}
              {user.role === "JOB_SEEKER" && (
                <Link href="/me" className="hidden sm:inline-flex btn-ghost">
                  حسابي
                </Link>
              )}
              <form action="/api/auth/logout" method="POST" className="hidden sm:block">
                <button className="btn-outline text-sm">خروج</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex btn-ghost text-sm">دخول</Link>
              <Link href="/register" className="btn-primary text-sm px-3 sm:px-4">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
