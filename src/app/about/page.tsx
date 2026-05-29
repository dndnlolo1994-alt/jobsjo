import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FadeInSection } from "@/components/FadeInSection";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { publicMetadata } from "@/lib/seo/site";
import { env } from "@/lib/env";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export const metadata: Metadata = publicMetadata({
  title: "قصتنا | جوبز الأردن — منصة وظائف أردنية شفافة",
  description: "جوبز الأردن بنيت من الأردن وللأردن. قصة شاب أردني مقيم في ألمانيا قرر يبني منصة شفافة تستحقها بلده.",
  path: "/about",
});

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

  const supportWhatsapp = env.SUPPORT_WHATSAPP || WHATSAPP_NUMBER;
  const contactEmail = env.CONTACT_EMAIL || "info@jordan-job.shop";

  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-text)] py-12">
      <BreadcrumbJsonLd items={[{ name: "قصتنا", path: "/about" }]} />

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 md:py-28 mb-16 rounded-3xl container-jo text-white shadow-xl" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -left-10 -top-10 w-72 h-72 rounded-full opacity-20 blur-[80px] pointer-events-none bg-white animate-pulse" />
        <div className="absolute right-10 bottom-0 w-80 h-80 rounded-full opacity-25 blur-[100px] pointer-events-none" style={{ background: "var(--color-accent)" }} />
        
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold tracking-wide uppercase mb-6 backdrop-blur-sm border border-white/10">
            🇯🇴 من الأردن وإلى الأردن
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            قصتنا.. رحلة لبناء الشفافية
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-light">
            كيف بدأت فكرة منصة "جوبز الأردن" وكيف نسعى لتغيير تجربة البحث عن عمل وتمكين الكفاءات الأردنية بكل صدق ووضوح.
          </p>
        </div>
      </section>

      {/* ── The Story (التأسيس) ── */}
      <section className="container-jo mb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm tracking-wider uppercase">
              <span className="w-8 h-0.5 bg-primary-600 rounded-full"></span>
              بداية الفكرة
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--color-text)] tracking-tight leading-snug">
              من بلاد الغربة، ولدت فكرة تخدم الوطن
            </h2>
            
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              بدأت القصة مع شاب أردني مغترب ومقيم في ألمانيا. كأي مغترب، بقي قلبه وفكره معلقين بالوطن، يتابع تفاصيل حياة الشباب الأردني وتحدياتهم اليومية، وعلى رأسها البحث عن فرصة عمل كريمة ومستقرة.
            </p>
            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              شاهد كيف يعاني الخريجون وأصحاب الخبرات للوصول إلى إعلانات حقيقية للتوظيف، وكيف تمتلئ بعض المنصات بإعلانات مضللة أو مبهمة، أو تفرض مبالغ خيالية على أصحاب الأعمال الصغار لنشر شواغرهم، مما يقلل الفرص أمام الجميع.
            </p>

            <blockquote className="border-r-4 border-[var(--color-accent)] pr-6 my-6 py-2 italic text-lg text-gray-800 dark:text-gray-100 bg-[var(--color-accent-soft)] rounded-l-2xl font-medium leading-relaxed">
              &ldquo;أردنا بناء منصة تخدم الأردنيين بكرامة ووضوح، دون شروط مخفية أو استغلال لبياناتهم الشخصية. منصة تليق ببلدنا وكفاءاتنا.&rdquo;
            </blockquote>

            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
              من هنا، تقرر استغلال الخبرات التقنية المكتسبة في الخارج لبناء منصة توظيف حديثة، شفافة بالكامل، تحترم خصوصية المستخدم، وتجمع شمل الشركات والباحثين عن العمل في الأردن بضغطة زر واحدة.
            </p>
          </div>
          
          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-accent-500/10 rounded-3xl transform rotate-3 scale-102 blur-sm"></div>
            <div className="card card-pad relative bg-white/80 dark:bg-slate-900/80 backdrop-blur border border-blue-100 dark:border-slate-800/60 p-8 rounded-3xl space-y-6 shadow-lg">
              <div className="text-center pb-4 border-b border-gray-100 dark:border-slate-800">
                <span className="text-4xl">🚀</span>
                <h3 className="font-bold text-xl mt-3 text-primary-600 dark:text-primary-400">تطور جوبز الأردن</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">الفكرة (ألمانيا)</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ملاحظة الفجوة في سوق التوظيف وتصميم نموذج أولي يركز على الشفافية.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">بناء النظام</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تطوير المنصة بأحدث التقنيات SSR و SEO لضمان أقصى انتشار للوظائف مجاناً.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">الإطلاق في الأردن</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">تقديم خدمات التوظيف وباني السيرة الذاتية الاحترافية للآلاف في المملكة.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Vision Statement (الحلم والهدف) ── */}
      <section className="relative py-20 mb-24 overflow-hidden rounded-3xl container-jo bg-[#1A1D2E] text-white shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full opacity-10 blur-[90px] pointer-events-none bg-blue-500" />
        <div className="absolute left-0 bottom-0 w-80 h-80 rounded-full opacity-10 blur-[80px] pointer-events-none bg-purple-500" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-block px-4 py-1 rounded-full bg-accent-500/20 text-[var(--color-accent)] text-xs font-bold border border-accent-500/20">
            رؤيتنا للمستقبل
          </div>
          <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
            جوبز الأردن اليوم — منصة وظائف.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              جوبز الأردن غداً — معيار الشفافية في سوق العمل الأردني.
            </span>
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-6 text-base text-gray-300 leading-relaxed font-light">
            <p className="text-lg md:text-xl text-white font-medium">
              &ldquo;حلمنا أن يصبح الأردن مثالاً يُحتذى به في المنطقة، وأن يقول الشاب العربي: 'أريد أن أعمل في الأردن لأن الأمور هناك واضحة وعادلة.'&rdquo;
            </p>
            <p className="text-sm">
              هذا ليس حلماً مستحيلاً؛ بل هو خطوة بخطوة، وظيفة بوظيفة، وثقة بثقة نبنيها معاً.
            </p>
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="container-jo mb-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-[var(--color-text)]">القيم التي تحكم عملنا</h2>
          <div className="section-accent-line mx-auto mt-4" />
          <p className="text-gray-500 mt-4 text-sm md:text-base">
            المبادئ التي بنينا عليها المنصة ونلتزم بها أمام كل باحث عن عمل وصاحب شركة
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "الشفافية الكاملة", desc: "نعرض تفاصيل الوظيفة الحقيقية وطرق التقديم المباشرة دون قيود أو رسوم مخفية.", icon: "🤝" },
            { title: "التركيز المحلي", desc: "منصة مبنية للأردن بالكامل، تفهم احتياجات الشباب ومستجدات السوق في كافة المحافظات.", icon: "🇯🇴" },
            { title: "بساطة التجربة", desc: "نلغي النماذج الطويلة والمعقدة ونوفر واجهات سريعة وسلسة للتقديم وبناء السير الذاتية.", icon: "⚡" },
            { title: "الأمان والموثوقية", desc: "نراجع الشواغر باستمرار، ونحمي بياناتك الشخصية مع إمكانية حذفها أو تعديلها متى شئت.", icon: "🛡️" },
          ].map((val, idx) => (
            <FadeInSection key={idx} className="card card-pad text-center p-8 flex flex-col items-center justify-between" delay={100 * idx}>
              <div>
                <div className="text-4xl mb-4 p-3 bg-gray-50 rounded-2xl dark:bg-gray-800/50 inline-block">{val.icon}</div>
                <h3 className="text-lg font-bold mb-3 text-[var(--color-text)]">{val.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{val.desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="container-jo mb-24 py-14 rounded-3xl" style={{ background: "rgba(27, 79, 219, 0.03)", border: "1px solid rgba(27, 79, 219, 0.08)" }}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl md:text-6xl font-black text-primary-600 mb-2">
              {stats.jobs > 0 ? stats.jobs.toLocaleString("ar-JO") : "+١٥٠"}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">شواغر نشطة ومعلنة</div>
          </div>
          <div>
            <div className="text-4xl md:text-6xl font-black text-accent-500 mb-2">
              {stats.companies > 0 ? stats.companies.toLocaleString("ar-JO") : "+٥٠"}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">صاحب عمل وشركة مسجلة</div>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="text-4xl md:text-6xl font-black text-emerald-500 mb-2">
              {stats.cities.toLocaleString("ar-JO")}
            </div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">محافظة نخدمها في الأردن</div>
          </div>
        </div>
      </section>

      {/* ── Contact & Call to Action (تواصل معنا) ── */}
      <section className="container-jo">
        <div className="card card-pad p-10 md:p-16 text-center relative overflow-hidden" style={{ background: "var(--gradient-footer)" }}>
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full opacity-5 blur-[80px] pointer-events-none bg-blue-500" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-white space-y-6">
            <h2 className="text-2xl md:text-4xl font-extrabold">تواصل معنا وانضم إلينا</h2>
            <p className="text-gray-300 text-sm md:text-base leading-relaxed">
              سواء كنت تبحث عن فرصة عمل جديدة، أو كنت شركة تبحث عن كفاءات أردنية متميزة، أو تود الاستفسار وتقديم اقتراحات لتطوير المنصة؛ نحن هنا للاستماع إليك ومساعدتك.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-4 max-w-md mx-auto pt-4">
              <a 
                href={`https://wa.me/${supportWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 px-6 rounded-full transition-transform active:scale-95 shadow-lg"
              >
                <span>💬 راسلنا عبر الواتساب</span>
              </a>
              <a 
                href={`mailto:${contactEmail}`}
                className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3.5 px-6 rounded-full transition-transform active:scale-95"
              >
                <span>✉️ راسلنا عبر البريد</span>
              </a>
            </div>
            
            <div className="pt-6">
              <Link href="/register" className="inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline font-bold">
                أنشئ حسابك المجاني اليوم وابدأ التقديم 🚀
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
