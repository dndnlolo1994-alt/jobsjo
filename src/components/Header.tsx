import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import { Logo } from "./Logo";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 bg-navy-950/90 backdrop-blur border-b border-navy-900/50 shadow-md shadow-emerald-500/5">
      {/* Bottom glow gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      <div className="container-jo flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Logo variant="light" />
          <HeaderNav />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {user.role === "ADMIN" && (
                <Link href="/admin" className="hidden sm:inline-flex text-navy-200 hover:text-white hover:bg-white/5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200">
                  لوحة الأدمن
                </Link>
              )}
              {user.role === "EMPLOYER" && (
                <Link href="/employer" className="hidden sm:inline-flex text-navy-200 hover:text-white hover:bg-white/5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200">
                  بوابة الشركات
                </Link>
              )}
              {user.role === "JOB_SEEKER" && (
                <Link href="/me" className="hidden sm:inline-flex text-navy-200 hover:text-white hover:bg-white/5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200">
                  حسابي
                </Link>
              )}
              <form action="/api/auth/logout" method="POST" className="hidden sm:block">
                <button className="border border-navy-800 bg-navy-900 text-navy-200 hover:text-white hover:bg-navy-800 text-sm px-4 py-2 rounded-xl font-bold transition-all duration-200 active:scale-[0.98]">
                  خروج
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-flex text-navy-200 hover:text-white hover:bg-white/5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200">دخول</Link>
              <Link href="/register" className="btn-primary text-sm px-4 py-2.5 rounded-xl shadow-md shadow-emerald-500/10">إنشاء حساب</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
