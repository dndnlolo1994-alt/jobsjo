import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/JobCard";
import { Badge } from "@/components/Badge";
import { JOB_CATEGORIES, JORDAN_CITIES } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  let featured: any[] = [];
  let stats = { jobs: 0, companies: 0, applications: 0 };
  try {
    const [items, j, c, a] = await Promise.all([
      prisma.job.findMany({
        where: { status: "PUBLISHED" },
        include: { company: { select: { name: true, logoUrl: true, slug: true } } },
        orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
        take: 6,
      }),
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.company.count(),
      prisma.application.count(),
    ]);
    featured = items;
    stats = { jobs: j, companies: c, applications: a };
  } catch {
    // قاعدة البيانات غير جاهزة بعد. نعرض الصفحة بدون أرقام.
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white py-12 sm:py-16 lg:py-20 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container-jo grid lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Right Column: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
            <Badge className="bg-sand-400 text-navy-900 mb-4 w-fit">منصة الأردن للوظائف</Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight max-w-2xl">
              وظائف الأردن القريبة منك — وقدّم بسيرة ذاتية جاهزة
            </h1>
            <p className="text-navy-100 mt-4 sm:text-lg max-w-2xl">
              منصة تجمع الوظائف المحلية، تساعدك تعمل CV احترافي PDF،
              وتتابع طلباتك من مكان واحد.
            </p>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-3 mt-7 max-w-xl">
              <Link href="/jobs" className="btn bg-emerald-500 hover:bg-emerald-600 text-white">
                ابحث عن وظيفة
              </Link>
              <Link href="/cv-builder" className="btn bg-sand-400 hover:bg-sand-500 text-navy-900">
                اعمل CV الآن
              </Link>
              <Link href="/employer" className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20">
                انشر وظيفة
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-10 max-w-xl">
              <Stat label="وظائف منشورة" value={stats.jobs.toLocaleString("ar-JO")} />
              <Stat label="شركات" value={stats.companies.toLocaleString("ar-JO")} />
              <Stat label="طلبات تقديم" value={stats.applications.toLocaleString("ar-JO")} />
            </div>
            <p className="text-[10px] text-navy-300 mt-4 font-semibold text-center sm:text-right opacity-80">
              ⚡ وظائف أردنية موثوقة ومحدثة على مدار الساعة
            </p>
          </div>

          {/* Left Column: Dedicated Jordanian Workspace Image */}
          <div className="lg:col-span-5 w-full flex justify-center mb-6 lg:mb-0 order-1 lg:order-2">
            <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/3] sm:aspect-[16/11] rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-navy-950/50 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/hero-jojobs.png" 
                alt="مكتب العمل والتوظيف بالأردن" 
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/30 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="surface-band border-b border-navy-100">
        <div className="container-jo py-10">
        <h2 className="section-title">تصفّح حسب المدينة</h2>
        <p className="section-sub">ابدأ من مدينتك ووسّع البحث لاحقاً</p>
        <div className="flex flex-wrap gap-2">
          {JORDAN_CITIES.map((c) => (
            <Link
              key={c}
              href={`/jobs?city=${encodeURIComponent(c)}`}
              className="px-3 py-2 rounded-full bg-white border border-navy-100 text-sm font-semibold text-navy-700 hover:border-emerald-300 hover:text-emerald-700"
            >
              {c}
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* Featured jobs */}
      <section className="container-jo py-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="section-title">وظائف مختارة</h2>
            <p className="section-sub">أحدث الوظائف المنشورة</p>
          </div>
          <Link href="/jobs" className="link text-sm font-semibold">عرض الكل ←</Link>
        </div>
        {featured.length === 0 ? (
          <div className="card-pad text-center text-navy-500">
            لا توجد وظائف بعد. عُد لاحقاً أو شغّل seed لإضافة بيانات تجريبية.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {featured.map((j) => <JobCard key={j.id} job={j} />)}
          </div>
        )}
      </section>

      {/* Problem / Solution */}
      <section className="bg-white border-y border-navy-100">
        <div className="container-jo py-12 grid lg:grid-cols-2 gap-10">
          <div>
            <Badge variant="danger" className="mb-3">المشكلة</Badge>
            <h2 className="section-title">الباحث عن عمل في الأردن يواجه:</h2>
            <ul className="space-y-3 text-navy-700">
              <Bullet>لا يوجد CV مرتب وجاهز</Bullet>
              <Bullet>الوظائف موزّعة بين فيسبوك وواتساب ومواقع مختلفة</Bullet>
              <Bullet>صعوبة معرفة أين قدّم وما وصل من ردود</Bullet>
              <Bullet>الشركات لا ترد ولا تعطي تحديثات</Bullet>
            </ul>
          </div>
          <div>
            <Badge variant="success" className="mb-3">الحل</Badge>
            <h2 className="section-title">جوبز الأردن تجمع كل شيء بمكان واحد:</h2>
            <ul className="space-y-3 text-navy-700">
              <Bullet good>وظائف منظمة وقابلة للفلترة</Bullet>
              <Bullet good>سيرة ذاتية جاهزة وقابلة للتنزيل PDF</Bullet>
              <Bullet good>تقديم سريع داخل المنصة أو عبر واتساب</Bullet>
              <Bullet good>تتبّع لكل الطلبات وحالة كل واحدة</Bullet>
              <Bullet good>نسبة مطابقة ذكية لكل وظيفة</Bullet>
            </ul>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-jo py-10">
        <h2 className="section-title">تصنيفات الوظائف</h2>
        <p className="section-sub">القطاعات الأكثر طلباً في الأردن</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {JOB_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/jobs?category=${encodeURIComponent(c)}`}
              className="card-pad text-center hover:border-emerald-300 hover:text-emerald-700 font-semibold"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Who we serve */}
      <section className="bg-white border-y border-navy-100">
        <div className="container-jo py-12 grid md:grid-cols-3 gap-6">
          <Persona
            title="للأشخاص"
            description="طلاب، خريجون جدد، عمّال، باحثون عن دوام جزئي، نساء يبحثن عن عمل مرن، وأصحاب مهارات يدوية أو مكتبية."
            cta={<Link className="link text-sm" href="/register">سجّل كباحث عمل</Link>}
            icon="🧑‍💼"
          />
          <Persona
            title="للشركات"
            description="محلات، مطاعم، مصانع، مستودعات، صيدليات، عيادات، مدارس، شركات صغيرة، وصفحات تجارة إلكترونية."
            cta={<Link className="link text-sm" href="/employer">انشر وظيفتك</Link>}
            icon="🏢"
          />
          <Persona
            title="للمنصة"
            description="فريق إدارة محلي ينظّم الوظائف، يتحقق من الشركات، ويساعد على ربط المرشحين بأصحاب العمل."
            cta={<Link className="link text-sm" href="/about">اعرف أكثر</Link>}
            icon="🛡️"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="container-jo py-12">
        <h2 className="section-title">كيف تعمل المنصة؟</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Step n={1} title="سجّل حساب" text="اختر إن كنت باحث عمل أو صاحب شركة." />
          <Step n={2} title="جهّز ملفك" text="باحث: اعمل CV. شركة: عبّي بيانات الشركة." />
          <Step n={3} title="تقدّم أو انشر" text="باحث: تقدّم لوظائف. شركة: انشر وظيفة." />
          <Step n={4} title="تابع الحالة" text="شوف وضع الطلبات والمراسلات في مكان واحد." />
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-navy-900 text-white">
        <div className="container-jo py-12 grid md:grid-cols-3 gap-6">
          <Plan title="مجاني" price="0 د" features={["تصفّح الوظائف", "حساب باحث عمل", "حفظ وظائف محدود"]} />
          <Plan title="Plus للباحث" price="2 د/شهر" features={["CV PDF", "تقديم بدون حدود", "تنبيهات وظائف", "تتبّع الطلبات"]} highlight />
          <Plan title="نشر وظيفة" price="من 5 د" features={["إعلان عادي 5 د", "مميّز 10 د", "عاجل/مثبّت 15 د"]} />
        </div>
        <div className="container-jo pb-12 text-center">
          <Link href="/pricing" className="btn bg-sand-400 hover:bg-sand-500 text-navy-900">شاهد كل الأسعار</Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-jo py-12">
        <h2 className="section-title">أسئلة شائعة</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Faq q="هل المنصة مجانية؟" a="نعم، التصفّح والتسجيل والتقديم بشكل أساسي مجاني. الميزات المتقدمة (مثل تنزيل CV PDF أو نشر إعلان للشركة) مدفوعة برسوم رمزية." />
          <Faq q="كيف أدفع؟" a="حالياً الدفع يدوي عبر نقد، CliQ، أو حوالة بنكية. الفريق يتواصل معك ويفعّل الخدمة بعد التحقق." />
          <Faq q="هل بياناتي محمية؟" a="نخزّن فقط ما تحتاجه المنصة لتقديم الخدمة، ولا نعرض رقم هاتفك علناً إلا إذا اخترت ذلك." />
          <Faq q="هل أقدر أحذف حسابي؟" a="نعم، يمكنك طلب حذف حسابك في أي وقت من إعدادات الحساب أو بالتواصل معنا." />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300">
      <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{value}</div>
      <div className="text-[10px] sm:text-xs text-slate-300 mt-1 font-medium">{label}</div>
    </div>
  );
}

function Bullet({ children, good }: { children: React.ReactNode; good?: boolean }) {
  return (
    <li className="flex gap-2.5 items-start text-sm">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
        good ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
      }`}>
        {good ? "✓" : "✗"}
      </span>
      <span className="text-slate-700 font-medium">{children}</span>
    </li>
  );
}

function Persona({ title, description, cta, icon }: any) {
  return (
    <div className="card-pad hover:border-emerald-100 hover:shadow-md transition-all duration-300 group hover:-translate-y-1">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">{icon}</div>
      <h3 className="font-extrabold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors text-base">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-5">{description}</p>
      <div className="border-t border-slate-100 pt-3">{cta}</div>
    </div>
  );
}

function Step({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="card-pad hover:border-emerald-100 hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 grid place-items-center font-extrabold text-lg mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm border border-emerald-100/50">
        {n}
      </div>
      <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">{title}</h3>
      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{text}</p>
    </div>
  );
}

function Plan({ title, price, features, highlight }: any) {
  return (
    <div className={`rounded-2xl p-7 flex flex-col justify-between transition-all duration-300 ${
      highlight 
        ? "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xl shadow-emerald-950/20 hover:scale-[1.02] border border-emerald-500/20" 
        : "bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm hover:bg-slate-800/60"
    }`}>
      <div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold tracking-wider uppercase opacity-95">{title}</span>
          {highlight && <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">الأكثر طلباً</span>}
        </div>
        <div className="text-4xl font-extrabold mt-3">{price}</div>
        <ul className="mt-6 space-y-2.5 text-xs">
          {features.map((f: string) => (
            <li key={f} className="flex gap-2 items-center opacity-90">
              <span className={highlight ? "text-amber-300" : "text-emerald-400 font-bold"}>✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="card-pad hover:border-emerald-100 hover:shadow-sm transition-all duration-200">
      <h3 className="font-bold text-slate-900 flex items-start gap-2 text-sm sm:text-base">
        <span className="text-emerald-600">Q.</span>
        <span>{q}</span>
      </h3>
      <p className="text-xs text-slate-600 mt-2 pr-6 leading-relaxed">{a}</p>
    </div>
  );
}
