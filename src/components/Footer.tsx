import Link from "next/link";
import { env } from "@/lib/env";
import { Logo } from "./Logo";

const FOOTER_BRAND_NAME = "جوبز الأردن";

export function Footer() {
  return (
    <footer
      className="relative text-gray-300 mt-20 overflow-hidden"
      style={{ background: "var(--gradient-footer)" }}
    >
      {/* Gradient divider (top) */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent, #4F79FF 40%, #FF6B35 60%, transparent)" }}
      />

      {/* Ambient glows */}
      <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full opacity-10 blur-[80px] pointer-events-none"
           style={{ background: "#1B4FDB" }} />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-64 h-64 rounded-full opacity-8 blur-[90px] pointer-events-none"
           style={{ background: "#7C3AED" }} />

      {/* ── Main grid ─────────────────────────────────────────────── */}
      <div className="container-jo relative z-10 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand column */}
        <div className="flex flex-col justify-between gap-6">
          <div>
            <Logo size="md" variant="light" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              منصة وظائف الأردن — تجمع الفرص المحلية وتساعدك تعمل سيرة ذاتية احترافية وتتابع طلباتك من مكان واحد وبشكل آمن وموثوق.
            </p>
            <a href={`https://wa.me/${env.PLATFORM_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mt-3 transition-colors">
              <span>📱</span> تواصل عبر واتساب
            </a>
            <a href={`mailto:${env.CONTACT_EMAIL}`} className="block text-sm text-gray-400 hover:text-primary-300 mt-1 transition-colors">
              ✉️ {env.CONTACT_EMAIL}
            </a>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-gray-500 font-bold ml-1">تابعنا:</span>
            {[
              { icon: /* X (Twitter) */
                <svg key="x" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
                </svg>, href: "#", label: "تويتر إكس" },
              { icon: /* LinkedIn */
                <svg key="li" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
                </svg>, href: "#", label: "لينكد إن" },
              { icon: /* Facebook */
                <svg key="fb" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>, href: "#", label: "فيسبوك" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:text-primary-400"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links columns */}
        {[
          {
            title: "للباحثين عن عمل",
            links: [
              { href: "/jobs",       label: "تصفّح الوظائف" },
              { href: "/cv-builder", label: "اعمل CV" },
              { href: "/pricing",    label: "الأسعار" },
              { href: "/me",         label: "حسابي" },
            ],
          },
          {
            title: "للشركات",
            links: [
              { href: "/employer",  label: "انشر وظيفة" },
              { href: "/pricing",   label: "باقات الشركات" },
              { href: "/companies", label: "دليل الشركات" },
            ],
          },
          {
            title: "المنصة",
            links: [
              { href: "/about",   label: "عن المنصة" },
              { href: "/contact", label: "اتصل بنا" },
              { href: "/privacy", label: "سياسة الخصوصية" },
              { href: "/terms",   label: "الشروط والأحكام" },
            ],
          },
        ].map((col) => (
          <div key={col.title}>
            <h4
              className="font-bold text-white mb-4 text-sm uppercase tracking-wider pb-2"
              style={{ borderBottom: "2px solid rgba(79,121,255,0.4)" }}
            >
              {col.title}
            </h4>
            <ul className="space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-gray-400 hover:text-primary-300 hover:pr-1.5 transition-all duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────── */}
      <div
        className="relative z-10"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)" }}
      >
        <div className="container-jo py-5 text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>© {new Date().getFullYear()} {FOOTER_BRAND_NAME}. جميع الحقوق محفوظة.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            منصة محلية أردنية — صُمّم بحب في الأردن 🇯🇴
          </span>
        </div>
      </div>
    </footer>
  );
}
