import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { FadeInSection } from "@/components/FadeInSection";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "اتصل بنا | جوبز الأردن",
  description: "تواصل مع فريق عمل منصة جوبز الأردن. نحن هنا لمساعدتك في أي استفسار، دعم فني، أو للإبلاغ عن أي إعلان وظيفة مشبوهة.",
};

export default function ContactPage() {
  return (
    <div className="bg-[var(--color-bg)] min-h-screen text-[var(--color-text-main)] py-12">
      {/* ── Hero Section ── */}
      <section className="container-jo text-center mb-16">
        <h1 className="section-title text-3xl md:text-5xl font-extrabold mb-4 text-[var(--color-text-title)]">
          يسعدنا تواصلك معنا
        </h1>
        <div className="section-accent-line mx-auto mb-4" />
        <p className="section-sub max-w-2xl mx-auto">
          فريق دعم جوبز الأردن جاهز للإجابة على استفساراتك ومساعدتك في حل أي مشكلة تواجهك في استخدام المنصة.
        </p>
      </section>

      {/* ── Contact Channels & Form ── */}
      <section className="container-jo grid lg:grid-cols-3 gap-8 items-start mb-24">
        {/* Info Column (1/3 width on desktop) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Card 1: WhatsApp */}
          <FadeInSection className="card card-pad border border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/10 dark:bg-emerald-950/5" delay={100}>
            <div className="flex gap-4 items-center mb-3">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="font-bold text-[var(--color-text-title)]">واتساب الدعم السريع</h3>
                <p className="text-xs text-gray-500">الخيار الأسرع للحصول على مساعدة</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              تواصل معنا مباشرة عبر تطبيق واتساب لمحادثة أحد ممثلي الدعم الفني.
            </p>
            <a
              href={`https://wa.me/${env.PLATFORM_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full py-2.5 text-center block text-sm font-medium bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-100 dark:hover:shadow-none"
            >
              فتح محادثة واتساب
            </a>
          </FadeInSection>

          {/* Card 2: Email */}
          <FadeInSection className="card card-pad border border-blue-100 dark:border-blue-950/20 bg-blue-50/10 dark:bg-blue-950/5" delay={200}>
            <div className="flex gap-4 items-center mb-3">
              <span className="text-3xl">✉️</span>
              <div>
                <h3 className="font-bold text-[var(--color-text-title)]">البريد الإلكتروني</h3>
                <p className="text-xs text-gray-500">للاستفسارات الرسمية والشراكات</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              تواصل معنا عبر البريد للمراسلات الرسمية أو لطلبات إعلانات الشركات الكبرى.
            </p>
            <a
              href={`mailto:${env.CONTACT_EMAIL}`}
              className="btn-outline w-full py-2.5 text-center block text-sm font-medium"
            >
              {env.CONTACT_EMAIL}
            </a>
          </FadeInSection>

          {/* Card 3: Working Hours */}
          <FadeInSection className="card card-pad border border-gray-100 dark:border-gray-800" delay={300}>
            <div className="flex gap-4 items-center mb-3">
              <span className="text-3xl">🕒</span>
              <div>
                <h3 className="font-bold text-[var(--color-text-title)]">أوقات العمل</h3>
                <p className="text-xs text-gray-500">ساعات الاستجابة الرسمية</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              نعمل على مدار الأسبوع لمعالجة طلباتكم، وساعات الدعم المباشر هي:
            </p>
            <div className="mt-3 text-sm font-bold text-[var(--color-text-title)]">
              الأحد – الخميس: 9:00 ص – 5:00 م
            </div>
          </FadeInSection>
        </div>

        {/* Form Column (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <FadeInSection delay={150}>
            <ContactForm />
          </FadeInSection>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="container-jo">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-title text-2xl font-bold">الأسئلة الشائعة</h2>
          <div className="section-accent-line mx-auto" />
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {[
            {
              q: "كيف يمكنني تعديل معلومات سيرتي الذاتية بعد إنشائها؟",
              a: "ببساطة قم بتسجيل الدخول إلى حسابك، وانتقل إلى لوحة التحكم الخاصة بك ثم اختر 'السيرة الذاتية'. يمكنك تعديل أي حقل، وإضافة الخبرات والتعليم والمهارات، وستتحدث سيرتك الذاتية فوراً وبشكل تلقائي حتى على رمز QR الخاص بك.",
            },
            {
              q: "هل خدمات التقديم وبناء السيرة الذاتية مجانية بالكامل؟",
              a: "نعم، خدمات التسجيل، والبحث عن الوظائف، وبناء الملف الشخصي، والتقديم على الوظائف الشاغرة مجانية بنسبة 100% للباحثين عن عمل في الأردن.",
            },
            {
              q: "كيف يمكنني الإبلاغ عن وظيفة مشبوهة أو منتهية الصلاحية؟",
              a: "نحن نهتم بمصداقية الفرص على منصتنا. يمكنك استخدام نموذج الاتصال أعلاه واختيار الموضوع 'الإبلاغ عن وظيفة مشبوهة' مع إرفاق رابط الوظيفة أو اسمها، أو تواصل معنا فوراً على واتساب الدعم وسيتعامل فريقنا مع البلاغ خلال 24 ساعة.",
            },
          ].map((faq, idx) => (
            <FadeInSection key={idx} className="card card-pad" delay={100 * idx}>
              <h3 className="font-bold text-base md:text-lg mb-2 text-[var(--color-text-title)] flex items-start gap-2">
                <span className="text-primary-500 shrink-0">◀</span>
                {faq.q}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed pr-6">
                {faq.a}
              </p>
            </FadeInSection>
          ))}
        </div>
      </section>
    </div>
  );
}
