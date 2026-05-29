import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/JobCard";
import { Badge } from "@/components/Badge";
import { FadeInSection } from "@/components/FadeInSection";
import { JOB_CATEGORIES, JORDAN_CITIES } from "@/lib/utils";
import { publicMetadata } from "@/lib/seo/site";

export const metadata: Metadata = publicMetadata({
  title: "جوبز الأردن — وظائف الأردن الشاغرة",
  description: "جوبز الأردن منصة توظيف محلية تساعد الباحثين عن عمل في الأردن على تصفح الوظائف وإنشاء CV احترافي، وتساعد الشركات على نشر فرص العمل واستقبال الطلبات.",
  path: "/",
  keywords: ["وظائف الأردن", "فرص عمل في الأردن", "وظائف عمان", "توظيف الأردن", "سيرة ذاتية"],
});

export const revalidate = 3600;

export default async function HomePage() {
  let featured: any[] = [];
  let stats = { jobs: 0, companies: 0, cities: 0 };
  let cityCounts: Record<string, number> = {};
  let categoryCounts: Record<string, number> = {};

  try {
    const [items, j, c, cities, categories] = await Promise.all([
      prisma.job.findMany({
        where: { status: "PUBLISHED" },
        include: { company: { select: { name: true, logoUrl: true, slug: true } } },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 6,
      }),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.company.count(),
      prisma.job.groupBy({ by: ["city"], where: { status: "PUBLISHED" }, _count: { _all: true } }),
      prisma.job.groupBy({ by: ["jobCategory"], where: { status: "PUBLISHED" }, _count: { _all: true } }),
    ]);
    featured = items;
    stats = { jobs: j, companies: c, cities: cities.length };
    cityCounts     = Object.fromEntries(cities.map((x) => [x.city, x._count._all]));
    categoryCounts = Object.fromEntries(categories.map((x) => [x.jobCategory, x._count._all]));
  } catch (e) {
    console.error("Failed to load homepage:", e);
  }

  return (
    <>
      {/* ══════════════════════════════════════════════════════════
          HERO — Full-bleed responsive background
         ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "#06091F" }}
      >
        {/* ── Background image — cover for both mobile and desktop ── */}
        <div className="relative w-full min-h-[55vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[75vh]" style={{ maxHeight: "85vh" }}>
          <Image
            src="/images/hero-jojobs.png"
            alt="مكتب حديث في الأردن لاستخدام منصة جوبز الأردن"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: "center 35%" }}
          />

          {/* ── Overlays ── */}
          {/* Desktop: RTL gradient — dark on right (text side) → fade to left (image side) */}
          <div
            className="absolute inset-0 hidden sm:block"
            style={{
              background:
                "linear-gradient(to left, rgba(6,9,31,0.92) 0%, rgba(6,9,31,0.75) 30%, rgba(6,9,31,0.35) 55%, rgba(6,9,31,0.15) 80%, rgba(6,9,31,0.05) 100%)",
            }}
          />
          {/* Mobile: stronger overlay for readability */}
          <div
            className="absolute inset-0 sm:hidden"
            style={{ background: "linear-gradient(to top, rgba(6,9,31,0.95) 0%, rgba(6,9,31,0.75) 40%, rgba(6,9,31,0.55) 100%)" }}
          />

          {/* Bottom fade to match section bg */}
          <div
            className="absolute inset-x-0 bottom-0 h-24 sm:h-32 pointer-events-none"
            style={{
              background: "linear-gradient(to top, #06091F 0%, transparent 100%)",
            }}
          />

          {/* ── Content — centered on mobile, right-aligned on desktop ─── */}
          <div className="absolute inset-0 flex items-center sm:items-end">
            <div className="container-jo w-full py-8 sm:pb-14 sm:pt-0">
              {/* Text block — full-width centered on mobile, right half on desktop (RTL) */}
              <div className="max-w-xl w-full sm:w-3/5 lg:w-1/2 text-center sm:text-right mx-auto sm:mx-0">

            {/* Social proof bar */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 mb-5 sm:mb-7 text-sm">
              <StatPill value={stats.jobs.toLocaleString("ar-JO")} label="وظيفة منشورة" />
              <Divider />
              <StatPill value={stats.companies.toLocaleString("ar-JO")} label="شركة مسجلة" />
            </div>

            <h1
              className="font-extrabold leading-[1.15] text-white drop-shadow-md"
              style={{
                fontSize: "clamp(1.75rem, 5vw, 4.5rem)",
                fontFamily: "var(--font-tajawal), sans-serif",
              }}
            >
              وظائف الأردن
              <span className="block" style={{ color: "#FF8C6B" }}>
                القريبة منك
              </span>
            </h1>

            <p className="text-white/80 mt-3 sm:mt-5 text-sm sm:text-base md:text-lg max-w-md leading-relaxed drop-shadow-sm mx-auto sm:mx-0">
              منصة تجمع الوظائف المحلية، تساعدك تعمل CV احترافي PDF،
              وتتابع طلباتك من مكان واحد.
            </p>

            {/* CTA row — stacked on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6 sm:mt-8">
              <Link href="/jobs" className="btn-primary pulse-glow text-sm sm:text-base">
                🔍 ابحث عن وظيفة
              </Link>
              <Link
                href="/cv-builder"
                className="btn border-2 border-white/50 text-white hover:bg-white/15 rounded-full text-sm sm:text-base"
              >
                📄 اعمل CV الآن
              </Link>
              <Link
                href="/employer"
                className="btn text-white/65 hover:text-white hover:bg-white/10 rounded-full text-xs sm:text-sm"
              >
                🏢 انشر وظيفة
              </Link>
            </div>

            <p className="text-[11px] text-white/40 mt-4 sm:mt-5 font-semibold">
              ⚡ وظائف أردنية موثوقة ومحدثة على مدار الساعة
            </p>
              </div>  {/* max-w-xl text block */}
            </div>    {/* container-jo */}
          </div>      {/* absolute inset-0 content */}
        </div>        {/* min-h wrapper */}
      </section>

      {/* ══════════════════════════════════════════════════════════
          CITIES — Pill chips
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="surface-band border-b" style={{ borderColor: "var(--color-border)" }}>
          <div className="container-jo py-10">
            <div className="section-accent-line" />
            <h2 className="section-title">تصفّح حسب المدينة</h2>
            <p className="section-sub">ابدأ من مدينتك ووسّع البحث لاحقاً</p>
            <div
              className="flex flex-wrap gap-2 overflow-x-auto pb-1"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {JORDAN_CITIES.map((city) => (
                <Link
                  key={city}
                  href={`/jobs?city=${encodeURIComponent(city)}`}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E5E8F0] text-sm font-semibold text-[#1A1D2E] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50"
                >
                  <span>📍</span>
                  <span>{city}</span>
                  {cityCounts[city] ? (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}
                    >
                      {(cityCounts[city]).toLocaleString("ar-JO")}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          FEATURED JOBS
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="container-jo py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="section-accent-line" />
              <h2 className="section-title">وظائف مختارة</h2>
              <p className="section-sub">أحدث الوظائف المنشورة على المنصة</p>
            </div>
            <Link href="/jobs" className="link text-sm font-bold">
              عرض الكل ←
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="card-pad text-center" style={{ color: "var(--color-muted)" }}>
              لا توجد وظائف بعد — ترقّب أحدث الفرص قريباً!
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 stagger-children">
              {featured.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          )}
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          PROBLEM / SOLUTION
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="bg-white border-y" style={{ borderColor: "var(--color-border)" }}>
          <div className="container-jo py-16 grid lg:grid-cols-2 gap-10">
            <div>
              <Badge variant="danger" className="mb-3">المشكلة</Badge>
              <h2 className="section-title">الباحث عن عمل في الأردن يواجه:</h2>
              <ul className="space-y-3.5">
                <Bullet>لا يوجد CV مرتب وجاهز</Bullet>
                <Bullet>الوظائف موزّعة بين فيسبوك وواتساب ومواقع مختلفة</Bullet>
                <Bullet>صعوبة معرفة أين قدّم وما وصل من ردود</Bullet>
                <Bullet>الشركات لا ترد ولا تعطي تحديثات</Bullet>
              </ul>
            </div>
            <div>
              <Badge variant="success" className="mb-3">الحل</Badge>
              <h2 className="section-title">جوبز الأردن تجمع كل شيء بمكان واحد:</h2>
              <ul className="space-y-3.5">
                <Bullet good>وظائف منظمة وقابلة للفلترة</Bullet>
                <Bullet good>سيرة ذاتية جاهزة وقابلة للتنزيل PDF</Bullet>
                <Bullet good>تقديم سريع داخل المنصة أو عبر واتساب</Bullet>
                <Bullet good>تتبّع لكل الطلبات وحالة كل واحدة</Bullet>
                <Bullet good>نسبة مطابقة ذكية لكل وظيفة</Bullet>
              </ul>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          CATEGORIES — Icon cards grid
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="container-jo py-14">
          <div className="section-accent-line" />
          <h2 className="section-title">تصنيفات الوظائف</h2>
          <p className="section-sub">القطاعات الأكثر طلباً في الأردن</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {JOB_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] ?? 0;
              return (
                <Link
                  key={cat}
                  href={`/jobs?category=${encodeURIComponent(cat)}`}
                  className="card p-5 text-center font-semibold text-sm transition-all duration-200 hover:-translate-y-1 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700"
                  style={{ color: "var(--color-text)" }}
                >
                  <div className="mb-1.5 text-lg">💼</div>
                  <div className="leading-snug">{cat}</div>
                  {count > 0 && (
                    <div className="text-[11px] font-bold mt-1.5 text-primary-500">
                      {count.toLocaleString("ar-JO")} وظيفة
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          WHO WE SERVE
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="bg-white border-y" style={{ borderColor: "var(--color-border)" }}>
          <div className="container-jo py-14 grid md:grid-cols-3 gap-6">
            <Persona
              title="للأشخاص"
              description="طلاب، خريجون جدد، عمّال، باحثون عن دوام جزئي، باحثون عن عمل مرن، وأصحاب مهارات يدوية أو مكتبية."
              cta={<Link className="link text-sm font-bold" href="/register">سجّل كباحث عمل ←</Link>}
              icon="🧑‍💼"
              accent="#EBF0FF"
              accentText="#1B4FDB"
            />
            <Persona
              title="للشركات"
              description="محلات، مطاعم، مصانع، مستودعات، صيدليات، عيادات، مدارس، شركات صغيرة، وصفحات تجارة إلكترونية."
              cta={<Link className="link text-sm font-bold" href="/employer">انشر وظيفتك ←</Link>}
              icon="🏢"
              accent="#FFF0EB"
              accentText="#E85A22"
            />
            <Persona
              title="للمنصة"
              description="فريق إدارة محلي ينظّم الوظائف، يتحقق من الشركات، ويساعد على ربط المرشحين بأصحاب العمل."
              cta={<Link className="link text-sm font-bold" href="/about">اعرف أكثر ←</Link>}
              icon="🛡️"
              accent="#F0FDF4"
              accentText="#059669"
            />
          </div>
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          HOW IT WORKS — Timeline
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="container-jo py-16">
          <div className="section-accent-line" />
          <h2 className="section-title">كيف تعمل المنصة؟</h2>
          <p className="section-sub">أربع خطوات بسيطة تفصلك عن وظيفتك القادمة</p>

          {/* Desktop: horizontal timeline | Mobile: vertical cards */}
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {/* Connector line (desktop only) */}
            <div
              className="hidden lg:block absolute top-[28px] right-[12.5%] left-[12.5%] h-[2px] -translate-y-1/2"
              style={{ background: "linear-gradient(90deg, #1B4FDB, #4F79FF, #7C3AED)" }}
            />
            <Step n={1} title="سجّل حساب"  text="اختر إن كنت باحث عمل أو صاحب شركة." />
            <Step n={2} title="جهّز ملفك"  text="باحث: اعمل CV. شركة: عبّي بيانات الشركة." />
            <Step n={3} title="تقدّم أو انشر" text="باحث: تقدّم لوظائف. شركة: انشر وظيفة." />
            <Step n={4} title="تابع الحالة" text="شوف وضع الطلبات والمراسلات في مكان واحد." />
          </div>
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          PRICING — Cards
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section style={{ background: "#1A1D2E" }}>
          <div className="container-jo py-16">
            <div className="text-center mb-10">
              <div
                className="inline-block w-10 h-1 rounded-full mb-3"
                style={{ background: "var(--gradient-accent)" }}
              />
              <h2
                className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
                style={{ fontFamily: "var(--font-tajawal), sans-serif" }}
              >
                خطط بسيطة وشفافة
              </h2>
              <p className="text-gray-400 text-sm">عروض ترويجية بمناسبة عيد الاستقلال — ابدأ مجاناً، وترقّى عندما تحتاج</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Plan
                title="مجاني"
                price="0 د"
                promo="عرض عيد الاستقلال: كان 1 د وأصبح 0 د"
                features={["كان 1 د والآن 0 د", "تصفّح الوظائف", "حساب باحث عمل", "حفظ وظائف محدود"]}
              />
              <Plan
                title="Plus للباحث"
                price="2 د/شهر"
                promo="عرض عيد الاستقلال: كان 4 د وأصبح 2 د"
                features={["كان 4 د والآن 2 د", "CV PDF", "تقديم بدون حدود", "تنبيهات وظائف", "تتبّع الطلبات"]}
                highlight
              />
              <Plan
                title="نشر وظيفة"
                price="من 5 د"
                promo="عرض عيد الاستقلال: كان 8 د وأصبح 5 د"
                features={["كان 8 د والآن 5 د", "إعلان عادي 5 د", "مميّز 10 د", "عاجل/مثبّت 15 د"]}
              />
            </div>

            <div className="text-center mt-10">
              <Link href="/pricing" className="btn-primary">
                شاهد كل الأسعار
              </Link>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* ══════════════════════════════════════════════════════════
          FAQ
         ══════════════════════════════════════════════════════════ */}
      <FadeInSection>
        <section className="container-jo py-14">
          <div className="section-accent-line" />
          <h2 className="section-title">أسئلة شائعة</h2>
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Faq
              q="هل المنصة مجانية؟"
              a="نعم، التصفّح والتسجيل والتقديم بشكل أساسي مجاني. الميزات المتقدمة (مثل تنزيل CV PDF أو نشر إعلان للشركة) مدفوعة برسوم رمزية."
            />
            <Faq
              q="كيف أدفع؟"
              a="حالياً الدفع يدوي عبر نقد، CliQ، أو حوالة بنكية. الفريق يتواصل معك ويفعّل الخدمة بعد التحقق."
            />
            <Faq
              q="هل بياناتي محمية؟"
              a="نخزّن فقط ما تحتاجه المنصة لتقديم الخدمة، ولا نعرض رقم هاتفك علناً إلا إذا اخترت ذلك."
            />
            <Faq
              q="هل أقدر أحذف حسابي؟"
              a="نعم، يمكنك طلب حذف حسابك في أي وقت من إعدادات الحساب أو بالتواصل معنا."
            />
          </div>
        </section>
      </FadeInSection>
    </>
  );
}

/* ================================================================
   HELPER COMPONENTS
   ================================================================ */

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <span className="text-xs sm:text-sm text-white/70 font-medium">
      <strong className="font-extrabold" style={{ color: "#FF8C6B" }}>{value}</strong>{" "}
      {label}
    </span>
  );
}

function Divider() {
  return <span className="w-px h-3 bg-white/20 hidden sm:inline-block" />;
}

function Bullet({ children, good }: { children: React.ReactNode; good?: boolean }) {
  return (
    <li className="flex gap-3 items-start text-sm">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
          good
            ? "bg-emerald-50 text-emerald-600"
            : "bg-rose-50 text-rose-500"
        }`}
      >
        {good ? "✓" : "✗"}
      </span>
      <span className="font-medium" style={{ color: "var(--color-text)" }}>
        {children}
      </span>
    </li>
  );
}

function Persona({
  title, description, cta, icon, accent, accentText,
}: {
  title: string; description: string; cta: React.ReactNode;
  icon: string; accent: string; accentText: string;
}) {
  return (
    <div className="card p-6 sm:p-7 group hover:-translate-y-1.5 transition-all duration-300">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform duration-300 group-hover:scale-110 border"
        style={{ background: accent, borderColor: `${accentText}20` }}
      >
        {icon}
      </div>
      <h3 className="font-extrabold mb-2 text-base" style={{ color: "var(--color-text)" }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed mb-5" style={{ color: "var(--color-muted)" }}>
        {description}
      </p>
      <div className="border-t pt-3" style={{ borderColor: "var(--color-border)" }}>
        {cta}
      </div>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="card p-6 group hover:-translate-y-1 transition-all duration-300 relative z-10">
      <div
        className="w-14 h-14 rounded-2xl grid place-items-center font-extrabold text-xl mb-4 transition-all duration-300 group-hover:scale-105 shadow-md"
        style={{
          background: "linear-gradient(135deg, #1B4FDB, #4F79FF)",
          color: "white",
          boxShadow: "0 4px 14px rgba(27,79,219,0.35)",
        }}
      >
        {n}
      </div>
      <h3 className="font-bold mb-1.5" style={{ color: "var(--color-text)" }}>
        {title}
      </h3>
      <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {text}
      </p>
    </div>
  );
}

function Plan({
  title, price, features, promo, highlight,
}: {
  title: string; price: string; features: string[]; promo?: string; highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div
        className="relative rounded-2xl p-[2px] shadow-2xl"
        style={{ background: "linear-gradient(135deg, #FF6B35, #1B4FDB, #7C3AED)" }}
      >
        {/* "Most popular" badge */}
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold text-white whitespace-nowrap shadow-lg"
          style={{ background: "var(--gradient-accent)" }}
        >
          ★ الأكثر طلباً
        </div>
        <div
          className="rounded-[14px] p-7 flex flex-col h-full"
          style={{ background: "#1E2235" }}
        >
          <div className="text-xs font-bold tracking-wider uppercase text-white/60 mb-1">{title}</div>
          <div className="text-4xl font-extrabold text-white mt-2 mb-6">{price}</div>
          {promo && (
            <div className="mb-4 rounded-xl border border-accent-400/25 bg-accent-400/10 px-3 py-2 text-[11px] font-extrabold leading-5 text-accent-200">
              {promo}
            </div>
          )}
          <ul className="space-y-3 text-sm flex-1">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-white/80">
                <span className="text-accent-400 font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-7 flex flex-col border transition-all duration-300 hover:border-primary-700/50"
      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div className="text-xs font-bold tracking-wider uppercase text-gray-400 mb-1">{title}</div>
      <div className="text-4xl font-extrabold text-white mt-2 mb-6">{price}</div>
      {promo && (
        <div className="mb-4 rounded-xl border border-accent-400/20 bg-white/5 px-3 py-2 text-[11px] font-extrabold leading-5 text-accent-200">
          {promo}
        </div>
      )}
      <ul className="space-y-3 text-sm flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-gray-400">
            <span className="text-primary-400 font-bold">✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="card p-6 hover:shadow-md transition-all duration-200">
      <h3 className="font-bold flex items-start gap-2 text-sm sm:text-base" style={{ color: "var(--color-text)" }}>
        <span className="text-accent-400 font-extrabold shrink-0">؟</span>
        <span>{q}</span>
      </h3>
      <p className="text-xs mt-2 pr-6 leading-relaxed" style={{ color: "var(--color-muted)" }}>
        {a}
      </p>
    </div>
  );
}
