/** بيانات تجريبية لمعاينة السيرة — تطابق قالب modern-emerald (Plus مع صورة). */
export const CV_SAMPLE_USER_ID = "cv-sample-demo";

export const cvSampleData = {
  id: "cv-sample-profile",
  userId: CV_SAMPLE_USER_ID,
  template: "modern-emerald",
  language: "ar",
  fullName: "سارة أحمد النابلسي",
  jobTitle: "أخصائية خدمة عملاء ومبيعات",
  email: "sara.nabulsi@email.com",
  phone: "0798123456",
  city: "عمّان",
  linkedin: "",
  website: "jordan-job.shop/cv/cv-sample-demo",
  photo: "/cv-sample-photo.jpg",
  summary:
    "أخصائية خدمة عملاء ومبيعات بخبرة عملية تتجاوز 4 سنوات في قطاع الاتصالات والتجزئة داخل الأردن. أمتلك مهارات قوية في التواصل، متابعة الطلبات، حل المشكلات، وتحسين تجربة العميل، وأسعى لتقديم خدمة منظمة وسريعة تدعم أهداف الشركة وترفع رضا العملاء.",
  experiences: [
    {
      id: "exp-1",
      position: "مشرفة خدمة عملاء",
      company: "شركة زين للاتصالات",
      city: "عمّان",
      startDate: "2022",
      endDate: null,
      description:
        "متابعة طلبات العملاء وحل الاستفسارات المتعلقة بالخدمات والباقات بمهنية عالية.\nتدريب موظفين جدد على أسلوب التواصل، وتخفيض زمن الاستجابة من خلال تنظيم خطوات المتابعة.",
      order: 0,
    },
    {
      id: "exp-2",
      position: "موظفة مبيعات معرض",
      company: "سمارت باي للإلكترونيات",
      city: "عمّان",
      startDate: "2020",
      endDate: "2022",
      description:
        "استقبال العملاء وشرح المنتجات والخدمات بطريقة واضحة تساعدهم على اختيار الحل المناسب.\nتحقيق مستهدفات المبيعات الشهرية والمحافظة على تجربة عميل إيجابية داخل المعرض.",
      order: 1,
    },
    {
      id: "exp-3",
      position: "منسقة متابعة طلبات",
      company: "شركة خدمات محلية",
      city: "إربد",
      startDate: "2019",
      endDate: "2020",
      description:
        "تنظيم طلبات العملاء المفتوحة، متابعة الحالات مع الأقسام المعنية، وتوثيق الملاحظات المتكررة لتحسين جودة الخدمة.",
      order: 2,
    },
  ],
  educations: [
    {
      id: "edu-1",
      degree: "بكالوريوس إدارة أعمال",
      institution: "الجامعة الأردنية",
      city: "عمّان",
      startDate: "2016",
      endDate: "2020",
      description: "معدل تراكمي جيد جداً، مع تركيز على إدارة المبيعات وسلوك المستهلك.",
      order: 0,
    },
  ],
  skills: [
    { id: "sk-1", name: "خدمة العملاء والاتصال", level: 5, order: 0 },
    { id: "sk-2", name: "حل المشكلات والنزاعات", level: 5, order: 1 },
    { id: "sk-3", name: "مهارات البيع والإقناع", level: 4, order: 2 },
    { id: "sk-4", name: "إدارة الوقت والمتابعة", level: 4, order: 3 },
    { id: "sk-5", name: "استخدام برامج Office", level: 4, order: 4 },
    { id: "sk-6", name: "إدخال البيانات بدقة", level: 4, order: 5 },
    { id: "sk-7", name: "العمل ضمن فريق", level: 5, order: 6 },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "شهادة مهارات حاسوب ICDL",
      issuer: "مركز تدريب معتمد",
      year: "2021",
      order: 0,
    },
    {
      id: "cert-2",
      name: "دورة التميز في خدمة العملاء",
      issuer: "أكاديمية تدريب مهنية",
      year: "2022",
      order: 1,
    },
    {
      id: "cert-3",
      name: "أساسيات إدارة علاقات العملاء",
      issuer: "منصة تدريب مهنية",
      year: "2023",
      order: 2,
    },
  ],
  englishVersion: JSON.stringify({
    extras: {
      languages: "العربية: ممتاز\nالإنجليزية: جيد جداً",
      tools: "Microsoft Office\nGoogle Workspace\nأنظمة خدمة العملاء CRM\nإدارة الطلبات والمتابعة",
      achievements:
        "تحسين رضا العملاء من خلال المتابعة الدقيقة\nإنجاز المهام ضمن الوقت المحدد وبأخطاء قليلة\nالمساهمة في رفع جودة التواصل مع العملاء",
      references: "متاحة عند الطلب",
    },
  }),
};

export const cvSampleUserSkills = ["خدمة العملاء والاتصال", "تنظيم", "متابعة"];
