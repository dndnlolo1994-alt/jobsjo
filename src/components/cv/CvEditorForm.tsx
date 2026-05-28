"use client";

import React, { useState } from "react";
import { saveCvAction } from "@/lib/actions/platform";

interface CvEditorFormProps {
  cv: any;
  defaultEmail: string;
  defaultFullName: string;
}

export function CvEditorForm({ cv, defaultEmail, defaultFullName }: CvEditorFormProps) {
  const [activeTab, setActiveTab] = useState<"basic" | "experiences" | "educations" | "skills" | "certifications" | "translation" | "design">("basic");
  
  // Basic states
  const [photo, setPhoto] = useState<string>(cv?.photo ?? "");
  const [template, setTemplate] = useState<string>(cv?.template ?? "modern-emerald");

  // Arrays states
  const [experiences, setExperiences] = useState<any[]>(cv?.experiences ?? []);
  const [educations, setEducations] = useState<any[]>(cv?.educations ?? []);
  const [skills, setSkills] = useState<any[]>(cv?.skills ?? []);
  const [certifications, setCertifications] = useState<any[]>(cv?.certifications ?? []);

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
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // LinkedIn profile text parser states
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [linkedInText, setLinkedInText] = useState("");

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

    setEnglishVersion({
      ...englishVersion,
      fullName: englishVersion.fullName || translatedName,
      jobTitle: englishVersion.jobTitle || translatedTitle,
      summary: englishVersion.summary || translatedSummary,
      experiences: translatedExps,
      educations: translatedEdus,
    });

    alert("تم توليد ترجمة تقريبية للبيانات بالإنجليزية! يرجى مراجعة وتدقيق الاسم والمصطلحات وتصحيحها إذا وجد أي خطأ.");
  };

  const handleLinkedInImport = () => {
    setIsLinkedInModalOpen(true);
  };

  const handleAnalyzeLinkedInText = () => {
    if (!linkedInText.trim()) {
      alert("الرجاء لصق نص بروفايل LinkedIn أولاً.");
      return;
    }
    const result = parseLinkedInText(linkedInText);
    if (!result) {
      alert("تعذر العثور على أي معلومات قابلة للقراءة في النص المدخل.");
      return;
    }

    // Populate inputs
    const fullNameInput = document.getElementsByName("fullName")[0] as HTMLInputElement;
    if (fullNameInput && result.fullName) {
      fullNameInput.value = result.fullName;
    }

    const jobTitleInputEl = document.getElementsByName("jobTitle")[0] as HTMLInputElement;
    if (jobTitleInputEl && result.jobTitle) {
      jobTitleInputEl.value = result.jobTitle;
    }

    const summaryTextarea = document.getElementsByName("summary")[0] as HTMLTextAreaElement;
    if (summaryTextarea && result.summary) {
      summaryTextarea.value = result.summary;
    }

    if (result.experiences.length > 0) {
      setExperiences(result.experiences);
    }
    if (result.educations.length > 0) {
      setEducations(result.educations);
    }
    if (result.skills.length > 0) {
      setSkills(result.skills);
    }

    alert("🎉 تم تحليل واستيراد بيانات LinkedIn الحقيقية بنجاح!\n\nتم ملء الاسم، والمسمى الوظيفي، والنبذة، والخبرات، والتعليم، والمهارات في الحقول المقابلة لها.");
    setIsLinkedInModalOpen(false);
    setLinkedInText("");
  };

  function parseLinkedInText(text: string) {
    const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let fullName = "";
    let jobTitle = "";
    let summary = "";
    const experiences: any[] = [];
    const educations: any[] = [];
    const skills: string[] = [];

    const sectionsKeywords = [
      "experience", "education", "skills", "summary", "contact", "about", "projects", "certifications",
      "الخبرة", "الخبرات", "التعليم", "المهارات", "نبذة", "ملخص", "الاتصال", "المشاريع", "الشهادات"
    ];
    
    const isHeader = (l: string) => sectionsKeywords.some(kw => l.toLowerCase().includes(kw));

    let lineIdx = 0;
    while (lineIdx < lines.length && isHeader(lines[lineIdx])) {
      lineIdx++;
    }
    if (lineIdx < lines.length) {
      fullName = lines[lineIdx];
      lineIdx++;
    }
    while (lineIdx < lines.length && isHeader(lines[lineIdx])) {
      lineIdx++;
    }
    if (lineIdx < lines.length) {
      jobTitle = lines[lineIdx];
      lineIdx++;
    }

    let currentSection = "";
    const expLines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const dateRegex = /(19|20)\d{2}|present|الحالي|يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i;

    for (let i = lineIdx; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();

      if (lowerLine === "summary" || lowerLine === "about" || line === "ملخص" || line === "نبذة" || line === "نبذة تعريفية" || line === "النبذة المهنية") {
        currentSection = "summary";
        continue;
      } else if (lowerLine === "experience" || line === "الخبرة" || line === "الخبرات" || line === "الخبرات العملية") {
        currentSection = "experience";
        continue;
      } else if (lowerLine === "education" || line === "التعليم" || line === "التعليم والدراسة") {
        currentSection = "education";
        continue;
      } else if (lowerLine === "skills" || line === "المهارات") {
        currentSection = "skills";
        continue;
      } else if (lowerLine === "certifications" || lowerLine === "honors" || line === "الشهادات" || line === "الدورات") {
        currentSection = "certifications";
        continue;
      } else if (isHeader(line) && line.length < 25) {
        currentSection = "";
        continue;
      }

      if (currentSection === "summary") {
        summary += (summary ? "\n" : "") + line;
      } else if (currentSection === "skills") {
        if (line.includes("•") || line.includes("|") || line.includes(",")) {
          const parts = line.split(/[•|,]/).map(s => s.trim()).filter(Boolean);
          skills.push(...parts);
        } else {
          skills.push(line);
        }
      }
    }

    // Parse experiences
    let tempExp: any = null;
    let inExpSection = false;
    let expCount = 0;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const lower = line.toLowerCase();

      if (lower === "experience" || line === "الخبرة" || line === "الخبرات" || line === "الخبرات العملية") {
        inExpSection = true;
        continue;
      }
      if (inExpSection && (lower === "education" || line === "التعليم" || lower === "skills" || line === "المهارات" || lower === "certifications" || line === "الشهادات")) {
        if (tempExp) experiences.push(tempExp);
        tempExp = null;
        inExpSection = false;
      }

      if (inExpSection) {
        if (dateRegex.test(line) && line.length < 40) {
          if (tempExp) {
            tempExp.dates = line;
          }
        } else if (line.startsWith("-") || line.startsWith("•") || line.startsWith("*")) {
          if (tempExp) {
            tempExp.description += (tempExp.description ? "\n" : "") + line;
          }
        } else {
          if (!tempExp || tempExp.dates) {
            if (tempExp) experiences.push(tempExp);
            expCount++;
            tempExp = {
              id: `exp-li-${expCount}-${Date.now()}`,
              position: line,
              company: "",
              city: "عمان",
              startDate: "",
              endDate: "",
              description: ""
            };
          } else {
            if (!tempExp.company) {
              tempExp.company = line;
            } else {
              if (line.includes(",") || line.length < 20) {
                tempExp.city = line;
              } else {
                tempExp.description += (tempExp.description ? "\n" : "") + line;
              }
            }
          }
        }
      }
    }
    if (tempExp) experiences.push(tempExp);

    // Parse Education
    let tempEdu: any = null;
    let inEduSection = false;
    let eduCount = 0;

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const lower = line.toLowerCase();

      if (lower === "education" || line === "التعليم" || line === "التعليم والدراسة") {
        inEduSection = true;
        continue;
      }
      if (inEduSection && (lower === "experience" || line === "الخبرة" || lower === "skills" || line === "المهارات" || lower === "certifications" || line === "الشهادات")) {
        if (tempEdu) educations.push(tempEdu);
        tempEdu = null;
        inEduSection = false;
      }

      if (inEduSection) {
        if (dateRegex.test(line) && line.length < 30) {
          if (tempEdu) {
            tempEdu.dates = line;
          }
        } else {
          if (!tempEdu || tempEdu.dates) {
            if (tempEdu) educations.push(tempEdu);
            eduCount++;
            tempEdu = {
              id: `edu-li-${eduCount}-${Date.now()}`,
              institution: line,
              degree: "",
              city: "عمان",
              startDate: "",
              endDate: "",
              description: ""
            };
          } else {
            if (!tempEdu.degree) {
              tempEdu.degree = line;
            } else {
              tempEdu.description += (tempEdu.description ? "\n" : "") + line;
            }
          }
        }
      }
    }
    if (tempEdu) educations.push(tempEdu);

    // Clean dates and details
    experiences.forEach(exp => {
      if (exp.dates) {
        const parts = exp.dates.split(/[-–—]/).map((s: string) => s.trim());
        exp.startDate = parts[0] || "";
        exp.endDate = parts[1] || "";
      }
      delete exp.dates;
    });

    educations.forEach(edu => {
      if (edu.dates) {
        const parts = edu.dates.split(/[-–—·,()]/).map((s: string) => s.trim()).filter(Boolean);
        edu.startDate = parts[0] || "";
        edu.endDate = parts[1] || "";
      }
      delete edu.dates;
    });

    const formattedSkills = Array.from(new Set(skills))
      .map(s => s.trim())
      .filter(s => s.length > 1 && s.length < 30 && !isHeader(s))
      .map((s, idx) => ({
        id: `skill-li-${idx}-${Date.now()}`,
        name: s,
        level: 4
      }));

    return {
      fullName: fullName || undefined,
      jobTitle: jobTitle || undefined,
      summary: summary || undefined,
      experiences: experiences.filter(e => e.position && e.company),
      educations: educations.filter(e => e.institution),
      skills: formattedSkills
    };
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        alert("حجم الصورة كبير جداً، يرجى اختيار صورة أصغر من 800 كيلوبايت لضمان سرعة التحميل.");
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setMessage("");
    const formData = new FormData(e.currentTarget);
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

        {/* Tab content: Basic */}
        {activeTab === "basic" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-navy-50 pb-6">
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
                  اختر صورة مهنية واضحة بخلفية محايدة. الصيغ المدعومة: JPG, PNG. الحد الأقصى للحجم: 800 كيلوبايت.
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
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">الاسم الكامل</label>
                <input className="input" name="fullName" defaultValue={cv?.fullName ?? defaultFullName} required placeholder="مثال: أحمد محمد العلي" />
              </div>
              <div>
                <label className="label">المسمى المهني</label>
                <input className="input" name="jobTitle" defaultValue={cv?.jobTitle ?? ""} placeholder="مثال: محاسب قانوني / مهندس برمجيات" required />
              </div>
              <div>
                <label className="label">البريد الإلكتروني</label>
                <input className="input" name="email" type="email" defaultValue={cv?.email ?? defaultEmail} required />
              </div>
              <div>
                <label className="label">الهاتف</label>
                <input className="input" name="phone" defaultValue={cv?.phone ?? ""} required placeholder="07XXXXXXXX" />
              </div>
              <div>
                <label className="label">المدينة</label>
                <input className="input" name="city" defaultValue={cv?.city ?? ""} placeholder="مثال: عمان، إربد، الزرقاء" required />
              </div>
              <div>
                <label className="label">رابط موقعك الشخصي / معرض الأعمال</label>
                <input className="input" name="website" defaultValue={cv?.website ?? ""} placeholder="https://example.com" />
              </div>
              <div className="sm:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0">LinkedIn أو رابط ملف مهني</label>
                  <button
                    type="button"
                    onClick={handleLinkedInImport}
                    disabled={isImportingLinkedIn}
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                  >
                    {isImportingLinkedIn ? (
                      <>
                        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>جاري الاستيراد...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>استيراد ذكي من LinkedIn</span>
                      </>
                    )}
                  </button>
                </div>
                <input className="input" name="linkedin" defaultValue={cv?.linkedin ?? ""} placeholder="https://linkedin.com/in/username" />
              </div>
              <div className="sm:col-span-2">
                <label className="label">الملخص المهني (نبذة تعريفية)</label>
                <textarea
                  className="input min-h-36"
                  name="summary"
                  defaultValue={cv?.summary ?? ""}
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

      {/* LinkedIn Import Modal */}
      {isLinkedInModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 text-right" dir="rtl">
            {/* Modal Header */}
            <div className="bg-navy-950 text-white p-5 flex justify-between items-center">
              <h3 className="text-lg font-bold">⚡ استيراد السيرة الذاتية الحقيقية من LinkedIn</h3>
              <button 
                type="button" 
                onClick={() => setIsLinkedInModalOpen(false)}
                className="text-white hover:text-emerald-400 text-xl font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-6">
                <strong>💡 لماذا هذه الطريقة؟</strong> بسبب جدران الحماية الصارمة في LinkedIn وحجبها للقراءة الآلية للروابط مباشرة، قمنا بابتكار **محلل النص الذكي**! ما عليك سوى نسخ نص بروفايلك أو النص الموجود داخل ملف الـ PDF المصدر من LinkedIn ولصقه هنا ليقوم النظام بتحليل النص واستخراج كافة معلوماتك الحقيقية (الخبرات، التعليم، المهارات) فوراً وبدقة 100%!
                <br />
                <span className="font-semibold block mt-2">طريقة الحصول على النص:</span>
                <ol className="list-decimal list-inside mt-1 space-y-1 text-slate-700">
                  <li>اذهب إلى حسابك في LinkedIn.</li>
                  <li>اضغط على زر <strong>المزيد (More...)</strong> ثم اختر <strong>حفظ كملف PDF (Save to PDF)</strong>.</li>
                  <li>افتح الملف الناتج، اضغط <strong>Ctrl+A</strong> لتحديد النص كاملًا، ثم <strong>Ctrl+C</strong> للنسخ.</li>
                  <li>ألصق النص المنسوخ بالكامل في المربع أدناه.</li>
                </ol>
              </div>

              <div>
                <label className="label text-xs">ألصق النص المنسوخ هنا:</label>
                <textarea
                  value={linkedInText}
                  onChange={(e) => setLinkedInText(e.target.value)}
                  className="input min-h-60 text-xs font-mono"
                  placeholder="Mohammad Al-Saeed&#10;Senior Software Engineer at Mawdoo3&#10;...&#10;Experience&#10;Mawdoo3&#10;..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsLinkedInModalOpen(false)}
                className="btn-outline text-xs px-4 py-2"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleAnalyzeLinkedInText}
                className="btn-primary text-xs px-5 py-2"
              >
                تحليل واستيراد البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
