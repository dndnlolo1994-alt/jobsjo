import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { Logo } from "./Logo";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl border-b transition-shadow duration-300"
      style={{
        background: "rgba(237,241,255,0.95)",
        borderColor: "rgba(180,205,255,0.55)",
        boxShadow: "0 1px 24px rgba(27,79,219,0.09)",
      }}
    >
      <div className="container-jo flex items-center justify-between h-16">

        {/* Logo + Nav */}
        <div className="flex items-center gap-8">
          <Logo variant="dark" />
          <HeaderNav />
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3.5 py-2 rounded-full transition-all duration-200"
                >
                  لوحة الأدمن
                </Link>
              )}
              {user.role === "EMPLOYER" && (
                <Link
                  href="/employer"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3.5 py-2 rounded-full transition-all duration-200"
                >
                  بوابة الشركات
                </Link>
              )}
              {user.role === "JOB_SEEKER" && (
                <Link
                  href="/me"
                  className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3.5 py-2 rounded-full transition-all duration-200"
                >
                  حسابي
                </Link>
              )}
              <form action="/api/auth/logout" method="POST" className="hidden sm:block">
                <button className="text-sm font-bold border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-full transition-all duration-200 active:scale-[.98]">
                  خروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-bold text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-full transition-all duration-200"
              >
                دخول
              </Link>
              <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
                إنشاء حساب
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
