/**
 * سكربت إدراج وظائف حقيقية من الأردن
 * المصادر: wazaf.net, bayt.com, reliefweb.int, careem, talabat, الحكومة الأردنية
 * التاريخ: مايو 2026
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60)
    + "-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

const now = new Date();
const expiresAt = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days

interface JobData {
  title: string;
  companyNameText: string;
  city: string;
  area?: string;
  jobCategory: string;
  jobType: "FULL_TIME" | "PART_TIME" | "SHIFT" | "TEMPORARY" | "INTERNSHIP" | "REMOTE" | "HYBRID";
  description: string;
  requirements: string;
  responsibilities?: string;
  benefits?: string;
  experienceLevel: "NO_EXPERIENCE" | "ENTRY" | "JUNIOR" | "MID" | "SENIOR" | "MANAGER";
  educationLevel: "NONE" | "SCHOOL" | "HIGH_SCHOOL" | "DIPLOMA" | "BACHELOR" | "MASTER" | "PHD";
  skills?: string;
  salaryText?: string;
  salaryMin?: number;
  salaryMax?: number;
  womenFriendly?: boolean;
  noExperienceRequired?: boolean;
  requiresDrivingLicense?: boolean;
  contactMethod: "INTERNAL_APPLY" | "WHATSAPP" | "EMAIL" | "EXTERNAL_LINK";
  externalUrl?: string;
  sourceType: "ADMIN_MANUAL" | "COMPANY_CAREERS_PAGE" | "PUBLIC_GOVERNMENT_SOURCE" | "PUBLIC_NGO_SOURCE" | "PUBLIC_SOCIAL_POST_MANUAL" | "OTHER";
  sourceName: string;
  sourceUrl?: string;
  sourceTrustLevel: "HIGH" | "MEDIUM" | "LOW";
}

const jobs: JobData[] = [
  // ===== 1. مبيعات ملابس - وسط البلد عمّان =====
  {
    title: "موظف/موظفة مبيعات - محلات ملابس",
    companyNameText: "محل ملابس - وسط البلد",
    city: "عمّان",
    area: "وسط البلد",
    jobCategory: "مبيعات وتسويق",
    jobType: "FULL_TIME",
    description: "مطلوب موظف أو موظفة مبيعات للعمل في محلات ملابس في منطقة وسط البلد، عمان.\n\nيتطلب العمل خبرة في البيع بالتجزئة والتعامل المباشر مع الزبائن وعرض البضائع وترتيب المحل والمساعدة في الجرد الدوري.\n\nبيئة عمل ودية مع حوافز على المبيعات.",
    requirements: "خبرة لا تقل عن سنة في مجال المبيعات والملابس.\nحسن المظهر والتعامل.\nالقدرة على العمل ضمن فريق.\nاللتزام بمواعيد العمل.",
    responsibilities: "استقبال الزبائن ومساعدتهم في اختيار الملابس.\nترتيب البضائع وعرضها بشكل جذاب.\nإتمام عمليات البيع والمحاسبة.\nالمشاركة في جرد المخزون.",
    experienceLevel: "ENTRY",
    educationLevel: "HIGH_SCHOOL",
    skills: "مبيعات,خدمة عملاء,ترتيب بضائع",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 2. موظفة مبيعات أزياء - دابوق =====
  {
    title: "موظفة مبيعات - دار أزياء نسائية راقية",
    companyNameText: "دار أزياء نسائية - دابوق",
    city: "عمّان",
    area: "دابوق",
    jobCategory: "مبيعات وتسويق",
    jobType: "FULL_TIME",
    description: "مطلوب موظفة مبيعات للعمل في دار أزياء نسائية راقية في منطقة دابوق، عمان.\n\nالعمل يتضمن استقبال الزبائن وعرض التشكيلات الموسمية وتنسيق المبيعات وتقديم المشورة في اختيار الأزياء المناسبة.\n\nبيئة عمل احترافية مع فرص تطوير مهني.",
    requirements: "خبرة في مجال الأزياء النسائية لا تقل عن سنة.\nحسن المظهر واللباقة في التعامل.\nمعرفة بصيحات الموضة الحالية.\nإجادة اللغة الإنجليزية (مفضل).",
    experienceLevel: "ENTRY",
    educationLevel: "HIGH_SCHOOL",
    skills: "أزياء,مبيعات,خدمة عملاء VIP",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 3. باريستا - الجبيهة (عمّان) =====
  {
    title: "باريستا (شفت مسائي)",
    companyNameText: "مقهى - الجبيهة",
    city: "عمّان",
    area: "الجبيهة",
    jobCategory: "ضيافة ومطاعم",
    jobType: "SHIFT",
    description: "مطلوب موظف أو موظفة باريستا للعمل في شفت مسائي في مقهى في منطقة الجبيهة، عمان.\n\nيتطلب العمل إعداد المشروبات الساخنة والباردة بمختلف أنواعها (إسبرسو، لاتيه، كابتشينو، موخا، مشروبات باردة موسمية) وخدمة الزبائن بأسلوب محترف.\n\nالدوام: من الساعة 3 عصراً حتى 11 مساءً.",
    requirements: "خبرة في تحضير القهوة والمشروبات المتخصصة.\nسرعة في الأداء والقدرة على العمل تحت الضغط.\nمظهر أنيق ولباقة في التعامل.",
    experienceLevel: "ENTRY",
    educationLevel: "NONE",
    skills: "تحضير قهوة,باريستا,خدمة عملاء",
    womenFriendly: true,
    noExperienceRequired: false,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 4. سكرتيرة - أبو نصير =====
  {
    title: "سكرتيرة - مركز ثقافي",
    companyNameText: "مركز ثقافي - أبو نصير",
    city: "عمّان",
    area: "أبو نصير",
    jobCategory: "إدارة وموارد بشرية",
    jobType: "FULL_TIME",
    description: "مطلوب سكرتيرة للعمل في مركز ثقافي في منطقة أبو نصير، عمان.\n\nتشمل المهام تنظيم المواعيد والجداول الزمنية، إدارة المراسلات والمكالمات الهاتفية، التنسيق الإداري بين الأقسام، واستقبال الزوار والضيوف.\n\nبيئة عمل ثقافية محفزة.",
    requirements: "إجادة استخدام الحاسوب وبرامج Microsoft Office.\nمهارات تنظيمية وإدارية عالية.\nمهارات تواصل ممتازة.\nخبرة سابقة في السكرتاريا (مفضل).",
    experienceLevel: "ENTRY",
    educationLevel: "DIPLOMA",
    skills: "سكرتاريا,تنظيم,Microsoft Office,تواصل",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 5. مهندس مدني - عمّان =====
  {
    title: "مهندس مدني - مشاريع بناء وتشييد",
    companyNameText: "شركة مقاولات",
    city: "عمّان",
    jobCategory: "هندسة",
    jobType: "FULL_TIME",
    description: "مطلوب مهندس مدني للعمل في مشاريع البناء والتشييد في عمان.\n\nيتطلب العمل الإشراف الميداني على مواقع البناء، متابعة تنفيذ المخططات الهندسية، التنسيق مع فرق العمل والمقاولين من الباطن، وإعداد التقارير الهندسية الدورية.\n\nفرصة للمشاركة في مشاريع كبرى في العاصمة.",
    requirements: "شهادة بكالوريوس هندسة مدنية من جامعة معترف بها.\nخبرة لا تقل عن 3 سنوات في مجال التنفيذ والإشراف.\nعضوية نقابة المهندسين الأردنيين.\nمعرفة بالكودات الأردنية وأنظمة البناء.\nرخصة قيادة (مفضل).",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "هندسة مدنية,إشراف,AutoCAD,تنفيذ مشاريع",
    requiresDrivingLicense: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 6. مهندس معماري - إربد =====
  {
    title: "مهندس معماري - مكتب هندسي",
    companyNameText: "مكتب هندسي",
    city: "إربد",
    jobCategory: "هندسة",
    jobType: "FULL_TIME",
    description: "مطلوب مهندس معماري للعمل في مكتب هندسي في مدينة إربد.\n\nالعمل يشمل تصميم المشاريع المعمارية السكنية والتجارية، إعداد المخططات التنفيذية، الإشراف على مراحل التصميم، والتنسيق مع المهندسين الإنشائيين والميكانيكيين.\n\nفرصة للعمل على مشاريع متنوعة في شمال الأردن.",
    requirements: "بكالوريوس هندسة معمارية.\nخبرة في التصميم المعماري باستخدام AutoCAD وRevit.\nمعرفة بأنظمة البناء والتنظيم في الأردن.\nعضوية نقابة المهندسين.",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "تصميم معماري,AutoCAD,Revit,3D Max",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 7. سائق - الزرقاء =====
  {
    title: "سائق - شركة خاصة",
    companyNameText: "شركة خاصة",
    city: "الزرقاء",
    jobCategory: "نقل وتوصيل",
    jobType: "FULL_TIME",
    description: "مطلوب سائق للعمل في شركة خاصة في مدينة الزرقاء.\n\nيتطلب العمل قيادة مركبات الشركة لنقل البضائع والموظفين، الالتزام التام بقوانين المرور ومواعيد العمل، والحفاظ على المركبة بحالة جيدة.\n\nدوام كامل مع تأمين صحي.",
    requirements: "رخصة قيادة سارية المفعول (خصوصي أو عمومي).\nسجل قيادة نظيف.\nمعرفة جيدة بالطرق في الأردن.\nالالتزام والانضباط.",
    experienceLevel: "ENTRY",
    educationLevel: "SCHOOL",
    skills: "قيادة,نقل,توصيل",
    requiresDrivingLicense: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 8. موظف سوبر ماركت - عمّان =====
  {
    title: "موظف سوبر ماركت",
    companyNameText: "سوبر ماركت",
    city: "عمّان",
    jobCategory: "مبيعات وتسويق",
    jobType: "FULL_TIME",
    description: "مطلوب موظف للعمل في سوبر ماركت في عمان.\n\nتشمل المهام ترتيب البضائع على الرفوف، خدمة الزبائن ومساعدتهم، العمل على الكاشير عند الحاجة، والمشاركة في عمليات الجرد وتنظيم المستودع.\n\nالعمل بنظام الورديات.",
    requirements: "القدرة على العمل بنظام الورديات (صباحي/مسائي).\nلياقة بدنية جيدة.\nصدق وأمانة.\nلا يشترط خبرة سابقة.",
    experienceLevel: "NO_EXPERIENCE",
    educationLevel: "NONE",
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 9. ويتر / كابتن صالة - عمّان =====
  {
    title: "ويتر / كابتن صالة - مطعم",
    companyNameText: "مطعم",
    city: "عمّان",
    jobCategory: "ضيافة ومطاعم",
    jobType: "FULL_TIME",
    description: "مطلوب ويتر وكابتن صالة للعمل في مطعم في عمان.\n\nيتطلب العمل خدمة الطاولات وتقديم الأطعمة والمشروبات بأسلوب احترافي، الإشراف على ترتيب الصالة، التعامل مع شكاوى الزبائن، وضمان تجربة طعام مميزة.\n\nراتب مجزي مع بقشيش.",
    requirements: "خبرة لا تقل عن سنة في مجال المطاعم.\nلباقة في التعامل ومهارات تواصل.\nمظهر أنيق.\nالقدرة على العمل لساعات طويلة.",
    experienceLevel: "ENTRY",
    educationLevel: "NONE",
    skills: "خدمة طاولات,ضيافة,خدمة عملاء",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 10. شيف / معلم طبخ - عمّان =====
  {
    title: "شيف / معلم فلافل وسناكات",
    companyNameText: "مطعم شعبي",
    city: "عمّان",
    jobCategory: "ضيافة ومطاعم",
    jobType: "FULL_TIME",
    description: "مطلوب شيف ومعلم فلافل ومعلم سناكات للعمل في مطعم شعبي في عمان.\n\nيتطلب العمل إعداد وتحضير الفلافل والحمص والفول والسناكات الشرقية المتنوعة بجودة عالية وطعم مميز.\n\nالعمل يبدأ فوراً.",
    requirements: "خبرة مثبتة في تحضير الأطباق الشعبية والفلافل.\nالالتزام بمعايير النظافة وسلامة الغذاء.\nالقدرة على العمل في بيئة سريعة.",
    experienceLevel: "MID",
    educationLevel: "NONE",
    skills: "طبخ,فلافل,سناكات,مطبخ شرقي",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 11. موظفة استقبال / أخصائية ليزر =====
  {
    title: "موظفة استقبال وأخصائية ليزر - عيادة تجميل",
    companyNameText: "عيادة تجميل",
    city: "عمّان",
    jobCategory: "طب وتمريض",
    jobType: "FULL_TIME",
    description: "مطلوب موظفات استقبال وأخصائيات ليزر للعمل في عيادة تجميل راقية في عمان.\n\nتشمل المهام استقبال المرضى والمراجعين، تنسيق المواعيد وإدارة الجدول اليومي، إجراء جلسات الليزر (للأخصائيات)، والمحافظة على بيئة العيادة المهنية.\n\nراتب مجزي مع حوافز.",
    requirements: "خبرة في مجال التجميل والعيادات (سنة على الأقل).\nلأخصائية الليزر: شهادة معتمدة في استخدام أجهزة الليزر.\nلموظفة الاستقبال: مهارات تواصل ومعرفة بالحاسوب.\nحسن المظهر واللباقة.",
    experienceLevel: "ENTRY",
    educationLevel: "DIPLOMA",
    skills: "استقبال,ليزر,تجميل,تنسيق مواعيد",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 12. خياط/ة فساتين - عمّان =====
  {
    title: "خياط/ة - فساتين سهرة وأعراس",
    companyNameText: "دار أزياء",
    city: "عمّان",
    jobCategory: "مصانع وإنتاج",
    jobType: "FULL_TIME",
    description: "مطلوب خياطون ماهرون متخصصون في فساتين السهرة والأعراس للعمل في دار أزياء في عمان.\n\nالعمل يشمل تفصيل وخياطة فساتين حسب الطلب، تعديل الملابس، العمل مع أقمشة راقية (ساتان، حرير، دانتيل)، والتنسيق مع المصممين.\n\nفرصة عمل مميزة لأصحاب المهارة العالية.",
    requirements: "مهارة عالية ومثبتة في الخياطة والتفصيل.\nخبرة في التعامل مع أقمشة الفساتين الراقية.\nدقة في التفاصيل والتشطيب.\nخبرة لا تقل عن 3 سنوات.",
    experienceLevel: "MID",
    educationLevel: "NONE",
    skills: "خياطة,تفصيل,فساتين سهرة,أقمشة",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 13. مهندس أمن سيبراني - عمّان =====
  {
    title: "مهندس أمن سيبراني (Cybersecurity Engineer)",
    companyNameText: "شركة تكنولوجيا",
    city: "عمّان",
    jobCategory: "تكنولوجيا المعلومات",
    jobType: "FULL_TIME",
    description: "مطلوب مهندس أمن سيبراني للعمل في شركة تكنولوجيا في عمان.\n\nيتضمن العمل حماية الأنظمة والشبكات من التهديدات والهجمات الإلكترونية، تطوير وتنفيذ سياسات الأمان، إجراء اختبارات الاختراق، مراقبة الأنظمة والاستجابة للحوادث الأمنية.\n\nراتب تنافسي مع مزايا شاملة.",
    requirements: "بكالوريوس علوم حاسوب أو أمن معلومات أو ما يعادلها.\nخبرة لا تقل عن 3 سنوات في مجال الأمن السيبراني.\nشهادات مهنية (CISSP, CEH, CompTIA Security+) مفضلة.\nمعرفة بأدوات SIEM وأنظمة IDS/IPS.\nإجادة اللغة الإنجليزية.",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "أمن سيبراني,اختبار اختراق,SIEM,Firewall,Linux",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 14. مهندس بنية تحتية أول - عمّان =====
  {
    title: "مهندس بنية تحتية أول (Senior Infrastructure Engineer)",
    companyNameText: "شركة تكنولوجيا",
    city: "عمّان",
    jobCategory: "تكنولوجيا المعلومات",
    jobType: "FULL_TIME",
    description: "مطلوب مهندس بنية تحتية أول للعمل في شركة تكنولوجيا معلومات رائدة في عمان.\n\nيشمل العمل تصميم وإدارة البنية التحتية لتكنولوجيا المعلومات، إدارة الشبكات والخوادم والسيرفرات، تخطيط وتنفيذ حلول الحوسبة السحابية (AWS/Azure)، وضمان استمرارية الأعمال.\n\nفرصة للعمل مع أحدث التقنيات.",
    requirements: "بكالوريوس هندسة حاسوب أو ما يعادلها.\nخبرة 5+ سنوات في إدارة البنية التحتية.\nمعرفة متقدمة بـ VMware, AWS, Azure.\nخبرة في إدارة Windows Server وLinux.\nشهادات مهنية (CCNA, MCSE) مفضلة.",
    experienceLevel: "SENIOR",
    educationLevel: "BACHELOR",
    skills: "بنية تحتية,AWS,Azure,VMware,Linux,Windows Server",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 15. متخصص مشتريات - عمّان =====
  {
    title: "متخصص مشتريات (Procurement Specialist)",
    companyNameText: "شركة أردنية",
    city: "عمّان",
    jobCategory: "إدارة وموارد بشرية",
    jobType: "FULL_TIME",
    description: "مطلوب متخصص مشتريات للعمل في شركة أردنية في عمان.\n\nتشمل المهام إدارة عمليات الشراء الكاملة من طلب العروض حتى الاستلام، التفاوض مع الموردين للحصول على أفضل الأسعار والشروط، متابعة العقود والاتفاقيات، وإعداد تقارير المشتريات الدورية.",
    requirements: "خبرة لا تقل عن 3 سنوات في مجال المشتريات وسلسلة التوريد.\nبكالوريوس إدارة أعمال أو هندسة صناعية.\nمهارات تفاوض ممتازة.\nإجادة استخدام أنظمة ERP.",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "مشتريات,سلسلة توريد,تفاوض,ERP",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 16. أخصائي موارد بشرية - عمّان =====
  {
    title: "أخصائي موارد بشرية (HR Specialist)",
    companyNameText: "شركة أردنية",
    city: "عمّان",
    jobCategory: "إدارة وموارد بشرية",
    jobType: "FULL_TIME",
    description: "مطلوب أخصائي موارد بشرية للعمل في شركة في عمان.\n\nالمهام تشمل إدارة عمليات التوظيف والاستقطاب، إدارة شؤون الموظفين وعقود العمل، تنفيذ برامج التدريب والتطوير، إدارة نظام تقييم الأداء، والتعامل مع مؤسسة الضمان الاجتماعي.",
    requirements: "بكالوريوس إدارة أعمال أو موارد بشرية.\nخبرة لا تقل عن سنتين في المجال.\nمعرفة بقانون العمل الأردني.\nإجادة استخدام أنظمة HRIS.\nمهارات تواصل ممتازة.",
    experienceLevel: "JUNIOR",
    educationLevel: "BACHELOR",
    skills: "موارد بشرية,توظيف,قانون عمل,HRIS",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 17. وكيل خدمة عملاء - عمّان =====
  {
    title: "وكيل خدمة عملاء (Customer Service Agent)",
    companyNameText: "شركة خدمات",
    city: "عمّان",
    jobCategory: "خدمة عملاء",
    jobType: "FULL_TIME",
    description: "مطلوب وكيل خدمة عملاء للعمل في شركة خدمات في عمان.\n\nتشمل المهام الرد على استفسارات العملاء عبر الهاتف والبريد الإلكتروني ووسائل التواصل، معالجة الشكاوى وحل المشكلات، تسجيل البيانات في النظام، ومتابعة رضا العملاء.\n\nبيئة عمل شبابية مع تدريب مستمر.",
    requirements: "مهارات تواصل ممتازة باللغتين العربية والإنجليزية.\nإجادة استخدام الحاسوب.\nصبر وقدرة على التعامل مع العملاء.\nيفضل خبرة سابقة في خدمة العملاء أو الكول سنتر.",
    experienceLevel: "ENTRY",
    educationLevel: "HIGH_SCHOOL",
    skills: "خدمة عملاء,تواصل,حل مشكلات,CRM",
    womenFriendly: true,
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 18. مشرف رواتب - عمّان =====
  {
    title: "مشرف موارد بشرية ورواتب (HR & Payroll Supervisor)",
    companyNameText: "شركة أردنية",
    city: "عمّان",
    jobCategory: "محاسبة ومالية",
    jobType: "FULL_TIME",
    description: "مطلوب مشرف موارد بشرية ورواتب للعمل في شركة في عمان.\n\nالمهام تشمل إعداد الرواتب الشهرية وحسابات نهاية الخدمة، إدارة ملفات الموظفين والعقود، متابعة اشتراكات الضمان الاجتماعي، إعداد التقارير الإدارية والمالية المتعلقة بالموظفين.\n\nراتب تنافسي حسب الخبرة.",
    requirements: "خبرة لا تقل عن 3 سنوات في إعداد الرواتب.\nمعرفة عميقة بقانون العمل الأردني والضمان الاجتماعي.\nإجادة Excel المتقدم.\nبكالوريوس محاسبة أو إدارة أعمال.",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "رواتب,ضمان اجتماعي,Excel,قانون عمل",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 19. مدرس عبر الإنترنت =====
  {
    title: "مدرس عبر الإنترنت (Online Teacher)",
    companyNameText: "منصة تعليمية إلكترونية",
    city: "عمّان",
    jobCategory: "تعليم وتدريب",
    jobType: "REMOTE",
    description: "مطلوب مدرسين ومدرسات للعمل عبر الإنترنت مع منصة تعليمية إلكترونية.\n\nالعمل يشمل تدريس مواد مختلفة (رياضيات، علوم، لغة إنجليزية، لغة عربية) لطلاب من مختلف المراحل. العمل عن بُعد بالكامل مع إمكانية تحديد ساعات مرنة.\n\nفرصة مميزة للمعلمين الراغبين بالعمل من المنزل.",
    requirements: "شهادة جامعية في التخصص المطلوب.\nخبرة في التدريس (سنة على الأقل).\nإتقان استخدام أدوات التعليم عن بُعد (Zoom, Google Classroom).\nاتصال إنترنت مستقر.",
    experienceLevel: "ENTRY",
    educationLevel: "BACHELOR",
    skills: "تدريس,تعليم عن بعد,Zoom,Google Classroom",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 20. مبرمج SQL مبتدئ - عمّان =====
  {
    title: "مبرمج قواعد بيانات مبتدئ (Junior SQL Developer)",
    companyNameText: "شركة تقنية",
    city: "عمّان",
    jobCategory: "تكنولوجيا المعلومات",
    jobType: "FULL_TIME",
    description: "فرصة للمبتدئين والخريجين الجدد في مجال قواعد البيانات للعمل في شركة تقنية في عمان.\n\nيشمل العمل تطوير وصيانة قواعد البيانات، كتابة استعلامات SQL المعقدة، تطوير إجراءات PL/SQL، تحسين أداء قواعد البيانات، وإعداد التقارير.\n\nبيئة عمل محفزة مع تدريب وإرشاد مهني.",
    requirements: "شهادة بكالوريوس في علوم الحاسوب أو هندسة البرمجيات أو ما يعادلها.\nمعرفة جيدة بـ SQL و PL/SQL.\nمعرفة بقواعد بيانات Oracle أو PostgreSQL أو SQL Server.\nمتخرج حديث أو خبرة أقل من سنة.",
    experienceLevel: "ENTRY",
    educationLevel: "BACHELOR",
    skills: "SQL,PL/SQL,Oracle,PostgreSQL,قواعد بيانات",
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 21. مهندس اتصالات مبتدئ - عمّان =====
  {
    title: "مهندس اتصالات مبتدئ (Junior Telecom Engineer)",
    companyNameText: "شركة اتصالات",
    city: "عمّان",
    jobCategory: "هندسة",
    jobType: "FULL_TIME",
    description: "مطلوب مهندس اتصالات مبتدئ للعمل في شركة اتصالات في عمان.\n\nيتضمن العمل دعم البنية التحتية لشبكات الاتصالات، صيانة أبراج الاتصال ومحطات القاعدة، تشخيص الأعطال الفنية، والمشاركة في مشاريع تمديد الشبكة.\n\nفرصة للتعلم والنمو في قطاع الاتصالات.",
    requirements: "بكالوريوس هندسة اتصالات أو كهربائية.\nمعرفة بأساسيات شبكات الاتصالات (2G/3G/4G/5G).\nعضوية نقابة المهندسين (أو في طور التسجيل).\nيفضل خبرة تدريبية في شركة اتصالات.",
    experienceLevel: "ENTRY",
    educationLevel: "BACHELOR",
    skills: "اتصالات,شبكات,4G,5G,صيانة",
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 22. أخصائي GBV - منظمة دولية =====
  {
    title: "أخصائي/ة العنف المبني على النوع الاجتماعي (GBV Specialist)",
    companyNameText: "Un Ponte Per (منظمة دولية)",
    city: "عمّان",
    jobCategory: "أخرى",
    jobType: "FULL_TIME",
    description: "تعلن منظمة Un Ponte Per عن حاجتها لأخصائي/ة في مجال العنف المبني على النوع الاجتماعي (GBV) للعمل في مكتب عمان.\n\nوظيفة وطنية للأردنيين. تشمل المهام تقديم الدعم النفسي والاجتماعي للناجين/ات، تطوير وتنفيذ البرامج الوقائية، التنسيق مع الجهات الشريكة، وإعداد التقارير.\n\nالموعد النهائي للتقديم: 13 يونيو 2026.",
    requirements: "شهادة جامعية في العلوم الاجتماعية أو الإرشاد النفسي أو ما يعادلها.\nخبرة لا تقل عن 3 سنوات في مجال الحماية والعنف المبني على النوع الاجتماعي.\nخبرة في العمل مع المنظمات الدولية أو الإنسانية.\nإجادة اللغتين العربية والإنجليزية.",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "حماية,GBV,دعم نفسي,تقارير,تنسيق",
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://reliefweb.int/jobs?country=122",
    sourceType: "PUBLIC_NGO_SOURCE",
    sourceName: "ReliefWeb / Un Ponte Per",
    sourceUrl: "https://reliefweb.int/jobs?country=122",
    sourceTrustLevel: "HIGH",
  },

  // ===== 23. مستشار قانوني - AWO =====
  {
    title: "مستشار/ة قانوني/ة (Legal Adviser)",
    companyNameText: "AWO (منظمة إنسانية)",
    city: "عمّان",
    jobCategory: "قانون ومحاماة",
    jobType: "FULL_TIME",
    description: "مطلوب مستشار/ة قانوني/ة للعمل مع منظمة AWO في عمان.\n\nتشمل المهام تقديم الاستشارات القانونية للمستفيدين واللاجئين، دعم البرامج القانونية والتوعوية، إعداد المذكرات والتقارير القانونية، والتنسيق مع الجهات الرسمية والقضائية.\n\nالموعد النهائي: 7 يونيو 2026.",
    requirements: "شهادة بكالوريوس في القانون.\nخبرة في المجال الإنساني والقانوني.\nمعرفة بالقانون الأردني والقانون الدولي الإنساني.\nإجادة اللغة الإنجليزية.",
    experienceLevel: "MID",
    educationLevel: "BACHELOR",
    skills: "قانون,استشارات قانونية,حقوق إنسان,قانون دولي",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://reliefweb.int/jobs?country=122",
    sourceType: "PUBLIC_NGO_SOURCE",
    sourceName: "ReliefWeb / AWO",
    sourceUrl: "https://reliefweb.int/jobs?country=122",
    sourceTrustLevel: "HIGH",
  },

  // ===== 24. تدريب إدارة معلومات - Plan International =====
  {
    title: "تدريب إدارة معلومات (Information Management Internship)",
    companyNameText: "Plan International",
    city: "عمّان",
    jobCategory: "تكنولوجيا المعلومات",
    jobType: "INTERNSHIP",
    description: "فرصة تدريب في مجال إدارة المعلومات لدى منظمة Plan International في عمان.\n\nيشمل التدريب العمل مع قواعد البيانات وأنظمة إدارة المعلومات، المساعدة في جمع وتحليل البيانات، دعم فريق المعلومات والرصد والتقييم، وتعلم أدوات تحليل البيانات.\n\nبدل تدريب شهري.",
    requirements: "طالب/ة سنة أخيرة أو خريج/ة حديث/ة في تخصص علوم حاسوب، نظم معلومات، أو ما يعادلها.\nمعرفة بـ Excel وأدوات تحليل البيانات.\nمهارات تنظيمية جيدة.\nإجادة اللغة الإنجليزية.",
    experienceLevel: "NO_EXPERIENCE",
    educationLevel: "BACHELOR",
    skills: "إدارة معلومات,Excel,تحليل بيانات,قواعد بيانات",
    womenFriendly: true,
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://reliefweb.int/jobs?country=122",
    sourceType: "PUBLIC_NGO_SOURCE",
    sourceName: "ReliefWeb / Plan International",
    sourceUrl: "https://reliefweb.int/jobs?country=122",
    sourceTrustLevel: "HIGH",
  },

  // ===== 25. كابتن توصيل كريم =====
  {
    title: "كابتن توصيل - كريم (Careem Captain)",
    companyNameText: "Careem (كريم)",
    city: "عمّان",
    jobCategory: "نقل وتوصيل",
    jobType: "PART_TIME",
    description: "سجّل الآن ككابتن توصيل مع تطبيق كريم في الأردن!\n\nساعات عمل مرنة ودخل تنافسي يعتمد على عدد الطلبات. يشمل العمل توصيل الطلبات والركاب في مدينتك. اعمل بالوقت الذي يناسبك واحصل على دخل إضافي.\n\nالتسجيل مفتوح في عمّان، إربد، والزرقاء.",
    requirements: "العمر 18 سنة فأكثر.\nرخصة قيادة أردنية سارية.\nمركبة خاصة (سيارة أو دراجة نارية/سكوتر).\nهاتف ذكي مع اتصال بالإنترنت.\nسجل جنائي نظيف.",
    salaryText: "نظام عمولات - دخل مرن",
    experienceLevel: "NO_EXPERIENCE",
    educationLevel: "NONE",
    requiresDrivingLicense: true,
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.careem.com",
    sourceType: "COMPANY_CAREERS_PAGE",
    sourceName: "Careem",
    sourceUrl: "https://www.careem.com",
    sourceTrustLevel: "HIGH",
  },

  // ===== 26. سائق توصيل طلبات =====
  {
    title: "سائق توصيل - طلبات (Talabat Rider)",
    companyNameText: "Talabat (طلبات)",
    city: "عمّان",
    jobCategory: "نقل وتوصيل",
    jobType: "PART_TIME",
    description: "انضم لفريق توصيل طلبات في الأردن!\n\nمطلوب سائقين ومندوبي توصيل للعمل مع تطبيق طلبات. قم بتوصيل الطلبات من المطاعم والمتاجر إلى الزبائن واحصل على دخل يومي.\n\nساعات عمل مرنة تناسب التزاماتك. التسجيل مفتوح في عمّان ومدن أردنية أخرى.",
    requirements: "العمر 18 سنة فأكثر.\nهاتف ذكي حديث مع اتصال بالإنترنت.\nوسيلة نقل (سيارة أو دراجة نارية أو دراجة هوائية).\nمعرفة جيدة بمناطق المدينة.",
    salaryText: "نظام عمولات يومي",
    experienceLevel: "NO_EXPERIENCE",
    educationLevel: "NONE",
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.talabat.com",
    sourceType: "COMPANY_CAREERS_PAGE",
    sourceName: "Talabat",
    sourceUrl: "https://www.talabat.com",
    sourceTrustLevel: "HIGH",
  },

  // ===== 27. طاهٍ فندق - العقبة =====
  {
    title: "طاهٍ (Commis 1) - فندق في العقبة",
    companyNameText: "فندق 5 نجوم - العقبة",
    city: "العقبة",
    jobCategory: "ضيافة ومطاعم",
    jobType: "FULL_TIME",
    description: "مطلوب طاهٍ (Commis 1) للعمل في قسم المطبخ بأحد الفنادق الكبرى في مدينة العقبة.\n\nيشمل العمل تحضير الأطباق وفقاً للوصفات ومعايير الفندق الدولية، المساعدة في تجهيز المكونات، الحفاظ على نظافة المطبخ وسلامة الغذاء، والعمل ضمن فريق المطبخ.\n\nسكن وتغذية مؤمنة من الفندق.",
    requirements: "خبرة في الطهي الفندقي لا تقل عن سنتين.\nشهادة في فنون الطهي أو إدارة الفنادق (مفضلة).\nالقدرة على العمل بنظام الورديات.\nالاستعداد للإقامة في العقبة.",
    benefits: "سكن مؤمن.\nوجبات يومية.\nتأمين صحي.\nإجازات سنوية مدفوعة.",
    experienceLevel: "JUNIOR",
    educationLevel: "DIPLOMA",
    skills: "طهي فندقي,مطبخ عالمي,سلامة غذاء,HACCP",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 28. هاوس كيبنج - فندق العقبة =====
  {
    title: "موظف/ة نظافة غرف (Housekeeping Attendant) - فندق",
    companyNameText: "فندق في العقبة",
    city: "العقبة",
    jobCategory: "ضيافة ومطاعم",
    jobType: "FULL_TIME",
    description: "مطلوب موظف/ة نظافة غرف (Housekeeping) للعمل في فنادق العقبة.\n\nتشمل المهام تنظيف الغرف وترتيبها وفق معايير الفندق الدولية، تغيير المفارش والمناشف، إعادة تعبئة اللوازم، والإبلاغ عن أي أعطال في الغرف.\n\nسكن وتغذية من الفندق.",
    requirements: "القدرة على العمل بنظام الورديات.\nلياقة بدنية جيدة.\nالاهتمام بالنظافة والتفاصيل.\nلا يشترط خبرة سابقة (يوجد تدريب).",
    benefits: "سكن مؤمن.\nوجبات يومية.\nتأمين صحي.",
    experienceLevel: "NO_EXPERIENCE",
    educationLevel: "NONE",
    noExperienceRequired: true,
    womenFriendly: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "MEDIUM",
  },

  // ===== 29. مدير مبيعات أول - فندق العقبة =====
  {
    title: "مدير مبيعات أول (Senior Sales Manager) - فندق",
    companyNameText: "فندق في العقبة",
    city: "العقبة",
    jobCategory: "مبيعات وتسويق",
    jobType: "FULL_TIME",
    description: "مطلوب مدير مبيعات أول للعمل في فندق في مدينة العقبة.\n\nالمهام تشمل تطوير وتنفيذ استراتيجيات المبيعات، إدارة العلاقات مع الشركات والوكالات السياحية، تحقيق الأهداف البيعية الشهرية والسنوية، إعداد العروض والاقتراحات للعملاء، والإشراف على فريق المبيعات.\n\nراتب مجزي مع عمولات.",
    requirements: "خبرة 5+ سنوات في مبيعات الفنادق أو القطاع السياحي.\nبكالوريوس إدارة أعمال أو سياحة وفنادق.\nشبكة علاقات في قطاع السياحة.\nإجادة اللغة الإنجليزية.\nمعرفة بأنظمة حجوزات الفنادق.",
    experienceLevel: "SENIOR",
    educationLevel: "BACHELOR",
    skills: "مبيعات فنادق,سياحة,إدارة علاقات,Revenue Management",
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceType: "ADMIN_MANUAL",
    sourceName: "bayt.com",
    sourceUrl: "https://www.bayt.com/ar/jordan/jobs/",
    sourceTrustLevel: "HIGH",
  },

  // ===== 30. كاشير مطعم - إربد =====
  {
    title: "كاشير / موظف مبيعات - مطعم في إربد",
    companyNameText: "مطعم في إربد",
    city: "إربد",
    jobCategory: "ضيافة ومطاعم",
    jobType: "FULL_TIME",
    description: "مطلوب كاشير وموظف مبيعات للعمل في مطعم في مدينة إربد.\n\nتشمل المهام استقبال الطلبات من الزبائن، تشغيل نظام الكاشير ومحاسبة الزبائن، ترتيب المعروضات، والحفاظ على نظافة منطقة العمل.\n\nالعمل يبدأ فوراً.",
    requirements: "مهارات تواصل جيدة وخدمة زبائن.\nالقدرة على التعامل مع النقد وأنظمة الدفع.\nالالتزام بمواعيد العمل.\nيفضل خبرة سابقة في المجال.",
    experienceLevel: "ENTRY",
    educationLevel: "NONE",
    skills: "كاشير,محاسبة زبائن,خدمة عملاء",
    noExperienceRequired: true,
    contactMethod: "EXTERNAL_LINK",
    externalUrl: "https://wazaf.net",
    sourceType: "ADMIN_MANUAL",
    sourceName: "wazaf.net / opensooq.com",
    sourceUrl: "https://wazaf.net",
    sourceTrustLevel: "MEDIUM",
  },
];

async function main() {
  console.log(`\n🚀 بدء إدراج ${jobs.length} وظيفة حقيقية...\n`);

  let inserted = 0;
  let errors = 0;

  for (const job of jobs) {
    try {
      const created = await prisma.job.create({
        data: {
          slug: slug(job.title),
          title: job.title,
          companyNameText: job.companyNameText,
          companyRelation: "CURATED_EXTERNAL",
          city: job.city,
          area: job.area || null,
          jobCategory: job.jobCategory,
          jobType: job.jobType,
          description: job.description,
          requirements: job.requirements || null,
          responsibilities: job.responsibilities || null,
          benefits: job.benefits || null,
          experienceLevel: job.experienceLevel,
          educationLevel: job.educationLevel,
          skills: job.skills || null,
          salaryText: job.salaryText || null,
          salaryMin: job.salaryMin || null,
          salaryMax: job.salaryMax || null,
          womenFriendly: job.womenFriendly || false,
          noExperienceRequired: job.noExperienceRequired || false,
          requiresDrivingLicense: job.requiresDrivingLicense || false,
          contactMethod: job.contactMethod,
          externalUrl: job.externalUrl || null,
          sourceType: job.sourceType,
          sourceName: job.sourceName,
          sourceUrl: job.sourceUrl || null,
          sourceTrustLevel: job.sourceTrustLevel,
          status: "PUBLISHED",
          publishedAt: now,
          expiresAt: expiresAt,
          sourceVerifiedAt: now,
        },
      });
      inserted++;
      console.log(`  ✅ [${inserted}] ${created.title} → ${created.city}${job.area ? ` (${job.area})` : ""}`);
    } catch (err: any) {
      errors++;
      console.error(`  ❌ خطأ في "${job.title}": ${err.message}`);
    }
  }

  // Show totals
  const total = await prisma.job.count();
  const published = await prisma.job.count({ where: { status: "PUBLISHED" } });

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ تم إدراج: ${inserted} وظيفة`);
  console.log(`❌ أخطاء: ${errors}`);
  console.log(`📊 إجمالي الوظائف في قاعدة البيانات: ${total}`);
  console.log(`📢 الوظائف المنشورة: ${published}`);
  console.log(`${"=".repeat(60)}\n`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
