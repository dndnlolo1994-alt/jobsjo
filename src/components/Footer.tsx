import Link from "next/link";
import { env } from "@/lib/env";
import { Logo } from "./Logo";
import { WHATSAPP_NUMBER } from "@/lib/constants";

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
              منصة جوبز الأردن — تجمع الفرص المحلية وتساعدك تعمل سيرة ذاتية احترافية وتتابع طلباتك من مكان واحد وبشكل آمن وموثوق.
            </p>
            <a href={`https://wa.me/${env.PLATFORM_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mt-3 transition-colors">
              <span>📱</span> تواصل عبر واتساب
            </a>
            <a href={`mailto:${env.CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary-300 mt-1 transition-colors group">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span className="underline underline-offset-2 decoration-gray-600 group-hover:decoration-primary-400">{env.CONTACT_EMAIL}</span>
            </a>
          </div>

          {/* Contact Text */}
          <div className="text-xs text-gray-400 leading-relaxed font-semibold">
            تواصل معنا: info@jordan-job.shop | واتساب: {WHATSAPP_NUMBER}+
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
