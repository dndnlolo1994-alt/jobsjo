"use client";

import React, { useState } from "react";
import { saveCvAction } from "@/lib/actions/platform";

interface CvEditorFormProps {
  cv: any;
  defaultEmail: string;
  defaultFullName: string;
  isPaid?: boolean;
  billingStatus?: string;
  /** Photo is a Plus-only feature. */
  isPlus?: boolean;
  siteUrl?: string;
}

export function CvEditorForm({ cv, defaultEmail, defaultFullName, isPaid = false, billingStatus = "UNPAID", isPlus = false, siteUrl = "" }: CvEditorFormProps) {
  // QR points to the real public verification page on the live domain.
  const qrBase = (siteUrl || "").replace(/\/$/, "");
  const qrVerifyId = cv?.userId || cv?.id || "verify";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`${qrBase}/cv/${qrVerifyId}`)}`;
  const qrLabel = `${qrBase.replace(/^https?:\/\//, "")}/cv`;
  const [activeTab, setActiveTab] = useState<"basic" | "experiences" | "educations" | "skills" | "certifications" | "translation" | "design">("basic");
  
  // Premium Pre-populated Defaults
  const DEFAULT_EXPERIENCES = [
    { id: "exp1", position: "موظف خدمة عملاء كبار الشخصيات", company: "شركة زين للاتصالات", city: "عمان", startDate: "2024", endDate: "حتى الآن", description: "- تقديم الدعم والحلول لكبار العملاء وحل المشكلات المتعلقة بالخدمات والمنتجات بمهنية عالية.\n- المساهمة في زيادة رضا العملاء بنسبة 15% من خلال المتابعة الحثيثة." },
    { id: "exp2", position: "موظف مبيعات معرض", company: "مجموعة المناصير", city: "عمان", startDate: "2022", endDate: "2023", description: "- ترويج وبيع المنتجات والخدمات للعملاء مباشرة والإجابة عن استفساراتهم.\n- تحقيق المستهدف البيعي للمبيعات بنسبة تفوق 10% شهرياً." }
  ];

  const DEFAULT_EDUCATIONS = [
    { id: "edu1", degree: "بكالوريوس إدارة أعمال", institution: "الجامعة الأردنية", city: "عمان", startDate: "2018", endDate: "2022", description: "معدل تراكمي ممتاز 3.8 / 4.0" }
  ];

  const DEFAULT_SKILLS = [
    { id: "s1", name: "خدمة العملاء والاتصال", level: 5 },
    { id: "s2", name: "حل المشكلات والنزاعات", level: 4 },
    { id: "s3", name: "مهارات التفاوض والإقناع", level: 4 },
    { id: "s4", name: "استخدام حزم برامج Office", level: 4 }
  ];

  const DEFAULT_CERTIFICATIONS = [
    { id: "c1", name: "شهادة مهارات حاسوب ICDL", issuer: "مركز طلال أبو غزالة للتدريب", year: "2022" },
    { id: "c2", name: "دورة التميز في تقديم الخدمة", issuer: "أكاديمية زين", year: "2023" }
  ];

  // Basic states
  const [photo, setPhoto] = useState<string>(cv?.photo ?? "");
  const [template, setTemplate] = useState<string>(cv?.template ?? "modern-emerald");

  // Visual/Word editing states
  const [fullName, setFullName] = useState<string>(cv?.fullName ?? defaultFullName);
  const [jobTitle, setJobTitle] = useState<string>(cv?.jobTitle ?? "");
  const [email, setEmail] = useState<string>(cv?.email ?? defaultEmail);
  const [phone, setPhone] = useState<string>(cv?.phone ?? "");
  const [city, setCity] = useState<string>(cv?.city ?? "");
  const [website, setWebsite] = useState<string>(cv?.website ?? "");
  const [linkedin, setLinkedin] = useState<string>(cv?.linkedin ?? "");
  const [summary, setSummary] = useState<string>(cv?.summary ?? "موظف خدمة عملاء متميز بخبرة عملية تتجاوز 3 سنوات في الأسواق المحلية، أسعى لتوظيف مهاراتي في الاتصال والتفاوض وحل مشكلات العملاء لتحقيق أهداف الشركة وضمان رضا العملاء التام.");

  const [editorMode, setEditorMode] = useState<"classic" | "visual">("visual"); // Open by default!
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [showPrintLockModal, setShowPrintLockModal] = useState(false); // Lock modal state

  // Arrays states - load database or premium defaults if empty
  const [experiences, setExperiences] = useState<any[]>(() => {
    if (cv?.experiences && cv.experiences.length > 0) return cv.experiences;
    return DEFAULT_EXPERIENCES;
  });
  const [educations, setEducations] = useState<any[]>(() => {
    if (cv?.educations && cv.educations.length > 0) return cv.educations;
    return DEFAULT_EDUCATIONS;
  });
  const [skills, setSkills] = useState<any[]>(() => {
    if (cv?.skills && cv.skills.length > 0) return cv.skills;
    return DEFAULT_SKILLS;
  });
  const [certifications, setCertifications] = useState<any[]>(() => {
    if (cv?.certifications && cv.certifications.length > 0) return cv.certifications;
    return DEFAULT_CERTIFICATIONS;
  });

  // English version state
  const [englishVersion, setEnglishVersion] = useState<any>(() => {
    if (cv?.englishVersion) {
      try {
        return JSON.parse(cv.englishVersion);
      } catch (e) {}
    }
    return {
      fullName: "",
      jobTitle: "",
      summary: "",
      experiences: [],
      educations: [],
      skills: [],
      certifications: []
    };
  });

  // Form submit state
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Experience entry temp state
  const [tempExp, setTempExp] = useState({ position: "", company: "", city: "", startDate: "", endDate: "", description: "" });
  // Education entry temp state
  const [tempEdu, setTempEdu] = useState({ degree: "", institution: "", city: "", startDate: "", endDate: "", description: "" });
  // Skill temp state
  const [tempSkill, setTempSkill] = useState({ name: "", level: "3" });
  // Cert temp state
  const [tempCert, setTempCert] = useState({ name: "", issuer: "", year: "" });

  const handleAutoTranslate = () => {
    const arName = (document.getElementsByName("fullName")[0] as HTMLInputElement)?.value || defaultFullName;
    const arJobTitle = (document.getElementsByName("jobTitle")[0] as HTMLInputElement)?.value || "";
    const arSummary = (document.getElementsByName("summary")[0] as HTMLInputElement)?.value || "";

    const dict: Record<string, string> = {
      "محمد": "Mohammad", "أحمد": "Ahmad", "عمر": "Omar", "سارة": "Sara", "خالد": "Khaled",
      "محاسب": "Accountant", "مهندس": "Engineer", "برمجيات": "Software", "مطور": "Developer",
      "كاشير": "Cashier", "مبيعات": "Sales", "خدمة عملاء": "Customer Service", "سائق": "Driver",
      "معلم": "Teacher", "مدرس": "Teacher", "طبيب": "Doctor", "ممرض": "Nurse", "صيدلاني": "Pharmacist",
      "مدير": "Manager", "أمين مستودع": "Warehouse Keeper", "طباخ": "Cook", "شيف": "Chef",
      "عمان": "Amman", "عمّان": "Amman", "إربد": "Irbid", "اربد": "Irbid", "الزرقاء": "Zarqa",
      "العقبة": "Aqaba", "السلط": "Salt", "مادبا": "Madaba", "الكرك": "Karak", "معان": "Ma'an",
      "بكالوريوس": "Bachelor's Degree", "ماجستير": "Master's Degree", "دبلوم": "Diploma",
      "ثانوية": "High School", "مدرسة": "School", "جامعة": "University", "كلية": "College",
      "شركة": "Company", "البنك": "Bank", "بنك": "Bank", "مستشفى": "Hospital", "مركز": "Center"
    };

    const translateText = (text: string) => {
      if (!text) return "";
      let t = text;
      Object.keys(dict).forEach((key) => {
        t = t.replace(new RegExp(key, "g"), dict[key]);
      });
      return t;
    };

    const translatedName = translateText(arName);
    const translatedTitle = translateText(arJobTitle);
    const translatedSummary = translateText(arSummary);

    const translatedExps = experiences.map((exp, idx) => {
      const existing = englishVersion.experiences?.[idx] || {};
      return {
        position: existing.position || translateText(exp.position),
        company: existing.company || translateText(exp.company),
        description: existing.description || (exp.description ? translateText(exp.description) : "")
      };
    });

    const translatedEdus = educations.map((edu, idx) => {
      const existing = englishVersion.educations?.[idx] || {};
      return {
        degree: existing.degree || translateText(edu.degree),
        institution: existing.institution || translateText(edu.institution),
        description: existing.description || (edu.description ? translateText(edu.description) : "")
      };
    });

    const translatedSkills = skills.map((skill, idx) => {
      const existing = englishVersion.skills?.[idx] || {};
      return {
        name: existing.name || translateText(skill.name),
        level: existing.level || skill.level,
      };
    });

    const translatedCerts = certifications.map((cert, idx) => {
      const existing = englishVersion.certifications?.[idx] || {};
      return {
        name: existing.name || translateText(cert.name),
        issuer: existing.issuer || translateText(cert.issuer || ""),
        year: existing.year || cert.year,
      };
    });

    setEnglishVersion({
      ...englishVersion,
      fullName: englishVersion.fullName || translatedName,
      jobTitle: englishVersion.jobTitle || translatedTitle,
      summary: englishVersion.summary || translatedSummary,
      experiences: translatedExps,
      educations: translatedEdus,
      skills: translatedSkills,
      certifications: translatedCerts,
    });

    alert("تم توليد ترجمة تقريبية للبيانات بالإنجليزية! يرجى مراجعة وتدقيق الاسم والمصطلحات وتصحيحها إذا وجد أي خطأ.");
  };



  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3000000) {
        alert("حجم الصورة كبير جداً، يرجى اختيار صورة أصغر من 3 ميغابايت لضمان سرعة التحميل.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExperience = () => {
    if (!tempExp.position || !tempExp.company || !tempExp.startDate) {
      alert("يرجى ملء المسمى الوظيفي والشركة وتاريخ البدء على الأقل");
      return;
    }
    setExperiences([...experiences, { ...tempExp, id: Date.now().toString() }]);
    setTempExp({ position: "", company: "", city: "", startDate: "", endDate: "", description: "" });
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id && e.position !== id));
  };

  const handleAddEducation = () => {
    if (!tempEdu.degree || !tempEdu.institution || !tempEdu.startDate) {
      alert("يرجى ملء الدرجة والجهة التعليمية وتاريخ البدء على الأقل");
      return;
    }
    setEducations([...educations, { ...tempEdu, id: Date.now().toString() }]);
    setTempEdu({ degree: "", institution: "", city: "", startDate: "", endDate: "", description: "" });
  };

  const handleRemoveEducation = (id: string) => {
    setEducations(educations.filter((e) => e.id !== id && e.degree !== id));
  };

  const handleAddSkill = () => {
    if (!tempSkill.name) {
      alert("يرجى إدخال اسم المهارة");
      return;
    }
    setSkills([...skills, { name: tempSkill.name, level: parseInt(tempSkill.level), id: Date.now().toString() }]);
    setTempSkill({ name: "", level: "3" });
  };

  const handleRemoveSkill = (name: string) => {
    setSkills(skills.filter((s) => s.name !== name));
  };

  const handleAddCert = () => {
    if (!tempCert.name) {
      alert("يرجى إدخال اسم الشهادة");
      return;
    }
    setCertifications([...certifications, { ...tempCert, id: Date.now().toString() }]);
    setTempCert({ name: "", issuer: "", year: "" });
  };

  const handleRemoveCert = (name: string) => {
    setCertifications(certifications.filter((c) => c.name !== name));
  };

  const handleAddExperienceDirectly = () => {
    setExperiences([...experiences, { id: Date.now().toString(), position: "مسمى وظيفي جديد", company: "اسم الشركة", city: "عمان", startDate: "2024", endDate: "حتى الآن", description: "شرح المهام والإنجازات..." }]);
  };
  const handleRemoveExperienceDirectly = (index: number) => {
    setExperiences(experiences.filter((_, idx) => idx !== index));
  };
  const handleAddEducationDirectly = () => {
    setEducations([...educations, { id: Date.now().toString(), degree: "الشهادة / التخصص الدراسي", institution: "اسم الجامعة أو المعهد", city: "عمان", startDate: "2020", endDate: "2024", description: "" }]);
  };
  const handleRemoveEducationDirectly = (index: number) => {
    setEducations(educations.filter((_, idx) => idx !== index));
  };
  const handleAddSkillDirectly = () => {
    setSkills([...skills, { id: Date.now().toString(), name: "مهارة جديدة", level: 3 }]);
  };
  const handleRemoveSkillDirectly = (index: number) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };
  const handleAddCertDirectly = () => {
    setCertifications([...certifications, { id: Date.now().toString(), name: "دورة أو شهادة جديدة", issuer: "الجهة المانحة", year: "2024" }]);
  };
  const handleRemoveCertDirectly = (index: number) => {
    setCertifications(certifications.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage("");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("jobTitle", jobTitle);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("city", city);
    formData.append("website", website);
    formData.append("linkedin", linkedin);
    formData.append("summary", summary);
    formData.append("photo", photo);
    formData.append("template", template);
    formData.append("experiencesJson", JSON.stringify(experiences));
    formData.append("educationsJson", JSON.stringify(educations));
    formData.append("skillsJson", JSON.stringify(skills));
    formData.append("certificationsJson", JSON.stringify(certifications));
    formData.append("englishVersion", JSON.stringify(englishVersion));

    const res = await saveCvAction(null, formData);
    setIsPending(false);
    if (res.ok) {
      setIsSuccess(true);
      setMessage(res.message || "تم حفظ السيرة الذاتية بنجاح");
      setTimeout(() => setIsSuccess(false), 4000);
    } else {
      setIsSuccess(false);
      setMessage(res.message || "حدث خطأ ما");
    }
  };

  const tabs = [
    { id: "basic", name: "البيانات الأساسية", icon: "👤" },
    { id: "experiences", name: "الخبرات العملية", icon: "💼" },
    { id: "educations", name: "التعليم والدراسة", icon: "🎓" },
    { id: "skills", name: "المهارات المهنية", icon: "⚡" },
    { id: "certifications", name: "الشهادات والدورات", icon: "📜" },
    { id: "translation", name: "مراجعة وترجمة إنجليزي", icon: "🌐" },
    { id: "design", name: "تصميم السيرة", icon: "🎨" },
  ];

  if (editorMode === "visual") {
    const isEn = lang === "en";
    const t = (label: string) => {
      if (!isEn) return label;
      const trans: Record<string, string> = {
        "النبذة المهنية": "Professional Summary",
        "نبذة مهنية": "Professional Summary",
        "الملخص المهني": "Professional Summary",
        "الملخص التنفيذي": "Professional Summary",
        "الخبرات العملية": "Work Experience",
        "الخبرة المهنية": "Work Experience",
        "التعليم والدراسة": "Education",
        "التعليم والمؤهلات": "Education",
        "المهارات": "Skills",
        "الشهادات والدورات": "Certifications",
        "الشهادات المهنية": "Certifications",
        "الشهادات": "Certifications",
        "رمز التحقق": "Verification QR",
        "سيرة موثقة إلكترونياً": "Verified CV",
        "سيرة موثقة": "Verified CV",
        "الاتصال": "Contact",
        "الأردن": "Jordan",
        "حتى الآن": "Present",
        "باحث عن عمل": "Job Seeker",
        "رمز الاستجابة": "Verification QR",
      };
      return trans[label] || label;
    };

    const skillsWithLevels = [
      ...skills.map((s: any) => ({ name: s.name || s, level: s.level || 4 })),
    ].filter(s => s.name);

    return (
      <form onSubmit={handleSubmit} className="bg-[#0b120d] rounded-xl border border-navy-900 overflow-hidden shadow-2xl no-print">
        {/* Floating Top Control bar */}
        <div className="bg-navy-950 p-4 border-b border-navy-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <div className="text-right">
              <h3 className="font-extrabold text-sm text-emerald-400">المحرر البصري التفاعلي (Word Mode)</h3>
              <p className="text-[10px] text-navy-400">اضغط على أي نص مباشرة داخل القالب في الأسفل للكتابة والتعديل!</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status indicators */}
            {message && (
              <span className={`px-3 py-1 rounded text-xs font-bold ${
                isSuccess ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" : "bg-red-950 text-red-400 border border-red-900/50"
              }`}>
                {message}
              </span>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow active:scale-[0.98]"
            >
              {isPending ? "جاري الحفظ..." : "💾 حفظ التعديلات"}
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => {
                if (!isPaid) {
                  setShowPrintLockModal(true);
                } else {
                  window.location.href = `/me/cv/download?lang=${lang}`;
                }
              }}
              className="px-4 py-2 bg-[#c9a84c] hover:bg-[#b5953f] text-navy-955 rounded-lg text-xs font-bold transition-all shadow active:scale-[0.98]"
            >
              📥 فتح نسخة PDF
            </button>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="px-3 py-2 bg-navy-800 hover:bg-navy-700 text-slate-300 rounded-lg text-xs font-bold transition-all"
            >
              🌐 النسخة: {lang === "ar" ? "العربية" : "English"}
            </button>

            {/* Template Dropdown */}
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="bg-navy-800 text-white border border-navy-700 px-3 py-2 rounded-lg text-xs font-bold focus:outline-none"
            >
              <option value="modern-emerald">الزمردي الحديث (الأخضر/الذهبي)</option>
              <option value="classic-navy">الكحلي الكلاسيكي</option>
              <option value="executive-gold">الذهبي الفاخر</option>
              <option value="minimalist">بسيط وأنيق</option>
            </select>

            {/* Mode Switcher */}
            <button
              type="button"
              onClick={() => setEditorMode("classic")}
              className="px-4 py-2 bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-navy-800"
            >
              📝 استمارات الحقول
            </button>
          </div>
        </div>

        {/* Workspace Desk Area */}
        <div className="bg-[#0b120d] p-4 md:p-8 overflow-x-auto flex flex-col items-center">
          {/* Visual Workspace (Direct Editor) - Open for everyone */}
          <div className="w-full flex flex-col items-center gap-6">
              {/* Profile Photo selector in visual workspace (Plus-only) */}
              <div className="flex gap-4 items-center bg-navy-950 p-4 rounded-xl border border-navy-800 w-full max-w-[794px] justify-between text-white text-xs">
                {isPlus ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full border border-[#c2a06c] overflow-hidden bg-navy-900 flex items-center justify-center relative group">
                        {photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo} alt="Photo" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🧑</span>
                        )}
                        <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-bold cursor-pointer transition-opacity">
                          تغيير
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-200">صورة السيرة الذاتية</p>
                        <p className="text-[10px] text-slate-400">انقر على الصورة لتغييرها أو رفع صورة جديدة</p>
                      </div>
                    </div>
                    {photo && (
                      <button type="button" onClick={() => setPhoto("")} className="px-3 py-1.5 bg-red-950/50 text-red-400 hover:bg-red-900 hover:text-white rounded-lg border border-red-900/50 font-bold transition-all">
                        إزالة الصورة
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-[#c2a06c]/40 bg-navy-900 flex items-center justify-center text-xl shrink-0">🔒</div>
                    <div className="text-right">
                      <p className="font-bold text-slate-200">الصورة الشخصية ميزة في باقة Plus</p>
                      <p className="text-[10px] text-slate-400">
                        السيرة المجانية تُنشأ بدون صورة شخصية.{" "}
                        <a href="/pricing" className="text-emerald-400 font-bold underline">الترقية إلى Plus ⚡</a>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Render Modern Emerald visual editor */}
              {template === "modern-emerald" && (
                <div className="bg-white text-navy-955 w-[794px] min-h-[1123px] shadow-2xl relative flex flex-col p-0 border border-slate-200 rounded" dir={isEn ? "ltr" : "rtl"}>
                  {/* Visual Header */}
                  <div className="bg-[#084c41] text-white h-[160px] min-h-[160px] px-10 flex items-center relative overflow-hidden">
                    <div className="absolute inset-x-0 bottom-0 h-[5px] bg-[#c2a06c]" />
                    <div className="flex items-center justify-between w-full z-10" dir="ltr">
                      {/* Name and job Title */}
                      <div className={`flex flex-col flex-grow ${isEn ? "text-left" : "text-right"}`} dir={isEn ? "ltr" : "rtl"}>
                        <input
                          value={isEn ? (englishVersion.fullName || "") : fullName}
                          onChange={(e) => {
                            if (isEn) {
                              setEnglishVersion({ ...englishVersion, fullName: e.target.value });
                            } else {
                              setFullName(e.target.value);
                            }
                          }}
                          className={`bg-transparent text-white font-extrabold text-2xl border-none outline-none focus:ring-2 focus:ring-[#c2a06c]/50 hover:bg-white/5 p-1 rounded max-w-md ${isEn ? "text-left" : "text-right"}`}
                          placeholder="اكتب اسمك الكامل هنا..."
                        />
                        <input
                          value={isEn ? (englishVersion.jobTitle || "") : jobTitle}
                          onChange={(e) => {
                            if (isEn) {
                              setEnglishVersion({ ...englishVersion, jobTitle: e.target.value });
                            } else {
                              setJobTitle(e.target.value);
                            }
                          }}
                          className={`bg-transparent text-[#c2a06c] font-bold text-sm border-none outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/5 p-1 rounded max-w-sm mt-1 ${isEn ? "text-left" : "text-right"}`}
                          placeholder="المسمى الوظيفي..."
                        />
                      </div>
                      
                      {/* Photo Frame (Plus-only) */}
                      {isPlus && (
                        <div className="relative shrink-0">
                          <div className="w-[102px] h-[102px] rounded-full border-2 border-[#c2a06c] flex items-center justify-center p-[2px] bg-transparent">
                            {photo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={photo} alt={fullName} className="w-24 h-24 rounded-full object-cover border-[3px] border-white shadow-sm" />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-white border-[3px] border-white shadow-sm" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Columns Container */}
                  <div className="flex-grow flex flex-row overflow-hidden" dir="ltr">
                    {/* Left Column (Main Body) */}
                    <div className="w-[67%] bg-white p-8 border-l-[16px] border-[#084c41] flex flex-col justify-between" dir={isEn ? "ltr" : "rtl"}>
                      <div className="space-y-6">
                        {/* Summary Section */}
                        <section className="relative group">
                          <h2 className="text-sm font-extrabold text-[#084c41] mb-1 flex items-center gap-2">
                            {t("نبذة مهنية")}
                          </h2>
                          <div className="w-10 h-0.5 bg-[#c2a06c] mb-2" />
                          <textarea
                            value={isEn ? (englishVersion.summary || "") : summary}
                            onChange={(e) => {
                              if (isEn) {
                                setEnglishVersion({ ...englishVersion, summary: e.target.value });
                              } else {
                                setSummary(e.target.value);
                              }
                            }}
                            className="bg-transparent border-none text-[10.5px] text-slate-800 leading-[1.55] text-justify w-full p-1 outline-none focus:ring-2 focus:ring-[#c2a06c]/40 hover:bg-slate-50 min-h-[70px] resize-y rounded"
                            placeholder="اكتب ملخصاً مهنياً يلخص مهاراتك وخبراتك..."
                          />
                        </section>

                        {/* Experience Section */}
                        <section className="relative">
                          <div className="flex justify-between items-center border-b border-[#c2a06c]/30 pb-1 mb-3">
                            <h2 className="text-sm font-extrabold text-[#084c41]">
                              {t("الخبرات العملية")}
                            </h2>
                            <button
                              type="button"
                              onClick={handleAddExperienceDirectly}
                              className="px-2 py-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-all shrink-0"
                            >
                              ➕ إضافة خبرة
                            </button>
                          </div>
                          
                          <div className="relative">
                            <div className="absolute left-[100px] top-2 bottom-2 w-[1px] bg-[#c2a06c]/30" />
                            <div className="space-y-4">
                              {experiences.map((exp, idx) => (
                                <div key={exp.id || idx} className="group relative flex flex-row gap-3 items-start text-[11px] hover:bg-slate-50/50 p-2 rounded transition-all" dir="ltr">
                                  {/* Left: Date */}
                                  <div className="w-[80px] shrink-0 text-right space-y-1">
                                    <input
                                      value={exp.startDate || ""}
                                      onChange={(e) => {
                                        const updated = [...experiences];
                                        updated[idx].startDate = e.target.value;
                                        setExperiences(updated);
                                      }}
                                      className="bg-transparent border-none text-slate-600 font-bold text-[10px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                      placeholder="مثال: 2022-01"
                                    />
                                    <input
                                      value={exp.endDate || ""}
                                      onChange={(e) => {
                                        const updated = [...experiences];
                                        updated[idx].endDate = e.target.value;
                                        setExperiences(updated);
                                      }}
                                      className="bg-transparent border-none text-[#c2a06c] font-semibold text-[9px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                      placeholder="حتى الآن"
                                    />
                                  </div>
                                  
                                  {/* Middle: Dot */}
                                  <div className="w-4 flex justify-center pt-1.5 shrink-0 z-10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#c2a06c] border-2 border-white shadow-sm" />
                                  </div>
                                  
                                  {/* Right: Content */}
                                  <div className="flex-1 min-w-0 text-right pr-2 space-y-1" dir={isEn ? "ltr" : "rtl"}>
                                    <div className="flex justify-between items-center">
                                      <input
                                        value={isEn ? (englishVersion.experiences?.[idx]?.position || "") : (exp.position || "")}
                                        onChange={(e) => {
                                          if (isEn) {
                                            const updated = [...(englishVersion.experiences || [])];
                                            updated[idx] = { ...(updated[idx] || {}), position: e.target.value };
                                            setEnglishVersion({ ...englishVersion, experiences: updated });
                                          } else {
                                            const updated = [...experiences];
                                            updated[idx].position = e.target.value;
                                            setExperiences(updated);
                                          }
                                        }}
                                        className="bg-transparent border-none text-[#084c41] font-extrabold text-[12px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                        placeholder="المسمى الوظيفي"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExperienceDirectly(idx)}
                                        className="opacity-0 group-hover:opacity-100 text-[8px] text-red-500 hover:text-white hover:bg-red-600 font-bold transition-opacity border border-red-200 bg-white px-1.5 py-0.5 rounded ml-2 shrink-0"
                                      >
                                        حذف
                                      </button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <input
                                        value={isEn ? (englishVersion.experiences?.[idx]?.company || "") : (exp.company || "")}
                                        onChange={(e) => {
                                          if (isEn) {
                                            const updated = [...(englishVersion.experiences || [])];
                                            updated[idx] = { ...(updated[idx] || {}), company: e.target.value };
                                            setEnglishVersion({ ...englishVersion, experiences: updated });
                                          } else {
                                            const updated = [...experiences];
                                            updated[idx].company = e.target.value;
                                            setExperiences(updated);
                                          }
                                        }}
                                        className="bg-transparent border-none text-slate-700 font-bold text-[10px] w-1/2 text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                        placeholder="الشركة"
                                      />
                                      <input
                                        value={exp.city || ""}
                                        onChange={(e) => {
                                          const updated = [...experiences];
                                          updated[idx].city = e.target.value;
                                          setExperiences(updated);
                                        }}
                                        className="bg-transparent border-none text-slate-500 text-[10px] w-1/2 text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                        placeholder="المدينة"
                                      />
                                    </div>
                                    
                                    <textarea
                                      value={isEn ? (englishVersion.experiences?.[idx]?.description || "") : (exp.description || "")}
                                      onChange={(e) => {
                                        if (isEn) {
                                          const updated = [...(englishVersion.experiences || [])];
                                          updated[idx] = { ...(updated[idx] || {}), description: e.target.value };
                                          setEnglishVersion({ ...englishVersion, experiences: updated });
                                        } else {
                                          const updated = [...experiences];
                                          updated[idx].description = e.target.value;
                                          setExperiences(updated);
                                        }
                                      }}
                                      className="bg-transparent border-none text-slate-500 text-[9.5px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c] min-h-[40px] resize-y p-1 hover:bg-slate-50 rounded"
                                      placeholder="المهام الوظيفية والإنجازات..."
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>

                        {/* Education Section */}
                        <section className="relative">
                          <div className="flex justify-between items-center border-b border-[#c2a06c]/30 pb-1 mb-3">
                            <h2 className="text-sm font-extrabold text-[#084c41]">
                              {t("التعليم والدراسة")}
                            </h2>
                            <button
                              type="button"
                              onClick={handleAddEducationDirectly}
                              className="px-2 py-0.5 text-[9px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-all shrink-0"
                            >
                              ➕ إضافة تعليم
                            </button>
                          </div>
                          
                          <div className="relative">
                            <div className="absolute left-[100px] top-2 bottom-2 w-[1px] bg-[#c2a06c]/30" />
                            <div className="space-y-4">
                              {educations.map((edu, idx) => (
                                <div key={edu.id || idx} className="group relative flex flex-row gap-3 items-start text-[11px] hover:bg-slate-50/50 p-2 rounded transition-all" dir="ltr">
                                  {/* Left: Date */}
                                  <div className="w-[80px] shrink-0 text-right space-y-1">
                                    <input
                                      value={edu.startDate || ""}
                                      onChange={(e) => {
                                        const updated = [...educations];
                                        updated[idx].startDate = e.target.value;
                                        setEducations(updated);
                                      }}
                                      className="bg-transparent border-none text-slate-600 font-bold text-[10px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                      placeholder="مثال: 2018"
                                    />
                                    <input
                                      value={edu.endDate || ""}
                                      onChange={(e) => {
                                        const updated = [...educations];
                                        updated[idx].endDate = e.target.value;
                                        setEducations(updated);
                                      }}
                                      className="bg-transparent border-none text-[#c2a06c] font-semibold text-[9px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                      placeholder="2022"
                                    />
                                  </div>
                                  
                                  {/* Middle: Dot */}
                                  <div className="w-4 flex justify-center pt-1.5 shrink-0 z-10">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#c2a06c] border-2 border-white shadow-sm" />
                                  </div>
                                  
                                  {/* Right: Content */}
                                  <div className="flex-1 min-w-0 text-right pr-2 space-y-1" dir={isEn ? "ltr" : "rtl"}>
                                    <div className="flex justify-between items-center">
                                      <input
                                        value={isEn ? (englishVersion.educations?.[idx]?.degree || "") : (edu.degree || "")}
                                        onChange={(e) => {
                                          if (isEn) {
                                            const updated = [...(englishVersion.educations || [])];
                                            updated[idx] = { ...(updated[idx] || {}), degree: e.target.value };
                                            setEnglishVersion({ ...englishVersion, educations: updated });
                                          } else {
                                            const updated = [...educations];
                                            updated[idx].degree = e.target.value;
                                            setEducations(updated);
                                          }
                                        }}
                                        className="bg-transparent border-none text-[#084c41] font-extrabold text-[12px] w-full text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                        placeholder="الشهادة أو التخصص"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveEducationDirectly(idx)}
                                        className="opacity-0 group-hover:opacity-100 text-[8px] text-red-500 hover:text-white hover:bg-red-600 font-bold transition-opacity border border-red-200 bg-white px-1.5 py-0.5 rounded ml-2 shrink-0"
                                      >
                                        حذف
                                      </button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <input
                                        value={isEn ? (englishVersion.educations?.[idx]?.institution || "") : (edu.institution || "")}
                                        onChange={(e) => {
                                          if (isEn) {
                                            const updated = [...(englishVersion.educations || [])];
                                            updated[idx] = { ...(updated[idx] || {}), institution: e.target.value };
                                            setEnglishVersion({ ...englishVersion, educations: updated });
                                          } else {
                                            const updated = [...educations];
                                            updated[idx].institution = e.target.value;
                                            setEducations(updated);
                                          }
                                        }}
                                        className="bg-transparent border-none text-slate-700 font-bold text-[10px] w-1/2 text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                        placeholder="الجامعة"
                                      />
                                      <input
                                        value={edu.city || ""}
                                        onChange={(e) => {
                                          const updated = [...educations];
                                          updated[idx].city = e.target.value;
                                          setEducations(updated);
                                        }}
                                        className="bg-transparent border-none text-slate-500 text-[10px] w-1/2 text-right outline-none focus:ring-1 focus:ring-[#c2a06c]"
                                        placeholder="المدينة"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-slate-100 pt-3 mt-12 text-center text-[10px] font-extrabold text-[#084c41]">
                        {fullName} <span className="mx-1 text-slate-300">|</span> <span className="text-slate-400 font-normal">{jobTitle || t("باحث عن عمل")}</span>
                      </div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <aside className="w-[33%] bg-[#f4f6f5] p-6 flex flex-col justify-between" dir={isEn ? "ltr" : "rtl"}>
                      <div className="space-y-6">
                        {/* Contact Info */}
                        <section className="space-y-2">
                          <h3 className="text-[11px] font-bold text-[#084c41] uppercase tracking-wider pb-1 border-b border-[#c2a06c]/30">
                            {t("الاتصال")}
                          </h3>
                          <div className="text-[10px] space-y-2.5 text-slate-700 text-right">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[9px] shrink-0">📞</span>
                              <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="bg-transparent border-none text-[9.5px] w-full outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                placeholder="الهاتف..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[8px] shrink-0">✉</span>
                              <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-transparent border-none text-[9.5px] w-full outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                placeholder="الإيميل..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[9px] shrink-0">📍</span>
                              <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="bg-transparent border-none text-[9.5px] w-full outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                placeholder="المدينة..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[9px] shrink-0">🔗</span>
                              <input
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="bg-transparent border-none text-[9.5px] w-full outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                placeholder="رابط أعمالي / معرض الأعمال..."
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#084c41] text-white flex items-center justify-center text-[8px] shrink-0">in</span>
                              <input
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                                className="bg-transparent border-none text-[9.5px] w-full outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                placeholder="LinkedIn..."
                              />
                            </div>
                          </div>
                        </section>

                        {/* Skills Section */}
                        <section className="space-y-3">
                          <div className="flex justify-between items-center pb-1 border-b border-[#c2a06c]/30">
                            <h3 className="text-[11px] font-bold text-[#084c41] uppercase tracking-wider">
                              {t("المهارات")}
                            </h3>
                            <button
                              type="button"
                              onClick={handleAddSkillDirectly}
                              className="px-1.5 py-0.5 text-[8px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 rounded border border-emerald-100 transition-all shrink-0"
                            >
                              ➕
                            </button>
                          </div>
                          
                          <div className="space-y-3">
                            {skills.map((s, idx) => {
                              const engSkill = englishVersion.skills?.[idx] || {};
                              return (
                              <div key={s.id || idx} className="group relative space-y-1 hover:bg-white/40 p-1.5 rounded transition-all">
                                <div className="flex justify-between items-center text-[9.5px] font-bold text-slate-800">
                                  <input
                                    value={isEn ? (engSkill.name || "") : (s.name || "")}
                                    onChange={(e) => {
                                      if (isEn) {
                                        const updated = [...(englishVersion.skills || [])];
                                        updated[idx] = { ...engSkill, name: e.target.value, level: s.level };
                                        setEnglishVersion({ ...englishVersion, skills: updated });
                                      } else {
                                        const updated = [...skills];
                                        updated[idx].name = e.target.value;
                                        setSkills(updated);
                                      }
                                    }}
                                    className="bg-transparent border-none text-[9.5px] font-bold text-slate-800 w-2/3 outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                    placeholder="اسم المهارة..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSkillDirectly(idx)}
                                    className="opacity-0 group-hover:opacity-100 text-[8px] text-red-500 hover:text-red-700 font-bold transition-opacity ml-2 shrink-0"
                                  >
                                    حذف
                                  </button>
                                </div>
                                
                                {/* Clickable Progress stars */}
                                <div className="flex gap-1 items-center justify-end">
                                  {[1, 2, 3, 4, 5].map((lvl) => (
                                    <button
                                      key={lvl}
                                      type="button"
                                      onClick={() => {
                                        const updated = [...skills];
                                        updated[idx].level = lvl;
                                        setSkills(updated);
                                      }}
                                      className={`w-2.5 h-2.5 rounded-full border border-[#084c41]/50 transition-colors ${
                                        lvl <= s.level ? "bg-[#084c41]" : "bg-slate-200"
                                      }`}
                                      title={`مستوى ${lvl}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </section>

                        {/* Certifications Section */}
                        <section className="space-y-3">
                          <div className="flex justify-between items-center pb-1 border-b border-[#c2a06c]/30">
                            <h3 className="text-[11px] font-bold text-[#084c41] uppercase tracking-wider">
                              {t("الشهادات")}
                            </h3>
                            <button
                              type="button"
                              onClick={handleAddCertDirectly}
                              className="px-1.5 py-0.5 text-[8px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 rounded border border-emerald-100 transition-all shrink-0"
                            >
                              ➕
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {certifications.map((c, idx) => {
                              const engCert = englishVersion.certifications?.[idx] || {};
                              return (
                              <div key={c.id || idx} className="group relative text-[9px] p-2 bg-white rounded border border-[#084c41]/5 space-y-1 hover:border-[#c2a06c]/40 transition-all text-right">
                                <div className="flex justify-between items-center">
                                  <input
                                    value={isEn ? (engCert.name || "") : (c.name || "")}
                                    onChange={(e) => {
                                      if (isEn) {
                                        const updated = [...(englishVersion.certifications || [])];
                                        updated[idx] = { ...engCert, name: e.target.value, issuer: engCert.issuer || c.issuer, year: c.year };
                                        setEnglishVersion({ ...englishVersion, certifications: updated });
                                      } else {
                                        const updated = [...certifications];
                                        updated[idx].name = e.target.value;
                                        setCertifications(updated);
                                      }
                                    }}
                                    className="bg-transparent border-none font-bold text-slate-900 leading-tight w-4/5 outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                    placeholder="اسم الشهادة..."
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCertDirectly(idx)}
                                    className="opacity-0 group-hover:opacity-100 text-[8px] text-red-500 hover:text-red-700 font-bold transition-opacity shrink-0"
                                  >
                                    ×
                                  </button>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    value={isEn ? (engCert.issuer || "") : (c.issuer || "")}
                                    onChange={(e) => {
                                      if (isEn) {
                                        const updated = [...(englishVersion.certifications || [])];
                                        updated[idx] = { ...engCert, issuer: e.target.value, name: engCert.name || c.name, year: c.year };
                                        setEnglishVersion({ ...englishVersion, certifications: updated });
                                      } else {
                                        const updated = [...certifications];
                                        updated[idx].issuer = e.target.value;
                                        setCertifications(updated);
                                      }
                                    }}
                                    className="bg-transparent border-none text-slate-500 text-[8px] w-2/3 outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-right"
                                    placeholder="الجهة..."
                                  />
                                  <input
                                    value={c.year || ""}
                                    onChange={(e) => {
                                      const updated = [...certifications];
                                      updated[idx].year = e.target.value;
                                      setCertifications(updated);
                                    }}
                                    className="bg-transparent border-none text-slate-400 text-[8px] w-1/3 outline-none focus:ring-1 focus:ring-[#c2a06c] p-0 text-left"
                                    placeholder="السنة..."
                                  />
                                </div>
                              </div>
                            );
                            })}
                          </div>
                        </section>
                      </div>

                      {/* QR Code */}
                      <div className="pt-3 border-t border-slate-200 text-center flex flex-col items-center">
                        <img
                          src={qrSrc}
                          alt="QR Verification"
                          className="w-14 h-14 border border-emerald-100 p-0.5 rounded bg-white shadow-sm shrink-0"
                        />
                        <span className="text-[8.5px] text-[#084c41] font-bold block mt-1">
                          {t("سيرة موثقة")}
                        </span>
                        <span className="text-[8px] text-slate-400 block leading-none" dir="ltr">
                          {qrLabel}
                        </span>
                      </div>
                    </aside>
                  </div>
                </div>
              )}

              {/* Render Minimalist visual editor */}
              {template === "minimalist" && (
                <div className="bg-white text-slate-900 w-[794px] min-h-[1123px] shadow-2xl p-12 border border-slate-200 rounded text-right space-y-6" dir={isEn ? "ltr" : "rtl"}>
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
                    <div className="flex gap-4 items-start flex-grow">
                      <div className="flex-grow space-y-2">
                        <input
                          value={isEn ? (englishVersion.fullName || "") : fullName}
                          onChange={(e) => isEn ? setEnglishVersion({...englishVersion, fullName: e.target.value}) : setFullName(e.target.value)}
                          className="bg-transparent text-slate-900 font-bold text-3xl border-none outline-none focus:ring-1 focus:ring-slate-400 w-full hover:bg-slate-50 p-1 rounded"
                          placeholder="الاسم الكامل"
                        />
                        <input
                          value={isEn ? (englishVersion.jobTitle || "") : jobTitle}
                          onChange={(e) => isEn ? setEnglishVersion({...englishVersion, jobTitle: e.target.value}) : setJobTitle(e.target.value)}
                          className="bg-transparent text-slate-600 font-medium text-lg border-none outline-none focus:ring-1 focus:ring-slate-400 w-full hover:bg-slate-50 p-1 rounded mt-1"
                          placeholder="المسمى المهني"
                        />
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                          <input value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent border-none focus:ring-1 focus:ring-slate-400 text-xs w-32" placeholder="البريد..." />
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-transparent border-none focus:ring-1 focus:ring-slate-400 text-xs w-28" placeholder="الهاتف..." />
                          <input value={city} onChange={(e) => setCity(e.target.value)} className="bg-transparent border-none focus:ring-1 focus:ring-slate-400 text-xs w-24" placeholder="المدينة..." />
                        </div>
                      </div>
                    </div>
                    <img src={qrSrc} alt="QR" className="w-14 h-14 border border-slate-200 p-0.5 rounded shrink-0 animate-pulse" />
                  </div>

                  {/* Summary */}
                  <section className="space-y-1">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1 mb-2">{t("النبذة المهنية")}</h2>
                    <textarea
                      value={isEn ? (englishVersion.summary || "") : summary}
                      onChange={(e) => isEn ? setEnglishVersion({...englishVersion, summary: e.target.value}) : setSummary(e.target.value)}
                      className="bg-transparent border-none text-xs text-slate-700 leading-6 w-full p-1 outline-none focus:ring-1 focus:ring-slate-400 hover:bg-slate-50 min-h-[60px]"
                      placeholder="النبذة المهنية..."
                    />
                  </section>

                  {/* Experiences */}
                  <section>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-1 mb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">{t("الخبرات العملية")}</h2>
                      <button type="button" onClick={handleAddExperienceDirectly} className="text-[10px] text-slate-600 hover:text-slate-900 border border-slate-300 px-2 py-0.5 rounded bg-slate-50">➕ إضافة خبرة</button>
                    </div>
                    <div className="space-y-4">
                      {experiences.map((exp, idx) => (
                        <div key={exp.id || idx} className="group relative border-b border-slate-100 pb-3 hover:bg-slate-50/50 p-2 rounded">
                          <div className="flex justify-between text-xs font-bold items-center">
                            <input
                              value={isEn ? (englishVersion.experiences?.[idx]?.position || "") : (exp.position || "")}
                              onChange={(e) => {
                                if (isEn) {
                                  const u = [...(englishVersion.experiences || [])];
                                  u[idx] = { ...(u[idx] || {}), position: e.target.value };
                                  setEnglishVersion({ ...englishVersion, experiences: u });
                                } else {
                                  const u = [...experiences];
                                  u[idx].position = e.target.value;
                                  setExperiences(u);
                                }
                              }}
                              className="bg-transparent border-none text-slate-900 font-bold text-xs w-2/3 focus:ring-1 focus:ring-slate-400"
                              placeholder="المسمى الوظيفي"
                            />
                            <div className="flex gap-2 text-slate-500 font-normal text-xs items-center shrink-0">
                              <input value={exp.startDate || ""} onChange={(e) => { const u = [...experiences]; u[idx].startDate = e.target.value; setExperiences(u); }} className="w-16 text-left bg-transparent border-none focus:ring-1 focus:ring-slate-400 text-[10px]" placeholder="البدء" />
                              <span>-</span>
                              <input value={exp.endDate || ""} onChange={(e) => { const u = [...experiences]; u[idx].endDate = e.target.value; setExperiences(u); }} className="w-16 text-left bg-transparent border-none focus:ring-1 focus:ring-slate-400 text-[10px]" placeholder="الانتهاء" />
                            </div>
                          </div>
                          <div className="flex gap-2 text-xs text-slate-600 mt-1">
                            <input
                              value={isEn ? (englishVersion.experiences?.[idx]?.company || "") : (exp.company || "")}
                              onChange={(e) => {
                                if (isEn) {
                                  const u = [...(englishVersion.experiences || [])];
                                  u[idx] = { ...(u[idx] || {}), company: e.target.value };
                                  setEnglishVersion({ ...englishVersion, experiences: u });
                                } else {
                                  const u = [...experiences];
                                  u[idx].company = e.target.value;
                                  setExperiences(u);
                                }
                              }}
                              className="bg-transparent border-none text-slate-600 font-semibold text-[10px] w-1/2 focus:ring-1 focus:ring-slate-400"
                              placeholder="جهة العمل"
                            />
                            <input value={exp.city || ""} onChange={(e) => { const u = [...experiences]; u[idx].city = e.target.value; setExperiences(u); }} className="bg-transparent border-none text-slate-500 text-[10px] w-1/2 focus:ring-1 focus:ring-slate-400" placeholder="المدينة" />
                          </div>
                          <textarea
                            value={isEn ? (englishVersion.experiences?.[idx]?.description || "") : (exp.description || "")}
                            onChange={(e) => {
                              if (isEn) {
                                const u = [...(englishVersion.experiences || [])];
                                u[idx] = { ...(u[idx] || {}), description: e.target.value };
                                setEnglishVersion({ ...englishVersion, experiences: u });
                              } else {
                                const u = [...experiences];
                                u[idx].description = e.target.value;
                                setExperiences(u);
                              }
                            }}
                            className="bg-transparent border-none text-slate-500 text-[10px] w-full mt-1.5 focus:ring-1 focus:ring-slate-400 resize-none h-12"
                            placeholder="المهام والإنجازات..."
                          />
                          <button type="button" onClick={() => handleRemoveExperienceDirectly(idx)} className="opacity-0 group-hover:opacity-100 absolute left-2 top-2 text-[8px] text-red-500 hover:text-white hover:bg-red-600 border border-red-200 bg-white px-1.5 py-0.5 rounded transition-opacity">حذف</button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* Render simulated fallbacks for other templates in visual workspace */}
              {template !== "modern-emerald" && template !== "minimalist" && (
                <div className="bg-white text-navy-950 w-[794px] min-h-[500px] shadow-2xl p-12 border border-slate-200 rounded text-center flex flex-col justify-center items-center gap-4" dir="rtl">
                  <span className="text-4xl">🎨</span>
                  <h4 className="font-extrabold text-[#084c41] text-base">تم التحديد: {template === 'classic-navy' ? 'الكحلي الكلاسيكي' : 'الذهبي الفاخر'}</h4>
                  <p className="text-xs text-slate-500 leading-6 max-w-sm">
                    هذا القالب جاهز ومدعوم بالكامل عند الحفظ والطباعة! لتعديل محتواه بصرياً، نوصي باستخدام قالب **الزمردي الحديث (الأخضر/الذهبي)** أو **بسيط وأنيق**، أو يمكنك استخدام محرر الحقول الكلاسيكي بالضغط على الزر أدناه لتعبئة البيانات بسهولة.
                  </p>
                  <button type="button" onClick={() => setEditorMode("classic")} className="px-4 py-2 bg-navy-950 text-white rounded-lg text-xs font-bold transition-all">فتح استمارات الحقول</button>
                </div>
              )}

              {/* Friendly Tip banner inside workspace */}
            </div>
            
            {showPrintLockModal && (
              <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in no-print" dir="rtl">
                <div className="bg-navy-955 w-full max-w-md rounded-2xl border border-[#c9a84c] shadow-2xl p-6 space-y-4 text-center text-white relative">
                  {/* Close Button */}
                  <button 
                    type="button" 
                    onClick={() => setShowPrintLockModal(false)}
                    className="absolute top-4 left-4 text-slate-400 hover:text-white text-lg font-bold transition-colors"
                  >
                    ✕
                  </button>
                  <div className="w-16 h-16 rounded-full bg-[#c9a84c]/10 text-[#c9a84c] flex items-center justify-center text-3xl mx-auto border border-[#c9a84c]/30 animate-bounce">
                    🔒
                  </div>
                  <h3 className="font-extrabold text-lg text-[#c9a84c]">تفعيل طباعة وتنزيل السيرة الذاتية PDF</h3>
                  <p className="text-xs text-slate-300 leading-6 max-w-sm mx-auto">
                    رسوم تنزيل السيرة الذاتية الاحترافية بصيغة PDF عالية الدقة هي 2 دينار أردني فقط لمرة واحدة.
                  </p>
                  
                  <div className="p-4 bg-navy-900 rounded-xl border border-navy-800 text-right space-y-2.5 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                      <span>💳</span>
                      <span>خطوات الدفع والتفعيل الفوري:</span>
                    </p>
                    <p>1. أرسل قيمة الرسوم (2 دينار) إلى إحدى الخيارات التالية:</p>
                    <div className="bg-navy-955 p-2.5 rounded border border-navy-800 space-y-1 text-[11px] font-mono text-slate-200">
                      <div>• كليك (CliQ Alias): <span className="text-[#c9a84c] font-bold">JOJOBS</span></div>
                      <div>• محفظة زين كاش (Zain Cash): <span className="text-[#c9a84c] font-bold">0790793777</span></div>
                    </div>
                    <p>2. انقر على الزر بالأسفل لإرسال الوصل للأدمن على الواتساب ليتم التفعيل الفوري لحسابك:</p>
                    <div className="text-[10px] text-slate-400">البريد الإلكتروني الخاص بك: <span className="text-white font-bold">{defaultEmail}</span></div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <a
                      href={`https://wa.me/962790793777?text=مرحباً، قمت بدفع رسوم السيرة الذاتية (2 دينار) وأريد تفعيل ميزة الطباعة لحسابي بالبريد الإلكتروني: ${defaultEmail}`}
                      target="_blank"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      💬 إرسال وصل الدفع عبر واتساب للتفعيل الفوري
                    </a>
                    <button
                      type="button"
                      onClick={() => setShowPrintLockModal(false)}
                      className="w-full py-2.5 bg-navy-900 hover:bg-navy-800 text-slate-400 rounded-xl text-xs font-bold transition-all border border-navy-800"
                    >
                      إغلاق والعودة للتعديل
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
      </form>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-navy-100 shadow-md overflow-hidden">
      {/* Tabs list */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-navy-100 bg-navy-50 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? "border-emerald-600 bg-white text-emerald-700"
                : "border-transparent text-navy-600 hover:bg-navy-100/50 hover:text-navy-900"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {/* Status Messages */}
        {message && (
          <div className={`p-4 rounded-lg text-sm font-bold flex items-center gap-2 ${
            isSuccess ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            <span>{isSuccess ? "✓" : "⚠"}</span>
            <span>{message}</span>
          </div>
        )}

        {/* Visual Editor Switch Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-[#084c41] p-4 rounded-xl border border-[#c2a06c]/20 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-6">
          <div className="flex items-center gap-3 text-right">
            <span className="text-2xl">✨</span>
            <div>
              <h4 className="font-extrabold text-sm text-[#c2a06c]">محرر السيرة البصري الفاخر (Word Mode)</h4>
              <p className="text-xs text-slate-200 mt-0.5">يمكنك الآن تعديل معلومات سيرتك الذاتية وتنسيقها مباشرة فوق قالب التصميم الحقيقي!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditorMode("visual")}
            className="px-5 py-2 bg-[#c2a06c] hover:bg-[#b0905c] text-navy-955 rounded-lg text-xs font-bold transition-all shadow shrink-0 active:scale-[0.98] cursor-pointer"
          >
            تفعيل التعديل المباشر داخل القالب
          </button>
        </div>

        {/* Tab content: Basic */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-navy-50 pb-6">
              {isPlus ? (
                <>
                  {/* Photo Upload Frame */}
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-emerald-500 bg-navy-50 flex items-center justify-center shadow-inner group">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-navy-300 text-4xl">🧑</span>
                    )}
                    <label className="absolute inset-0 bg-navy-950/70 text-white text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      تغيير الصورة
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">الصورة الشخصية</h3>
                    <p className="text-xs text-navy-500 mt-1 max-w-sm">
                      اختر صورة مهنية واضحة بخلفية محايدة. الصيغ المدعومة: JPG, PNG. الحد الأقصى للحجم: 3 ميغابايت.
                    </p>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto("")}
                        className="text-xs text-red-500 font-semibold mt-2 hover:underline"
                      >
                        إزالة الصورة
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-navy-200 bg-navy-50 flex items-center justify-center shadow-inner">
                    <span className="text-navy-300 text-4xl">🔒</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900">الصورة الشخصية — ميزة باقة Plus</h3>
                    <p className="text-xs text-navy-500 mt-1 max-w-sm leading-6">
                      السيرة الذاتية المجانية تُنشأ باحترافية وبدون صورة شخصية (تماماً كالقوالب العالمية). لإضافة صورتك الشخصية، قم بالترقية إلى باقة Plus.
                    </p>
                    <a href="/pricing" className="inline-block text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3 py-1.5 rounded-lg mt-2 transition-all">
                      الترقية إلى Plus ⚡
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم الكامل</label>
                <input className="input" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="مثال: أحمد محمد العلي" />
              </div>
              <div>
                <label className="label">المسمى المهني</label>
                <input className="input" name="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="مثال: محاسب قانوني / مهندس برمجيات" required />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input className="input" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">الهاتف</label>
                <input className="input" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="07XXXXXXXX" />
              </div>
              <div>
                <label className="label">المدينة</label>
                <input className="input" name="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="مثال: عمان، إربد، الزرقاء" required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">رابط معرض الأعمال / صفحة أعمالي (Portfolio)</label>
                <input className="input" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="مثال: Behance, GitHub, Dribbble أو موقعك الشخصي" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">الملخص المهني (نبذة تعريفية)</label>
                <textarea
                  className="input min-h-36"
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="اكتب 3 إلى 5 أسطر تلخص فيها خبراتك العلمية والعملية، مهاراتك الرئيسية، وهدفك المهني."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab content: Experiences */}
        {activeTab === "experiences" && (
          <div className="space-y-6">
            <div className="bg-navy-50 p-4 rounded-xl border border-navy-100">
              <h3 className="font-bold text-navy-900 mb-4 text-sm flex items-center gap-2">
                <span>➕</span> إضافة خبرة عملية جديدة
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">المسمى الوظيفي</label>
                  <input
                    className="input text-sm"
                    value={tempExp.position}
                    onChange={(e) => setTempExp({ ...tempExp, position: e.target.value })}
                    placeholder="مثال: موظف خدمة عملاء"
                  />
                </div>
                <div>
                  <label className="label text-xs">الشركة / جهة العمل</label>
                  <input
                    className="input text-sm"
                    value={tempExp.company}
                    onChange={(e) => setTempExp({ ...tempExp, company: e.target.value })}
                    placeholder="مثال: شركة الاتصالات الأردنية"
                  />
                </div>
                <div>
                  <label className="label text-xs">المدينة</label>
                  <input
                    className="input text-sm"
                    value={tempExp.city}
                    onChange={(e) => setTempExp({ ...tempExp, city: e.target.value })}
                    placeholder="مثال: عمان، إربد"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">تاريخ البدء</label>
                    <input
                      className="input text-sm"
                      value={tempExp.startDate}
                      onChange={(e) => setTempExp({ ...tempExp, startDate: e.target.value })}
                      placeholder="مثال: 2022-01"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">تاريخ الانتهاء</label>
                    <input
                      className="input text-sm"
                      value={tempExp.endDate}
                      onChange={(e) => setTempExp({ ...tempExp, endDate: e.target.value })}
                      placeholder="أو اكتب 'حتى الآن'"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">شرح المهام والإنجازات</label>
                  <textarea
                    className="input text-sm min-h-20"
                    value={tempExp.description}
                    onChange={(e) => setTempExp({ ...tempExp, description: e.target.value })}
                    placeholder="- الرد على استفسارات العملاء وحل المشكلات&#10;- تحقيق مبيعات تفوق الهدف الشهري بنسبة 20%"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddExperience}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                إضافة الخبرة للملف
              </button>
            </div>

            {/* Experiences list */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy-900 border-b border-navy-50 pb-2">الخبرات الحالية ({experiences.length})</h3>
              {experiences.length === 0 ? (
                <p className="text-sm text-navy-400 py-4 text-center">لا توجد خبرات مضافة بعد.</p>
              ) : (
                <div className="space-y-3">
                  {experiences.map((exp, idx) => (
                    <div key={exp.id || idx} className="p-4 border border-navy-100 rounded-lg flex justify-between items-start bg-white hover:border-emerald-200 transition-all">
                      <div>
                        <h4 className="font-bold text-navy-900">{exp.position}</h4>
                        <div className="text-xs text-emerald-700 font-semibold mt-1">
                          {exp.company} {exp.city ? `• ${exp.city}` : ""}
                        </div>
                        <div className="text-xs text-navy-400 mt-1">{exp.startDate} - {exp.endDate || "حتى الآن"}</div>
                        {exp.description && <p className="text-xs text-navy-600 mt-2 whitespace-pre-line leading-5">{exp.description}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id || exp.position)}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Educations */}
        {activeTab === "educations" && (
          <div className="space-y-6">
            <div className="bg-navy-50 p-4 rounded-xl border border-navy-100">
              <h3 className="font-bold text-navy-900 mb-4 text-sm flex items-center gap-2">
                <span>➕</span> إضافة مؤهل تعليمي جديد
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">الدرجة العلمية / التخصص</label>
                  <input
                    className="input text-sm"
                    value={tempEdu.degree}
                    onChange={(e) => setTempEdu({ ...tempEdu, degree: e.target.value })}
                    placeholder="مثال: بكالوريوس إدارة أعمال"
                  />
                </div>
                <div>
                  <label className="label text-xs">الجامعة / المدرسة</label>
                  <input
                    className="input text-sm"
                    value={tempEdu.institution}
                    onChange={(e) => setTempEdu({ ...tempEdu, institution: e.target.value })}
                    placeholder="مثال: الجامعة الأردنية"
                  />
                </div>
                <div>
                  <label className="label text-xs">المدينة</label>
                  <input
                    className="input text-sm"
                    value={tempEdu.city}
                    onChange={(e) => setTempEdu({ ...tempEdu, city: e.target.value })}
                    placeholder="مثال: عمان، إربد"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs">تاريخ البدء</label>
                    <input
                      className="input text-sm"
                      value={tempEdu.startDate}
                      onChange={(e) => setTempEdu({ ...tempEdu, startDate: e.target.value })}
                      placeholder="مثال: 2018"
                    />
                  </div>
                  <div>
                    <label className="label text-xs">تاريخ التخرج</label>
                    <input
                      className="input text-sm"
                      value={tempEdu.endDate}
                      onChange={(e) => setTempEdu({ ...tempEdu, endDate: e.target.value })}
                      placeholder="أو اكتب 'حتى الآن'"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="label text-xs">تفاصيل إضافية (اختياري)</label>
                  <textarea
                    className="input text-sm min-h-20"
                    value={tempEdu.description}
                    onChange={(e) => setTempEdu({ ...tempEdu, description: e.target.value })}
                    placeholder="معدل تخرج ممتاز، أو مشروع التخرج المميز"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                إضافة التعليم للملف
              </button>
            </div>

            {/* Educations list */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy-900 border-b border-navy-50 pb-2">التعليم الحالي ({educations.length})</h3>
              {educations.length === 0 ? (
                <p className="text-sm text-navy-400 py-4 text-center">لا توجد مؤهلات علمية مضافة بعد.</p>
              ) : (
                <div className="space-y-3">
                  {educations.map((edu, idx) => (
                    <div key={edu.id || idx} className="p-4 border border-navy-100 rounded-lg flex justify-between items-start bg-white hover:border-emerald-200 transition-all">
                      <div>
                        <h4 className="font-bold text-navy-900">{edu.degree}</h4>
                        <div className="text-xs text-emerald-700 font-semibold mt-1">
                          {edu.institution} {edu.city ? `• ${edu.city}` : ""}
                        </div>
                        <div className="text-xs text-navy-400 mt-1">{edu.startDate} - {edu.endDate || "حتى الآن"}</div>
                        {edu.description && <p className="text-xs text-navy-600 mt-2 whitespace-pre-line leading-5">{edu.description}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id || edu.degree)}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Skills */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="bg-navy-50 p-4 rounded-xl border border-navy-100 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="label text-xs">اسم المهارة</label>
                <input
                  className="input text-sm"
                  value={tempSkill.name}
                  onChange={(e) => setTempSkill({ ...tempSkill, name: e.target.value })}
                  placeholder="مثال: Excel، التواصل الفعال، العمل الجماعي، English"
                />
              </div>
              <div className="w-full sm:w-48">
                <label className="label text-xs">مستوى الإتقان (1-5)</label>
                <select
                  className="input text-sm"
                  value={tempSkill.level}
                  onChange={(e) => setTempSkill({ ...tempSkill, level: e.target.value })}
                >
                  <option value="1">1 - مبتدئ</option>
                  <option value="2">2 - متوسط</option>
                  <option value="3">3 - جيد جداً</option>
                  <option value="4">4 - متقدم</option>
                  <option value="5">5 - خبير ومتقن</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all w-full sm:w-auto"
              >
                إضافة
              </button>
            </div>

            {/* Skills tags */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy-900 border-b border-navy-50 pb-2">المهارات الحالية ({skills.length})</h3>
              {skills.length === 0 ? (
                <p className="text-sm text-navy-400 py-4 text-center">لا توجد مهارات مضافة بعد.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 border border-navy-100 text-sm font-semibold text-navy-800"
                    >
                      <span>{s.name}</span>
                      <span className="text-emerald-600 text-xs">{"★".repeat(s.level || 3)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.name)}
                        className="text-xs text-red-500 font-bold hover:text-red-700 mr-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Certifications */}
        {activeTab === "certifications" && (
          <div className="space-y-6">
            <div className="bg-navy-50 p-4 rounded-xl border border-navy-100">
              <h3 className="font-bold text-navy-900 mb-4 text-sm flex items-center gap-2">
                <span>➕</span> إضافة شهادة أو دورة تدريبية
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="label text-xs">اسم الشهادة / الدورة</label>
                  <input
                    className="input text-sm"
                    value={tempCert.name}
                    onChange={(e) => setTempCert({ ...tempCert, name: e.target.value })}
                    placeholder="مثال: شهادة مهارات حاسوب ICDL"
                  />
                </div>
                <div>
                  <label className="label text-xs">الجهة المانحة</label>
                  <input
                    className="input text-sm"
                    value={tempCert.issuer}
                    onChange={(e) => setTempCert({ ...tempCert, issuer: e.target.value })}
                    placeholder="مثال: مركز تدريب طلال أبو غزالة"
                  />
                </div>
                <div>
                  <label className="label text-xs">سنة الحصول عليها</label>
                  <input
                    className="input text-sm"
                    value={tempCert.year}
                    onChange={(e) => setTempCert({ ...tempCert, year: e.target.value })}
                    placeholder="مثال: 2023"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddCert}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                إضافة الشهادة للملف
              </button>
            </div>

            {/* Certifications list */}
            <div className="space-y-4">
              <h3 className="font-bold text-navy-900 border-b border-navy-50 pb-2">الشهادات المضافة ({certifications.length})</h3>
              {certifications.length === 0 ? (
                <p className="text-sm text-navy-400 py-4 text-center">لا توجد شهادات مضافة بعد.</p>
              ) : (
                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="p-4 border border-navy-100 rounded-lg flex justify-between items-start bg-white">
                      <div>
                        <h4 className="font-bold text-navy-900">{cert.name}</h4>
                        <div className="text-xs text-emerald-700 font-semibold mt-1">
                          {cert.issuer} {cert.year ? `• ${cert.year}` : ""}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCert(cert.name)}
                        className="text-xs text-red-500 font-semibold hover:underline"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content: Translation Review */}
        {activeTab === "translation" && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs leading-6">
              💡 <strong>ميزة السيرة الذاتية ثنائية اللغة:</strong>
              <p className="mt-1">
                يتيح لك اشتراكك الحصول على نسختين كاملتين من سيرتك الذاتية (عربي وإنجليزي معاً). يمكنك الضغط على زر توليد الترجمة التلقائية بالأسفل لتقوم المنصة بترجمة بياناتك، وبعد ذلك يمكنك مراجعتها وتعديل أية ترجمة خاطئة يدوياً للتأكد من دقتها (خاصة الاسم والمسمى الوظيفي والملخص المهني) قبل توليد الـ PDF.
              </p>
            </div>
            
            <div className="flex justify-between items-center border-b border-navy-50 pb-4">
              <h3 className="font-bold text-navy-900">مراجعة وتعديل النسخة الإنجليزية</h3>
              <button
                type="button"
                onClick={handleAutoTranslate}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-900 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                🌐 توليد ترجمة تلقائية ذكية
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs font-bold text-emerald-800">الاسم بالإنجليزية (Full Name in English)</label>
                <input
                  className="input text-sm border-emerald-500/30"
                  value={englishVersion.fullName || ""}
                  onChange={(e) => setEnglishVersion({ ...englishVersion, fullName: e.target.value })}
                  placeholder="e.g. Ahmad Mohammad Al-Ali"
                />
              </div>
              <div>
                <label className="label text-xs font-bold text-emerald-800">المسمى المهني بالإنجليزية (Job Title in English)</label>
                <input
                  className="input text-sm border-emerald-500/30"
                  value={englishVersion.jobTitle || ""}
                  onChange={(e) => setEnglishVersion({ ...englishVersion, jobTitle: e.target.value })}
                  placeholder="e.g. Software Engineer / Accountant"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label text-xs font-bold text-emerald-800">الملخص المهني بالإنجليزية (Professional Summary in English)</label>
                <textarea
                  className="input text-sm border-emerald-500/30 min-h-24"
                  value={englishVersion.summary || ""}
                  onChange={(e) => setEnglishVersion({ ...englishVersion, summary: e.target.value })}
                  placeholder="e.g. Result-driven accountant with 3 years of experience in local markets..."
                />
              </div>
            </div>

            {/* Experiences Translation list */}
            {experiences.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-navy-50">
                <h4 className="font-bold text-navy-900 text-sm">ترجمة الخبرات العملية (Work Experiences Translation)</h4>
                <div className="space-y-4">
                  {experiences.map((exp: any, idx: number) => {
                    const engExp = englishVersion.experiences?.[idx] || { position: "", company: "", description: "" };
                    return (
                      <div key={idx} className="p-4 border border-navy-100 rounded-lg bg-navy-50/30 space-y-3">
                        <div className="text-xs text-navy-700 font-bold border-b border-navy-50 pb-2">
                          الخبرة {idx + 1} (بالعربية): <span className="text-emerald-700">{exp.position} - {exp.company}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="label text-[10px] text-slate-500">المسمى بالإنجليزية (Position)</label>
                            <input
                              className="input text-xs"
                              value={engExp.position || ""}
                              onChange={(e) => {
                                const newExps = [...(englishVersion.experiences || [])];
                                newExps[idx] = { ...engExp, position: e.target.value, company: engExp.company || exp.company };
                                setEnglishVersion({ ...englishVersion, experiences: newExps });
                              }}
                              placeholder="Position in English"
                            />
                          </div>
                          <div>
                            <label className="label text-[10px] text-slate-500">الشركة بالإنجليزية (Company)</label>
                            <input
                              className="input text-xs"
                              value={engExp.company || ""}
                              onChange={(e) => {
                                const newExps = [...(englishVersion.experiences || [])];
                                newExps[idx] = { ...engExp, company: e.target.value, position: engExp.position || exp.position };
                                setEnglishVersion({ ...englishVersion, experiences: newExps });
                              }}
                              placeholder="Company in English"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="label text-[10px] text-slate-500">المهام بالإنجليزية (Description)</label>
                            <textarea
                              className="input text-xs min-h-16"
                              value={engExp.description || ""}
                              onChange={(e) => {
                                const newExps = [...(englishVersion.experiences || [])];
                                newExps[idx] = { ...engExp, description: e.target.value };
                                setEnglishVersion({ ...englishVersion, experiences: newExps });
                              }}
                              placeholder="Duties/Responsibilities in English"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Educations Translation list */}
            {educations.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-navy-50">
                <h4 className="font-bold text-navy-900 text-sm">ترجمة التعليم والدراسة (Education Translation)</h4>
                <div className="space-y-4">
                  {educations.map((edu: any, idx: number) => {
                    const engEdu = englishVersion.educations?.[idx] || { degree: "", institution: "" };
                    return (
                      <div key={idx} className="p-4 border border-navy-100 rounded-lg bg-navy-50/30 space-y-3">
                        <div className="text-xs text-navy-700 font-bold border-b border-navy-50 pb-2">
                          المؤهل {idx + 1} (بالعربية): <span className="text-emerald-700">{edu.degree} - {edu.institution}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="label text-[10px] text-slate-500">الشهادة بالإنجليزية (Degree/Major)</label>
                            <input
                              className="input text-xs"
                              value={engEdu.degree || ""}
                              onChange={(e) => {
                                const newEdus = [...(englishVersion.educations || [])];
                                newEdus[idx] = { ...engEdu, degree: e.target.value, institution: engEdu.institution || edu.institution };
                                setEnglishVersion({ ...englishVersion, educations: newEdus });
                              }}
                              placeholder="Degree in English"
                            />
                          </div>
                          <div>
                            <label className="label text-[10px] text-slate-500">الجهة بالإنجليزية (Institution)</label>
                            <input
                              className="input text-xs"
                              value={engEdu.institution || ""}
                              onChange={(e) => {
                                const newEdus = [...(englishVersion.educations || [])];
                                newEdus[idx] = { ...engEdu, institution: e.target.value, degree: engEdu.degree || edu.degree };
                                setEnglishVersion({ ...englishVersion, educations: newEdus });
                              }}
                              placeholder="Institution in English"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-navy-50">
                <h4 className="font-bold text-navy-900 text-sm">ترجمة المهارات (Skills Translation)</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {skills.map((skill: any, idx: number) => {
                    const engSkill = englishVersion.skills?.[idx] || { name: "", level: skill.level };
                    return (
                      <div key={idx} className="p-3 border border-navy-100 rounded-lg bg-navy-50/30">
                        <label className="label text-[10px] text-slate-500">{skill.name}</label>
                        <input
                          className="input text-xs"
                          value={engSkill.name || ""}
                          onChange={(e) => {
                            const newSkills = [...(englishVersion.skills || [])];
                            newSkills[idx] = { ...engSkill, name: e.target.value, level: skill.level };
                            setEnglishVersion({ ...englishVersion, skills: newSkills });
                          }}
                          placeholder="Skill in English"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {certifications.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-navy-50">
                <h4 className="font-bold text-navy-900 text-sm">ترجمة الشهادات (Certifications Translation)</h4>
                <div className="space-y-3">
                  {certifications.map((cert: any, idx: number) => {
                    const engCert = englishVersion.certifications?.[idx] || { name: "", issuer: "", year: cert.year };
                    return (
                      <div key={idx} className="p-4 border border-navy-100 rounded-lg bg-navy-50/30 space-y-3">
                        <div className="text-xs text-navy-700 font-bold border-b border-navy-50 pb-2">
                          الشهادة {idx + 1} (بالعربية): <span className="text-emerald-700">{cert.name}</span>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <input
                            className="input text-xs"
                            value={engCert.name || ""}
                            onChange={(e) => {
                              const newCerts = [...(englishVersion.certifications || [])];
                              newCerts[idx] = { ...engCert, name: e.target.value, issuer: engCert.issuer || cert.issuer, year: cert.year };
                              setEnglishVersion({ ...englishVersion, certifications: newCerts });
                            }}
                            placeholder="Certificate name in English"
                          />
                          <input
                            className="input text-xs"
                            value={engCert.issuer || ""}
                            onChange={(e) => {
                              const newCerts = [...(englishVersion.certifications || [])];
                              newCerts[idx] = { ...engCert, issuer: e.target.value, name: engCert.name || cert.name, year: cert.year };
                              setEnglishVersion({ ...englishVersion, certifications: newCerts });
                            }}
                            placeholder="Issuer in English"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab content: Design */}
        {activeTab === "design" && (
          <div className="space-y-6">
            <h3 className="font-bold text-navy-900 border-b border-navy-50 pb-2">اختر قالب السيرة الذاتية</h3>
            <p className="text-xs text-navy-500 leading-5">
              توفر المنصة قوالب متعددة بألوان وتوزيعات مختلفة تمنح سيرتك الذاتية رونقاً متميزاً ومظهرًا احترافيًا عند الطباعة أو التصدير لملف PDF.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Template Card: Modern Emerald */}
              <button
                type="button"
                onClick={() => setTemplate("modern-emerald")}
                className={`p-5 rounded-xl border text-right transition-all flex flex-col justify-between h-40 ${
                  template === "modern-emerald"
                    ? "border-emerald-600 ring-2 ring-emerald-500 bg-emerald-50/20"
                    : "border-navy-100 hover:border-navy-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-navy-900">الزمردي الحديث (Modern Emerald)</span>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 block"></span>
                  </div>
                  <p className="text-xs text-navy-500 mt-2 leading-5">
                    تصميم عصري ونظيف بخطوط عربية جذابة ولمسات بلون الزمرد. يدعم الصورة والنبذة بشكل رائع.
                  </p>
                </div>
                <span className={`text-xs font-bold ${template === "modern-emerald" ? "text-emerald-700" : "text-navy-400"}`}>
                  {template === "modern-emerald" ? "✓ القالب النشط حالياً" : "تحديد هذا القالب"}
                </span>
              </button>

              {/* Template Card: Classic Navy */}
              <button
                type="button"
                onClick={() => setTemplate("classic-navy")}
                className={`p-5 rounded-xl border text-right transition-all flex flex-col justify-between h-40 ${
                  template === "classic-navy"
                    ? "border-blue-800 ring-2 ring-blue-600 bg-blue-50/20"
                    : "border-navy-100 hover:border-navy-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-navy-900">الكحلي الكلاسيكي (Classic Navy)</span>
                    <span className="w-4 h-4 rounded-full bg-navy-800 block"></span>
                  </div>
                  <p className="text-xs text-navy-500 mt-2 leading-5">
                    تقسيم ذو عمودين كلاسيكي للمظهر الرسمي والشركات الكبرى. الهيدر باللون الكحلي الفاخر.
                  </p>
                </div>
                <span className={`text-xs font-bold ${template === "classic-navy" ? "text-blue-700" : "text-navy-400"}`}>
                  {template === "classic-navy" ? "✓ القالب النشط حالياً" : "تحديد هذا القالب"}
                </span>
              </button>

              {/* Template Card: Executive Gold */}
              <button
                type="button"
                onClick={() => setTemplate("executive-gold")}
                className={`p-5 rounded-xl border text-right transition-all flex flex-col justify-between h-40 ${
                  template === "executive-gold"
                    ? "border-amber-600 ring-2 ring-amber-500 bg-amber-50/20"
                    : "border-navy-100 hover:border-navy-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-navy-900">الذهبي الفاخر (Executive Gold)</span>
                    <span className="w-4 h-4 rounded-full bg-amber-600 block"></span>
                  </div>
                  <p className="text-xs text-navy-500 mt-2 leading-5">
                    تصميم فخم برأس داكن ولمسات باللون الذهبي الداكن ليعبر عن روح القيادة والإبداع.
                  </p>
                </div>
                <span className={`text-xs font-bold ${template === "executive-gold" ? "text-amber-700" : "text-navy-400"}`}>
                  {template === "executive-gold" ? "✓ القالب النشط حالياً" : "تحديد هذا القالب"}
                </span>
              </button>

              {/* Template Card: Minimalist */}
              <button
                type="button"
                onClick={() => setTemplate("minimalist")}
                className={`p-5 rounded-xl border text-right transition-all flex flex-col justify-between h-40 ${
                  template === "minimalist"
                    ? "border-gray-800 ring-2 ring-gray-800 bg-gray-50/25"
                    : "border-navy-100 hover:border-navy-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center w-full">
                    <span className="font-extrabold text-navy-900">بسيط وأنيق (Minimalist)</span>
                    <span className="w-4 h-4 rounded-full bg-gray-200 border border-gray-400 block"></span>
                  </div>
                  <p className="text-xs text-navy-500 mt-2 leading-5">
                    تركيز كامل على النص والمحتوى دون حقول ملونة أو بهرجة. خطوط رفيعة وتنسيق احترافي رصين.
                  </p>
                </div>
                <span className={`text-xs font-bold ${template === "minimalist" ? "text-gray-800" : "text-navy-400"}`}>
                  {template === "minimalist" ? "✓ القالب النشط حالياً" : "تحديد هذا القالب"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Submit action */}
        <div className="border-t border-navy-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-navy-500">
            تذكر حفظ التعديلات بعد إكمال إضافة الخبرات والمهارات لتظهر في ملف المعاينة.
          </p>
          <button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                جاري الحفظ...
              </>
            ) : (
              "حفظ كامل السيرة الذاتية"
            )}
          </button>
        </div>
      </form>


    </div>
  );
}
