import type { Metadata } from "next";
import Link from "next/link";
import { CvPreview } from "@/components/cv/CvPreview";
import { CvPricingFrame } from "@/components/cv/CvPricingFrame";
import { cvSampleData, cvSampleUserSkills } from "@/lib/cv-sample-data";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "باقات الاشتراك والأسعار",
  description: "تعرف على أسعار وخطط الاشتراك للباحثين عن عمل وللشركات في منصة جوبز الأردن.",
};
export const revalidate = 3600;

export default async function PricingPage() {
  const seekerPlans = [
    {
      name: "الحساب المجاني",
      price: "0 د.أ",
      originalPrice: null,
      period: "دائمًا",
      description: "كان 1 د.أ وأصبح مجانياً بالكامل للراغبين بتصفح الوظائف والتقديم بشكل محدود.",
      features: [
        "تصفح جميع الوظائف الشاغرة يومياً",
        "حفظ الوظائف المفضلة للرجوع إليها لاحقاً",
        "تقديم سريع على الوظائف (بحد أقصى 5 تقديمات فقط)",
        "إنشاء سيرة ذاتية أساسية (بدون صورة شخصية)",
      ],
      cta: "ابدأ مجاناً الآن",
      href: "/register",
      highlight: false,
    },
    {
      name: "الباحث بلس (Job Seeker Plus)",
      price: "2 د.أ",
      originalPrice: "4 د.أ",
      period: "شهرياً",
      description: "عرض إطلاق للأفراد الباحثين عن عمل: كان 4 د.أ وأصبح 2 د.أ شهرياً.",
      features: [
        "التقديم السريع غير المحدود على جميع الوظائف",
        "تنزيل السيرة الذاتية PDF باللغتين العربية والإنجليزية معاً (نسخة عربية كاملة + نسخة إنجليزية كاملة) بعدة قوالب احترافية وألوان متميزة",
        "إمكانية رفع صورة شخصية حديثة للسيرة الذاتية",
        "توليد رمز استجابة سريعة (QR Code) موثق على ورقة السيرة الذاتية",
        "تتبع حالة طلبات التقديم (مشاهدة، مقابلة، قبول)",
        "الحصول على أولوية الظهور في قائمة المتقدمين لأصحاب العمل",
      ],
      cta: "اشترك الآن في بلس",
      href: "/register",
      highlight: true,
    },
  ];

  const employerPlans = [
    {
      name: "نشر إعلان فردي",
      price: "5 د.أ",
      originalPrice: "8 د.أ",
      period: "لكل وظيفة",
      description: "عرض إطلاق لأصحاب العمل: كان 8 د.أ وأصبح 5 د.أ لكل إعلان.",
      features: [
        "إعلان عادي نشط لمدة 30 يوماً متواصلة",
        "تصفية وفرز المتقدمين عبر لوحة التحكم",
        "استلام إشعارات التقديم المباشرة",
        "تعديل الإعلان في أي وقت",
      ],
      cta: "انشر وظيفة الآن",
      href: "/employer/jobs/new",
      highlight: false,
    },
    {
      name: "باقة الشركات الأساسية",
      price: "10 د.أ",
      originalPrice: null,
      period: "شهرياً",
      description: "للمؤسسات والشركات الصغيرة ذات التوظيف المستمر.",
      features: [
        "نشر حتى 5 إعلانات وظائف نشطة شهرياً",
        "فرز المتقدمين بناءً على نسبة المطابقة الجغرافية والمهارية",
        "استلام السير الذاتية وملخصات التقديم عبر البريد الإلكتروني فوراً",
        "التواصل المباشر مع الباحثين عبر الواتساب المدمج",
      ],
      cta: "اشترك في الباقة الأساسية",
      href: "/register?role=EMPLOYER",
      highlight: false,
    },
    {
      name: "الباقة الاحترافية (Employer Pro)",
      price: "25 د.أ",
      originalPrice: null,
      period: "شهرياً",
      description: "للشركات ومكاتب التوظيف التي تبحث عن أفضل الكفاءات وبسرعة قصوى.",
      features: [
        "نشر عدد غير محدود من الوظائف الشاغرة",
        "تمييز الوظائف تلقائياً كـ (وظيفة مميزة وعاجلة) لجذب المتقدمين",
        "تصدير قوائم المتقدمين وبياناتهم بصيغة Excel ومشاركتها",
        "أولوية ظهور إعلانات الشركة في أعلى نتائج البحث والصفحة الرئيسية",
        "دعم فني خاص للمساعدة في صياغة الإعلانات وترويجها",
      ],
      cta: "ترقية الباقة الاحترافية",
      href: "/register?role=EMPLOYER",
      highlight: true,
    },
  ];

  const addons = [
    { name: "تنزيل السيرة الذاتية PDF لمرة واحدة (عربي + إنجليزي معاً)", price: "2 د.أ" },
    { name: "ترقية الإعلان إلى (وظيفة مميزة)", price: "10 د.أ" },
    { name: "ترقية الإعلان إلى (وظيفة عاجلة ومثبتة)", price: "15 د.أ" },
  ];

  return (
    <section className="container-jo py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          باقات الاشتراك والأسعار
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          سواء كنت تبحث عن وظيفتك القادمة أو ترغب في توظيف أفضل الكفاءات لشركتك، لدينا الباقة المناسبة لاحتياجاتك بأفضل الأسعار.
        </p>
      </div>

      {/* Seeker Plans Section */}
      <div className="mb-14 rounded-[28px] border border-emerald-500/15 bg-slate-950 p-5 shadow-2xl shadow-slate-950/10 sm:p-7 lg:p-8">
        <div className="border-r-4 border-emerald-400 pr-3 mb-7">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">خطط الباحثين عن عمل</h2>
          <p className="text-xs text-slate-300 mt-1">باقات مخصصة لمساعدتك في بناء سيرتك الذاتية والتقديم على الوظائف</p>
        </div>
        
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
          {/* Seeker Plans Cards */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-5 w-full items-start">
            {seekerPlans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-300 relative ${
                  plan.highlight
                    ? "bg-[#0f1a2a] text-white shadow-xl border border-emerald-500/25 ring-1 ring-emerald-500/20 md:-translate-y-0.5"
                    : "bg-white/10 text-white border border-white/15 shadow-sm hover:bg-white/[0.14] hover:shadow-md"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    موصى به
                  </span>
                )}
                <h3 className={`text-sm sm:text-base font-bold pr-0 ${plan.highlight ? "text-emerald-400 pt-5" : "text-white"}`}>
                  {plan.name}
                </h3>
                <p className="text-[11px] mt-1 leading-snug text-slate-300">{plan.description}</p>

                <div className="mt-3 mb-3 flex flex-wrap items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold">{plan.price}</span>
                  {plan.originalPrice && (
                    <span className="text-xs text-slate-400 line-through">{plan.originalPrice}</span>
                  )}
                  <span className="text-[11px] text-slate-400">/ {plan.period}</span>
                </div>

                <ul className="space-y-2 border-t border-white/10 pt-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 items-start text-[11px] sm:text-xs leading-snug">
                      <span
                        className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          plan.highlight ? "bg-emerald-600/20 text-emerald-400" : "bg-emerald-400/15 text-emerald-300"
                        }`}
                      >
                        ✓
                      </span>
                      <span className={plan.highlight ? "text-slate-200" : "text-slate-100"}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`mt-4 w-full text-center py-2 px-3 rounded-lg text-[11px] sm:text-xs font-bold block transition-all active:scale-[0.98] ${
                    plan.highlight
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/10"
                      : "bg-white hover:bg-slate-100 text-slate-950"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* معاينة كاملة — تظهر صفحة A4 دفعة واحدة بدون سحب أو زوم */}
          <div className="rounded-2xl p-4 sm:p-5 border border-emerald-500/20 bg-[#07110f] w-full max-w-[560px] mx-auto shadow-lg shadow-emerald-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
              <h4 className="font-extrabold text-white text-base sm:text-lg leading-snug">
                هكذا ستبدو سيرتك بعد التفعيل
                <span className="block text-emerald-300/90 text-xs font-bold mt-0.5">مثال حقيقي من باني السيرة — Plus مع صورة</span>
              </h4>
              <Link
                href="/cv/sample"
                target="_blank"
                className="text-xs font-bold text-emerald-300 hover:text-white bg-emerald-600/20 hover:bg-emerald-600/35 px-3 py-1.5 rounded-lg border border-emerald-500/30 transition-colors shrink-0"
              >
                PDF كامل
              </Link>
            </div>

            <CvPricingFrame maxHeight={640}>
              <CvPreview cv={cvSampleData} userSkills={cvSampleUserSkills} lang="ar" isPlus />
            </CvPricingFrame>

            <p className="text-xs text-slate-300 mt-3 text-center leading-relaxed">
              الصفحة كاملة في الإطار — رأس أخضر، صورة شخصية، خبرات، مهارات، شهادات، QR موثق. نفس ملف PDF بعد التفعيل.
            </p>
          </div>
        </div>
      </div>

      {/* Employer Plans Section */}
      <div className="mb-14">
        <div className="border-r-4 border-amber-500 pr-3 mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">خطط الشركات وأصحاب العمل</h2>
          <p className="text-xs text-slate-500 mt-1">باقات وخدمات مخصصة لنشر الوظائف واستقطاب المرشحين المناسبين</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 items-start">
          {employerPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-4 sm:p-5 flex flex-col transition-all duration-300 relative ${
                plan.highlight
                  ? "bg-slate-900 text-white shadow-xl border border-amber-500/20 ring-1 ring-amber-500/15 md:-translate-y-0.5"
                  : "bg-white border border-slate-200 shadow-sm hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  الأكثر توفيراً
                </span>
              )}
              <h3 className={`text-sm sm:text-base font-bold ${plan.highlight ? "text-amber-400 pt-5" : "text-slate-900"}`}>
                {plan.name}
              </h3>
              <p className={`text-[11px] mt-1 leading-snug ${plan.highlight ? "text-slate-300" : "text-slate-500"}`}>
                {plan.description}
              </p>

              <div className="mt-3 mb-3 flex flex-wrap items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold">{plan.price}</span>
                {plan.originalPrice && (
                  <span className={`text-xs line-through ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>
                    {plan.originalPrice}
                  </span>
                )}
                <span className={`text-[11px] ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>/ {plan.period}</span>
              </div>

              <ul className="space-y-2 border-t border-slate-100/10 pt-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2 items-start text-[11px] sm:text-xs leading-snug">
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                        plan.highlight ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      ✓
                    </span>
                    <span className={plan.highlight ? "text-slate-200" : "text-slate-700"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-4 w-full text-center py-2 px-3 rounded-lg text-xs font-bold block transition-all active:scale-[0.98] ${
                  plan.highlight
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Add-ons and Extras */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Info card on Manual Payment */}
        <div className="card-pad bg-emerald-50/30 border border-emerald-100">
          <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
            <span>💳</span> آلية الدفع وتفعيل الخدمات
          </h3>
          <p className="text-xs text-slate-600 leading-6">
            حالياً نقبل وسائل الدفع المحلية يدويًا لضمان السهولة وتجنب تعقيدات البطاقات. بعد تقديم طلب الدفع، يمكنك التحويل عبر:
          </p>
          <ul className="text-xs text-slate-700 mt-3 space-y-2 font-semibold">
            <li>• تحويل CliQ فوري وسريع.</li>
            <li>• إرسال حوالة للمحفظة الإلكترونية (Zain Cash, Umniah, Orange).</li>
            <li>• التحويل البنكي المباشر.</li>
          </ul>
          <p className="text-xs text-slate-500 mt-4 leading-5">
            بعد التحويل، قم بمشاركة لقطة الشاشة مع فريق الدعم الفني، وسيتم تفعيل حسابك أو سيرتك الذاتية من قبل الإدارة فوراً.
          </p>
          <a
            href={`https://wa.me/${env.PLATFORM_WHATSAPP}`}
            target="_blank"
            className="btn bg-white hover:bg-slate-50 border border-emerald-200 text-emerald-800 text-xs font-bold mt-4 w-full text-center"
          >
            💬 استفسر أو أرسل إثبات الدفع عبر واتساب
          </a>
        </div>

        {/* List of Add-ons */}
        <div className="card-pad flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base mb-3 flex items-center gap-2">
              <span>⚡</span> الخدمات الفردية الإضافية
            </h3>
            <p className="text-xs text-slate-500 mb-4">خدمات يمكنك شراؤها لمرة واحدة لتلبية احتياجات سريعة دون اشتراك شهري.</p>
            
            <div className="space-y-3">
              {addons.map((addon) => (
                <div key={addon.name} className="flex justify-between items-center text-xs sm:text-sm border-b border-slate-100 pb-2.5">
                  <span className="font-medium text-slate-700">{addon.name}</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/50">
                    {addon.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
            * تنطبق الرسوم الفردية عند رغبتك بالحصول على الخدمة مباشرة دون الاشتراك في باقة الشركات الشهرية.
          </p>
        </div>
      </div>
    </section>
  );
}
