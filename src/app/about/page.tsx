import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FadeInSection } from "@/components/FadeInSection";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "من نحن | جوبز الأردن",
  description: "تعرف على منصة جوبز الأردن، أهدافنا، رؤيتنا وقيمنا في ربط الباحثين عن عمل بأصحاب العمل في كافة محافظات المملكة الأردنية الهاشمية.",
  keywords: ["وظائف الأردن", "من نحن جوبز الأردن", "منصة توظيف أردنية", "فرص عمل في الأردن"],
};

export default async function AboutPage() {
  let stats = { jobs: 0, companies: 0, cities: 12 };

  try {
    const [jobsCount, companiesCount, citiesGroup] = await Promise.all([
      prisma.job.count({ where: { status: "PUBLISHED" } }),
      prisma.company.count(),
      prisma.job.groupBy({ by: ["city"], where: { status: "PUBLISHED" } }),
    ]);

    stats = {
      jobs: jobsCount,
      companies: companiesCount,
      cities: Math.max(12, citiesGroup.length),
    };
  } catch (error) {
    console.error("Failed to load statistics for about page:", error);
  }

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-text-main)] py-12">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden py-16 md:py-24 mb-16 rounded-3xl container-jo text-white" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -left-10 -top-10 w-48 h-48 rounded-full opacity-20 blur-[50px] pointer-events-none" style={{ background: "#4F79FF" }} />
        <div className="absolute right-10 bottom-0 w-64 h-64 rounded-full opacity-25 blur-[60px] pointer-events-none" style={{ background: "#FF6B35" }} />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            منصة توظيف أردنية برؤية عصرية
          </h1>
          <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            نسعى لتمكين الكفاءات الأردنية وتسهيل وصولها لفرص العمل المحلية المناسبة بوضوح وموثوقية، مع احترام خصوصية المستخدمين ومتطلبات السوق الأردني.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="container-jo mb-20">
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          <FadeInSection className="card card-pad flex flex-col justify-between" delay={100}>
            <div>
              <div className="text-3xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-title)]">رسالتنا</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                توفير بيئة توظيف رقمية مباشرة تربط الباحثين عن عمل في الأردن بأصحاب الشركات والمنشآت. نوضح دورنا كمنصة وسيطة، ونقدم أدوات عملية مثل منشئ السيرة الذاتية ومسارات التقديم، مع تسعير معلن وبدون رسوم خفية.
              </p>
            </div>
            <div className="h-1.5 w-20 rounded bg-primary-500 mt-4" />
          </FadeInSection>

          <FadeInSection className="card card-pad flex flex-col justify-between" delay={200}>
            <div>
              <div className="text-3xl mb-4">👁️‍🗨️</div>
              <h2 className="text-2xl font-bold mb-4 text-[var(--color-text-title)]">رؤيتنا</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                أن نكون خياراً موثوقاً للتوظيف في الأردن، مساهمين في تسهيل وصول الباحثين للفرص ومساعدة الأعمال المحلية على استقطاب المرشحين المناسبين عبر قنوات اتصال واضحة في كافة المحافظات.
              </p>
            </div>
            <div className="h-1.5 w-20 rounded bg-accent-500 mt-4" />
          </FadeInSection>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="container-jo mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-title">القيم التي نؤمن بها</h2>
          <div className="section-accent-line mx-auto" />
          <p className="section-sub mt-4">
            نلتزم بمبادئ واضحة تنعكس على جودة الخدمات التي نقدمها لمجتمعنا
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "الشفافية", desc: "نوفر معلومات واضحة حول الوظائف وطرق التقديم وحالة طلبك دون تعقيد.", icon: "🤝" },
            { title: "المحلية", desc: "نركز بالكامل على سوق العمل الأردني وفهم احتياجات الشباب والمنشآت المحلية.", icon: "🇯🇴" },
            { title: "البساطة", desc: "تصميم واجهات سهلة الاستخدام تناسب الجميع على الويب والهواتف الذكية.", icon: "⚡" },
            { title: "الأمان والموثوقية", desc: "نراجع الإعلانات ونقلل البيانات المطلوبة ونمنح المستخدمين حق طلب التعديل أو الحذف.", icon: "🛡️" },
          ].map((val, idx) => (
            <FadeInSection key={idx} className="card card-pad text-center" delay={100 * idx}>
              <div className="text-4xl mb-4">{val.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-[var(--color-text-title)]">{val.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{val.desc}</p>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Why JoJobs? ── */}
      <section className="container-jo mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-title">لماذا جوبز الأردن؟</h2>
          <div className="section-accent-line mx-auto" />
          <p className="section-sub mt-4">
            ميزات متكاملة مصممة خصيصاً لتلبية احتياجات الباحثين عن عمل وأصحاب العمل
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "وظائف محلية موثقة", desc: "فرص عمل في الأردن يتم تحديثها ومراجعة مصدرها قدر الإمكان قبل نشرها.", icon: "✅" },
            { title: "سيرة ذاتية احترافية PDF", desc: "أنشئ سيرتك الذاتية مجاناً وحملها بنقرة واحدة بتصميم جذاب ومتوافق مع نظم التوظيف.", icon: "📄" },
            { title: "تتبع طلبات التقديم", desc: "اعرف حالة طلبك (تم الاستلام، قيد الدراسة، مقبول) مباشرة من لوحة التحكم.", icon: "📊" },
            { title: "فلاتر بحث متقدمة", desc: "ابحث حسب المدينة، المجال، سنوات الخبرة، أو نوع الدوام للوصول لطلبك فوراً.", icon: "🔍" },
            { title: "رمز QR للملف الشخصي", desc: "سيرتك الذاتية مزودة برمز QR فريد يتيح لأصحاب العمل الوصول لملفك المحدث دائماً.", icon: "📱" },
            { title: "تقديم سريع وبسيط", desc: "أرسل ملفك بنقرة زر واحدة للشركات دون الاضطرار لملء نماذج طويلة ومملة.", icon: "🚀" },
          ].map((feat, idx) => (
            <FadeInSection key={idx} className="card card-pad flex gap-4 items-start" delay={50 * idx}>
              <div className="text-2xl p-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-500 shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-bold mb-1.5 text-[var(--color-text-title)]">{feat.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{feat.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="container-jo mb-24 py-12 rounded-3xl" style={{ background: "rgba(79, 121, 255, 0.05)", border: "1px solid rgba(79, 121, 255, 0.1)" }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl md:text-5xl font-black text-primary-500 mb-2">
              {stats.jobs > 0 ? stats.jobs.toLocaleString("ar-JO") : "+١٥٠"}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">وظيفة نشطة وموثقة</div>
          </div>
          <div>
            <div className="text-3xl md:text-5xl font-black text-accent-500 mb-2">
              {stats.companies > 0 ? stats.companies.toLocaleString("ar-JO") : "+٥٠"}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">صاحب عمل وشركة مسجلة</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-3xl md:text-5xl font-black text-emerald-500 mb-2">
              {stats.cities.toLocaleString("ar-JO")}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">محافظة مغطاة في الأردن</div>
          </div>
        </div>
      </section>

      {/* ── Team Section ── */}
      <section className="container-jo mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-title">الفريق خلف المنصة</h2>
          <div className="section-accent-line mx-auto" />
          <p className="section-sub mt-4">
            مجموعة من المطورين والمصممين الأردنيين الشغوفين ببناء حلول تقنية تخدم المجتمع المحلي
          </p>
        </div>

        <div className="card card-pad max-w-3xl mx-auto text-center">
          <p className="leading-relaxed text-gray-600 dark:text-gray-300">
            تأسست منصة <strong>جوبز الأردن</strong> بجهود كفاءات أردنية شابة، لتقديم نموذج مستقل يخدم سوق التوظيف المحلي. نؤمن أن الوصول إلى فرص العمل يجب أن يكون واضحاً وسهلاً قدر الإمكان، ونعمل باستمرار على تحسين المطابقة وحماية البيانات وتجربة المستخدم.
          </p>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="container-jo">
        <div className="card card-pad p-10 md:p-16 text-center relative overflow-hidden" style={{ background: "var(--gradient-footer)" }}>
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full opacity-5 blur-[80px] pointer-events-none bg-blue-500" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-white">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4">هل أنت جاهز للبدء؟</h2>
            <p className="text-gray-300 mb-8 text-sm md:text-base leading-relaxed">
              سواء كنت تبحث عن وظيفتك القادمة في عمان، إربد، الزرقاء أو أي محافظة أخرى، أو كنت صاحب عمل تبحث عن الكفاءات الأردنية المناسبة؛ منصتنا هنا لمساعدتك.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-primary px-8 py-3">
                إنشاء حساب مجاني
              </Link>
              <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3">
                تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
