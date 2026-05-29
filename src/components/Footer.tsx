import Link from "next/link";
import { env } from "@/lib/env";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-navy-100 mt-16 overflow-hidden">
      {/* Top emerald gradient border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-500/80 via-emerald-600/20 to-transparent" />
      
      {/* Background soft glow decoration */}
      <div className="absolute left-0 top-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translate-y-1/2 bg-navy-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="container-jo relative z-10 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="flex flex-col justify-between">
          <div>
            <Logo size="md" variant="light" />
            <p className="mt-4 text-sm text-navy-300 leading-relaxed max-w-xs">
              منصة وظائف الأردن — تجمع الفرص المحلية وتساعدك تعمل سيرة ذاتية احترافية وتتابع طلباتك من مكان واحد وبشكل آمن وموثوق.
            </p>
          </div>
          
          {/* Social Media SVG Placeholders */}
          <div className="flex items-center gap-3 mt-6">
            <span className="text-xs text-navy-400 font-bold ml-1">تابعنا:</span>
            <div className="w-8 h-8 rounded-xl bg-navy-800/50 hover:bg-emerald-600/20 hover:text-emerald-400 flex items-center justify-center text-navy-300 cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
              </svg>
            </div>
            <div className="w-8 h-8 rounded-xl bg-navy-800/50 hover:bg-emerald-600/20 hover:text-emerald-400 flex items-center justify-center text-navy-300 cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </div>
            <div className="w-8 h-8 rounded-xl bg-navy-800/50 hover:bg-emerald-600/20 hover:text-emerald-400 flex items-center justify-center text-navy-300 cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </div>
            <div className="w-8 h-8 rounded-xl bg-navy-800/50 hover:bg-emerald-600/20 hover:text-emerald-400 flex items-center justify-center text-navy-300 cursor-pointer transition-all duration-300 hover:-translate-y-1">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-r-2 border-emerald-500 pr-2">للباحثين عن عمل</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/jobs" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">تصفّح الوظائف</Link></li>
            <li><Link href="/cv-builder" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">اعمل CV</Link></li>
            <li><Link href="/pricing" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">الأسعار</Link></li>
            <li><Link href="/me" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">حسابي</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-r-2 border-emerald-500 pr-2">للشركات</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/employer" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">انشر وظيفة</Link></li>
            <li><Link href="/pricing" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">باقات الشركات</Link></li>
            <li><Link href="/companies" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">دليل الشركات</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider border-r-2 border-emerald-500 pr-2">المنصة</h4>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">عن المنصة</Link></li>
            <li><Link href="/contact" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">اتصل بنا</Link></li>
            <li><Link href="/privacy" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">سياسة الخصوصية</Link></li>
            <li><Link href="/terms" className="text-navy-300 hover:text-emerald-400 hover:pr-1 transition-all duration-200">الشروط والأحكام</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-800 bg-navy-950/50 relative z-10">
        <div className="container-jo py-6 text-xs text-navy-400 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} {env.SITE_NAME}. جميع الحقوق محفوظة.</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            مشروع مفتوح المصدر — صُمّم في الأردن.
          </span>
        </div>
      </div>
    </footer>
  );
}
