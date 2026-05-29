/** بيانات تجريبية لمعاينة السيرة — تطابق قالب modern-emerald (Plus مع صورة). */
export const CV_SAMPLE_USER_ID = "cv-sample-demo";

export const cvSampleData = {
  id: "cv-sample-profile",
  userId: CV_SAMPLE_USER_ID,
  template: "modern-emerald",
  language: "ar",
  fullName: "ليان محمد الزعبي",
  jobTitle: "أخصائية تسويق رقمي",
  email: "lian.zoubi@email.com",
  phone: "0798123456",
  city: "عمّان",
  linkedin: "linkedin.com/in/lian-zoubi",
  website: null,
  photo: "/cv-sample-photo.jpg",
  summary:
    "أخصائية تسويق رقمي بخبرة 4 سنوات في إدارة الحملات الإعلانية، تحليل الأداء، وإنتاج المحتوى لقطاع التجزئة والخدمات في الأردن. أركز على نتائج قابلة للقياس وتحسين معدلات التحويل عبر منصات التواصل والإعلانات المدفوعة.",
  experiences: [
    {
      id: "exp-1",
      position: "أخصائية تسويق رقمي",
      company: "شركة موضوع للبرمجيات",
      city: "عمّان",
      startDate: "2022",
      endDate: null,
      description:
        "إدارة حملات Meta وGoogle Ads لعملاء محليين.\nإعداد تقارير أسبوعية للأداء وتحسين معدل التحويل بنسبة 18%.",
      order: 0,
    },
    {
      id: "exp-2",
      position: "منسقة محتوى وتسويق",
      company: "سمارت باي للإلكترونيات",
      city: "عمّان",
      startDate: "2020",
      endDate: "2022",
      description: "تخطيط تقويم المحتوى وإدارة حسابات التواصل الاجتماعي للفروع الرئيسية.",
      order: 1,
    },
  ],
  educations: [
    {
      id: "edu-1",
      degree: "بكالوريوس إدارة أعمال — تخصص تسويق",
      institution: "جامعة الأردن",
      city: "عمّان",
      startDate: "2016",
      endDate: "2020",
      description: null,
      order: 0,
    },
  ],
  skills: [
    { id: "sk-1", name: "إدارة الحملات الرقمية", level: 5, order: 0 },
    { id: "sk-2", name: "تحليل البيانات", level: 4, order: 1 },
    { id: "sk-3", name: "كتابة المحتوى", level: 5, order: 2 },
    { id: "sk-4", name: "Canva / Adobe", level: 4, order: 3 },
    { id: "sk-5", name: "خدمة العملاء", level: 4, order: 4 },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "Google Digital Marketing",
      issuer: "Google",
      year: "2023",
      order: 0,
    },
    {
      id: "cert-2",
      name: "Meta Blueprint",
      issuer: "Meta",
      year: "2022",
      order: 1,
    },
  ],
  englishVersion: null,
};

export const cvSampleUserSkills = ["Excel", "تواصل", "تنظيم"];
