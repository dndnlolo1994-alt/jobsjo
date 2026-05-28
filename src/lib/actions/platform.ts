"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireEmployer, requireJobSeeker, requireUser, hashPassword, verifyPassword, isAdminEmail } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { registerSchema, loginSchema, applicationSchema, companyClaimSchema, cvSchema } from "@/lib/validation";
import { jobCreateSchema } from "@/lib/validation";
import { uniqueSlug, toCsv } from "@/lib/utils";
import { computeMatch } from "@/lib/matching/job-score";
import { ensureCvPdfBilling } from "@/lib/billing/cv";
import { getNotifier } from "@/lib/notifications";

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

export async function registerAction(_: unknown, form: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من الحقول" };
  const data = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
  if (exists) return { ok: false, message: "يوجد حساب بهذا البريد الإلكتروني" };
  const role = isAdminEmail(data.email) ? "ADMIN" : data.role;
  const isActive = role === "ADMIN";
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      phone: data.phone,
      role,
      isActive,
      passwordHash: await hashPassword(data.password),
      ...(role === "JOB_SEEKER" ? { jobSeekerProfile: { create: { fullName: data.fullName, phone: data.phone, email: data.email.toLowerCase() } } } : {}),
      ...(role === "EMPLOYER" ? { employerProfile: { create: { ownerName: data.fullName, phone: data.phone } } } : {}),
    },
  });

  if (!isActive) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    
    await prisma.otpVerification.upsert({
      where: { email: user.email },
      create: { email: user.email, code: otpCode, expiresAt },
      update: { code: otpCode, expiresAt, createdAt: new Date() },
    });

    console.log(`\n======================================================`);
    console.log(`🔑 رمز التحقق (OTP) للتسجيل الجديد [${user.email}]: [${otpCode}]`);
    console.log(`======================================================\n`);

    redirect(`/verify-otp?email=${encodeURIComponent(user.email)}`);
  }

  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();
  redirect("/admin");
}


export async function loginAction(_: unknown, form: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات الدخول غير صحيحة" };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.isSuspended || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }
  
  if (!user.isActive) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await prisma.otpVerification.upsert({
      where: { email: user.email },
      create: { email: user.email, code: otpCode, expiresAt },
      update: { code: otpCode, expiresAt, createdAt: new Date() },
    });

    console.log(`\n======================================================`);
    console.log(`🔑 رمز تحقق دخول معلق (OTP) للبريد [${user.email}]: [${otpCode}]`);
    console.log(`======================================================\n`);

    redirect(`/verify-otp?email=${encodeURIComponent(user.email)}`);
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();
  redirect(user.role === "EMPLOYER" ? "/employer" : user.role === "ADMIN" ? "/admin" : "/me");
}

export async function verifyOtpAction(email: string, code: string) {
  if (!email || !code) return { ok: false, message: "البريد الإلكتروني والرمز مطلوبان" };
  
  const verification = await prisma.otpVerification.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!verification || verification.code !== code.trim()) {
    return { ok: false, message: "رمز التحقق المدخل غير صحيح" };
  }

  if (new Date() > verification.expiresAt) {
    return { ok: false, message: "لقد انتهت صلاحية هذا الرمز. الرجاء طلب رمز جديد" };
  }

  // Activate user
  const user = await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { isActive: true },
  });

  // Clean up OTP code
  await prisma.otpVerification.delete({ where: { email: email.toLowerCase() } }).catch(() => {});

  // Create session
  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();

  return { 
    ok: true, 
    message: "تم تفعيل حسابك بنجاح", 
    redirect: user.role === "EMPLOYER" ? "/employer" : user.role === "ADMIN" ? "/admin" : "/me" 
  };
}

export async function resendOtpAction(email: string) {
  if (!email) return { ok: false, message: "البريد الإلكتروني مطلوب" };
  
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) return { ok: false, message: "هذا الحساب غير موجود في النظام" };
  if (user.isActive) return { ok: false, message: "هذا الحساب مفعل بالفعل" };

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: { email: email.toLowerCase() },
    create: { email: email.toLowerCase(), code: otpCode, expiresAt },
    update: { code: otpCode, expiresAt, createdAt: new Date() },
  });

  console.log(`\n======================================================`);
  console.log(`🔑 إعادة إرسال رمز تحقق (OTP) للبريد [${user.email}]: [${otpCode}]`);
  console.log(`======================================================\n`);

  return { ok: true, message: "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني" };
}


export async function saveCvAction(_: unknown, form: FormData) {
  const user = await requireJobSeeker();
  const parsed = cvSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "تحقق من بيانات السيرة الذاتية" };
  const data = parsed.data;

  let experiences: any[] = [];
  let educations: any[] = [];
  let skills: any[] = [];
  let certifications: any[] = [];

  try {
    if (data.experiencesJson) experiences = JSON.parse(data.experiencesJson);
    if (data.educationsJson) educations = JSON.parse(data.educationsJson);
    if (data.skillsJson) skills = JSON.parse(data.skillsJson);
    if (data.certificationsJson) certifications = JSON.parse(data.certificationsJson);
  } catch (e) {
    return { ok: false, message: "فشل في معالجة تفاصيل السيرة الذاتية" };
  }

  const cv = await prisma.cVProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: data.fullName,
      jobTitle: data.jobTitle,
      summary: data.summary,
      email: data.email || user.email,
      phone: data.phone,
      city: data.city,
      website: data.website,
      linkedin: data.linkedin,
      photo: data.photo || null,
      template: data.template || "modern-emerald",
      englishVersion: data.englishVersion || null,
    },
    update: {
      fullName: data.fullName,
      jobTitle: data.jobTitle,
      summary: data.summary,
      email: data.email || user.email,
      phone: data.phone,
      city: data.city,
      website: data.website,
      linkedin: data.linkedin,
      photo: data.photo || null,
      template: data.template || "modern-emerald",
      englishVersion: data.englishVersion || null,
    },
  });

  // Delete all existing items and recreate
  await prisma.$transaction([
    prisma.cVExperience.deleteMany({ where: { cvId: cv.id } }),
    prisma.cVEducation.deleteMany({ where: { cvId: cv.id } }),
    prisma.cVSkill.deleteMany({ where: { cvId: cv.id } }),
    prisma.cVCertification.deleteMany({ where: { cvId: cv.id } }),
  ]);

  if (experiences.length > 0) {
    await prisma.cVExperience.createMany({
      data: experiences.map((e: any, index: number) => ({
        cvId: cv.id,
        position: e.position,
        company: e.company,
        city: e.city || null,
        startDate: e.startDate,
        endDate: e.endDate || null,
        description: e.description || null,
        order: index,
      })),
    });
  }

  if (educations.length > 0) {
    await prisma.cVEducation.createMany({
      data: educations.map((e: any, index: number) => ({
        cvId: cv.id,
        degree: e.degree,
        institution: e.institution,
        city: e.city || null,
        startDate: e.startDate,
        endDate: e.endDate || null,
        description: e.description || null,
        order: index,
      })),
    });
  }

  if (skills.length > 0) {
    await prisma.cVSkill.createMany({
      data: skills.map((s: any, index: number) => ({
        cvId: cv.id,
        name: s.name,
        level: s.level ? parseInt(s.level) : 3,
        order: index,
      })),
    });
  }

  if (certifications.length > 0) {
    await prisma.cVCertification.createMany({
      data: certifications.map((c: any, index: number) => ({
        cvId: cv.id,
        name: c.name,
        issuer: c.issuer || null,
        year: c.year || null,
        order: index,
      })),
    });
  }

  const skillsCsv = skills.map((s: any) => s.name).join(",");

  await ensureCvPdfBilling(user.id, cv.id);
  await prisma.jobSeekerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || user.email,
      city: data.city,
      headline: data.jobTitle,
      summary: data.summary,
      skills: skillsCsv,
    },
    update: {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email || user.email,
      city: data.city,
      headline: data.jobTitle,
      summary: data.summary,
      skills: skillsCsv,
    },
  });

  revalidatePath("/me/cv");
  return { ok: true, message: "تم حفظ السيرة الذاتية بنجاح" };
}

export async function applyToJobAction(_: unknown, form: FormData): Promise<any> {
  const user = await requireJobSeeker();
  const parsed = applicationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "تعذر إرسال الطلب" };
  
  const [job, seeker, cv] = await Promise.all([
    prisma.job.findUnique({ where: { id: parsed.data.jobId } }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } }),
    prisma.cVProfile.findUnique({
      where: { userId: user.id },
      include: {
        experiences: { orderBy: { order: "asc" } },
        educations: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } }
      }
    }),
  ]);

  if (!job || job.status !== "PUBLISHED") return { ok: false, message: "الوظيفة غير متاحة" };
  if (job.contactMethod !== "INTERNAL_APPLY") return { ok: false, message: "هذه الوظيفة تقبل التقديم الخارجي فقط" };

  // Check application limits for FREE plan
  const isFreePlan = !seeker || seeker.plan === "FREE";
  if (isFreePlan) {
    const existingCount = await prisma.application.count({
      where: { jobSeekerId: user.id },
    });
    if (existingCount >= 5) {
      return {
        ok: false,
        message: "لقد تجاوزت الحد الأقصى للتقديم المجاني (5 وظائف). يرجى الترقية لباقة Plus للتقديم غير المحدود.",
      };
    }
  }

  const match = seeker ? computeMatch(job, { ...seeker, hasCv: !!cv }) : { score: 0 };
  try {
    await prisma.application.create({
      data: { jobId: job.id, jobSeekerId: user.id, cvId: cv?.id, coverNote: parsed.data.coverNote, matchScore: match.score, appliedVia: "INTERNAL" },
    });
    await prisma.job.update({ where: { id: job.id }, data: { applicationCount: { increment: 1 } } });

    // Send notification to employer
    let employerEmail = job.contactEmail;
    if (!employerEmail && job.postedById) {
      const poster = await prisma.user.findUnique({ where: { id: job.postedById } });
      employerEmail = poster?.email || null;
    }

    if (employerEmail) {
      const notifier = getNotifier();
      const cvLink = `https://jojobs-os.vercel.app/employer`; // Redirect to employer panel to purchase package/log in!
      
      let experiencesHtml = "";
      let educationsHtml = "";
      let skillsHtml = "";
      let certsHtml = "";

      if (cv) {
        experiencesHtml = cv.experiences?.length > 0 
          ? cv.experiences.map((exp: any) => `
              <div style="margin-bottom: 12px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; text-align: right;" dir="rtl">
                <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${exp.position}</div>
                <div style="font-size: 11px; color: #059669; font-weight: bold; margin-top: 2px;">${exp.company} ${exp.city ? `• ${exp.city}` : ''}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 1px;">${exp.startDate} - ${exp.endDate || 'حتى الآن'}</div>
                ${exp.description ? `<p style="font-size: 11px; color: #475569; margin-top: 5px; line-height: 1.5; white-space: pre-line;">${exp.description}</p>` : ''}
              </div>
            `).join('')
          : '<p style="color: #94a3b8; font-size: 12px; font-style: italic; text-align: right;" dir="rtl">لا توجد خبرات مسجلة.</p>';

        educationsHtml = cv.educations?.length > 0 
          ? cv.educations.map((edu: any) => `
              <div style="margin-bottom: 10px; text-align: right;" dir="rtl">
                <div style="font-weight: bold; color: #0f172a; font-size: 13px;">${edu.degree}</div>
                <div style="font-size: 11px; color: #475569; margin-top: 2px;">${edu.institution} ${edu.city ? `• ${edu.city}` : ''}</div>
                <div style="font-size: 10px; color: #64748b; margin-top: 1px;">${edu.startDate} - ${edu.endDate || 'حتى الآن'}</div>
              </div>
            `).join('')
          : '<p style="color: #94a3b8; font-size: 12px; font-style: italic; text-align: right;" dir="rtl">لا توجد مؤهلات علمية مسجلة.</p>';

        skillsHtml = cv.skills?.length > 0 
          ? cv.skills.map((s: any) => `
              <span style="display: inline-block; background-color: #ecfdf5; border: 1px solid #d1fae5; color: #065f46; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: 9999px; margin-left: 4px; margin-bottom: 4px;">
                ${s.name} ${'★'.repeat(s.level || 3)}
              </span>
            `).join('')
          : '<p style="color: #94a3b8; font-size: 12px; font-style: italic; text-align: right;" dir="rtl">لا توجد مهارات مسجلة.</p>';

        certsHtml = cv.certifications?.length > 0 
          ? cv.certifications.map((c: any) => `
              <div style="font-size: 11px; color: #1e293b; margin-bottom: 5px; background-color: #f8fafc; padding: 5px 8px; border-radius: 4px; border: 1px solid #f1f5f9; text-align: right;" dir="rtl">
                <strong>${c.name}</strong> • <span style="color: #64748b;">${c.issuer || ''} ${c.year ? `(${c.year})` : ''}</span>
              </div>
            `).join('')
          : '<p style="color: #94a3b8; font-size: 12px; font-style: italic; text-align: right;" dir="rtl">لا توجد شهادات مسجلة.</p>';
      }

      await notifier.send({
        to: employerEmail,
        subject: `💼 مرشح جديد مهتم بالتوظيف: ${job.title}`,
        text: `مرحبا، لقد تقدم مرشح جديد لوظيفة "${job.title}" عبر منصة جوبز الأردن.\n\nالاسم الكامل: ${cv?.fullName || user.fullName}\nنسبة المطابقة: ${match.score}%\n\nالبيانات المباشرة والـ PDF محجوبة لحماية البيانات وتتطلب باقة نشطة.\nعرض بيانات الاتصال وتنزيل السيرة: ${cvLink}`,
        html: `
          <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; border: 1px solid #e2e8f0; padding: 0; border-radius: 12px; max-width: 600px; margin: 0 auto; color: #1e293b; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-align: right;">
            {/* Header banner */}
            <div style="background-color: #084c41; padding: 24px; text-align: center; color: #ffffff;">
              <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">منصة جوبز الأردن | JoJobs</h2>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #c2a06c; font-weight: bold;">طلب تقديم مرشح جديد لوظيفتك</p>
            </div>
            
            <div style="padding: 24px;">
              <p style="font-size: 14px; line-height: 1.6;">مرحباً،</p>
              <p style="font-size: 14px; line-height: 1.6; margin-bottom: 20px;">لقد تقدم مرشح جديد لوظيفتك الشاغرة <strong>"${job.title}"</strong> عبر المنصة. إليك نظرة شاملة على مؤهلاته وسيرته المهنية:</p>
              
              {/* Profile Card */}
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: right;" dir="rtl">
                <table style="width: 100%; border-collapse: collapse; text-align: right;">
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b; width: 130px;">الاسم الكامل:</td>
                    <td style="padding: 6px 0; font-weight: bold; font-size: 14px; color: #0f172a;">${cv?.fullName || user.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">المسمى الوظيفي:</td>
                    <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #084c41;">${cv?.jobTitle || "باحث عن عمل"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #64748b;">نسبة مطابقة الوظيفة:</td>
                    <td style="padding: 6px 0;"><span style="background-color: #ecfdf5; color: #065f46; padding: 2px 10px; border-radius: 9999px; font-weight: bold; font-size: 12px; border: 1px solid #d1fae5;">${match.score}% مطابقة</span></td>
                  </tr>
                </table>
                ${cv?.summary ? `
                  <div style="margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: right;">
                    <div style="font-weight: bold; font-size: 12px; color: #64748b; margin-bottom: 4px;">النبذة التعريفية:</div>
                    <p style="margin: 0; font-size: 12px; color: #334155; line-height: 1.6; text-align: justify; font-style: italic;">${cv.summary}</p>
                  </div>
                ` : ''}
              </div>

              {/* CV Summary details */}
              <h3 style="color: #084c41; font-size: 15px; border-bottom: 2px solid #084c41; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; text-align: right;">💼 الخبرات المهنية والعملية:</h3>
              <div style="padding-right: 8px;">${experiencesHtml}</div>

              <h3 style="color: #084c41; font-size: 15px; border-bottom: 2px solid #084c41; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; text-align: right;">🎓 المؤهلات والتعليم:</h3>
              <div style="padding-right: 8px;">${educationsHtml}</div>

              <h3 style="color: #084c41; font-size: 15px; border-bottom: 2px solid #084c41; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; text-align: right;">⚡ المهارات الرئيسية:</h3>
              <div style="padding-right: 8px; margin-bottom: 10px; text-align: right;" dir="rtl">${skillsHtml}</div>

              ${(cv?.certifications?.length ?? 0) > 0 ? `
                <h3 style="color: #084c41; font-size: 15px; border-bottom: 2px solid #084c41; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; text-align: right;">📜 الشهادات والدورات التدريبية:</h3>
                <div style="padding-right: 8px;">${certsHtml}</div>
              ` : ''}

              {/* Cover Letter / Note */}
              <h3 style="color: #084c41; font-size: 15px; border-bottom: 2px solid #084c41; padding-bottom: 4px; margin-top: 24px; margin-bottom: 12px; text-align: right;">✉ رسالة التقديم (Cover Letter):</h3>
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-style: italic; font-size: 12px; line-height: 1.5; color: #475569; text-align: right;">
                ${parsed.data.coverNote ? parsed.data.coverNote.replace(/\n/g, "<br>") : "لا توجد رسالة مرفقة من قبل المرشح."}
              </div>

              {/* Protected Contact details lock screen */}
              <div style="background-color: #fff9e6; border: 1px solid #ffeeba; border-radius: 8px; padding: 16px; margin-top: 30px; text-align: right;" dir="rtl">
                <div style="font-weight: bold; color: #856404; font-size: 14px; margin-bottom: 6px;">
                  🔒 بيانات الاتصال مغلقة ورابط تنزيل الـ PDF الرسمي محجوب
                </div>
                <p style="margin: 0; font-size: 12px; color: #664d03; line-height: 1.6;">
                  لحماية بيانات الباحثين عن عمل، تم إخفاء أرقام الهواتف والبريد الإلكتروني المباشر ورابط الـ PDF الرسمي للمرشح. 
                  لفتح هذه البيانات للتواصل المباشر والتوظيف الفوري، يرجى تفعيل اشتراك صاحب العمل على المنصة.
                </p>
                <div style="margin-top: 10px; font-size: 11px; color: #856404; font-weight: bold;">
                  • الهاتف: <span style="color: #dc2626; font-style: italic;">[🔒 مخفي - يتطلب باقة نشطة للتواصل]</span><br>
                  • البريد: <span style="color: #dc2626; font-style: italic;">[🔒 مخفي - يتطلب باقة نشطة للتواصل]</span>
                </div>
              </div>

              {/* Visual CTA Button */}
              <p style="margin-top: 35px; text-align: center;">
                <a href="${cvLink}" style="background-color: #084c41; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px; box-shadow: 0 4px 10px rgba(8,76,65,0.15); border: 1px solid #c2a06c;">🔓 تفعيل الاشتراك وعرض بيانات التواصل</a>
              </p>
            </div>
            
            <div style="background-color: #f1f5f9; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center;">
              <p style="font-size: 11px; color: #64748b; margin: 0;">هذا الإشعار مرسل تلقائياً من نظام جوبز الأردن لإدارة طلبات التوظيف.</p>
              <p style="font-size: 10px; color: #94a3b8; margin: 4px 0 0 0;">جميع الحقوق محفوظة © 2026 منصة جوبز الأردن.</p>
            </div>
          </div>
        `
      });
    }
  } catch (err) {
    console.error("Apply to job error:", err);
    return { ok: false, message: "لقد تقدمت لهذه الوظيفة سابقاً" };
  }

  revalidatePath("/me/applications");
  redirect("/me/applications?applied=true");
}

export async function saveJobAction(jobId: string) {
  const user = await requireJobSeeker();
  await prisma.savedJob.upsert({
    where: { jobId_userId: { jobId, userId: user.id } },
    create: { jobId, userId: user.id },
    update: {},
  });
  revalidatePath("/me/saved-jobs");
}

export async function createClaimAction(_: unknown, form: FormData): Promise<any> {
  const parsed = companyClaimSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "تحقق من بيانات المطالبة" };
  const user = await requireUser().catch(() => null);
  const company = await prisma.company.findUnique({
    where: { id: parsed.data.companyId },
    select: { slug: true }
  });
  if (company) {
    await prisma.companyClaim.create({
      data: { ...parsed.data, claimantId: user?.id, proofUrl: parsed.data.proofUrl || undefined, websiteOrSocialUrl: str(form, "websiteOrSocialUrl") },
    });
    revalidatePath(`/companies/${company.slug}`);
    redirect(`/companies/${company.slug}?claimed=true`);
  }
  return { ok: false, message: "الشركة غير موجودة" };
}

export async function adminCreateJobAction(_: unknown, form: FormData) {
  const admin = await requireAdmin();
  const parsed = jobCreateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من بيانات الوظيفة" };
  const data = parsed.data;
  const expiresAt = str(form, "expiresAt") ? new Date(str(form, "expiresAt")!) : new Date(Date.now() + data.expiresInDays * 86400000);
  const status = (str(form, "status") as never) || "DRAFT";
  const title = data.title;
  await prisma.job.create({
    data: {
      ...data,
      slug: uniqueSlug(title),
      companyNameText: str(form, "companyNameText"),
      companyRelation: (str(form, "companyRelation") as never) || "CURATED_EXTERNAL",
      status,
      sourceType: (str(form, "sourceType") as never) || "ADMIN_MANUAL",
      sourceName: str(form, "sourceName"),
      sourceUrl: str(form, "sourceUrl"),
      sourceTrustLevel: (str(form, "sourceTrustLevel") as never) || "MEDIUM",
      originalPostedAt: str(form, "originalPostedAt") ? new Date(str(form, "originalPostedAt")!) : undefined,
      sourceVerifiedAt: status === "PUBLISHED" ? new Date() : undefined,
      curatedByAdminId: admin.id,
      expiresAt,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      featured: form.get("featured") === "on",
      urgent: form.get("urgent") === "on",
      pinnedUntil: form.get("pinned") === "on" ? expiresAt : undefined,
      contactEmail: data.contactEmail || undefined,
      externalUrl: data.externalUrl || undefined,
    },
  });
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}

export async function employerCreateJobAction(_: unknown, form: FormData) {
  const employer = await requireEmployer();
  const parsed = jobCreateSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "تحقق من بيانات الوظيفة" };
  const data = parsed.data;
  const expiresAt = new Date(Date.now() + data.expiresInDays * 86400000);
  
  // Get employer's full profile to check for linked company
  const fullUser = await prisma.user.findUnique({
    where: { id: employer.id },
    include: { employerProfile: { include: { company: true } } },
  });

  const companyId = fullUser?.employerProfile?.companyId || null;
  const companyName = fullUser?.employerProfile?.company?.name || str(form, "companyNameText") || employer.fullName;

  await prisma.job.create({
    data: {
      ...data,
      slug: uniqueSlug(data.title),
      companyId,
      companyNameText: companyName,
      companyRelation: "DIRECT_EMPLOYER",
      status: "PENDING_REVIEW",
      sourceType: "EMPLOYER_DIRECT",
      sourceTrustLevel: "MEDIUM",
      postedById: employer.id,
      expiresAt,
      featured: false,
      urgent: false,
      contactEmail: data.contactEmail || undefined,
      externalUrl: data.externalUrl || undefined,
    },
  });

  revalidatePath("/employer");
  redirect("/employer");
}

export async function adminApproveJobAction(jobId: string) {
  await requireAdmin();
  const job = await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
      sourceVerifiedAt: new Date(),
    },
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/");
  if (job?.slug) {
    revalidatePath(`/jobs/${job.slug}`);
  }
  redirect("/admin/jobs");
}

export async function adminRejectJobAction(jobId: string) {
  await requireAdmin();
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "REJECTED",
    },
  });
  revalidatePath("/admin/jobs");
  redirect("/admin/jobs");
}


// Map a billing type to the EmployerPlan it grants (if any)
const EMPLOYER_PLAN_FOR_TYPE: Record<string, "BASIC" | "PRO" | "BUSINESS"> = {
  EMPLOYER_BASIC: "BASIC",
  EMPLOYER_PRO: "PRO",
  EMPLOYER_BUSINESS: "BUSINESS",
};

export async function adminUpdatePaymentAction(id: string, status: "PAID" | "WAIVED" | "UNPAID") {
  await requireAdmin();
  const isActivating = status === "PAID" || status === "WAIVED";

  const record = await prisma.billingRecord.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : null },
  });

  // Apply the real-world effect of the payment so activation is instant and connected.
  const monthAhead = new Date(Date.now() + 30 * 86400000);

  if (isActivating) {
    // 1) Job Seeker Plus upgrade
    if (record.type === "JOB_SEEKER_PLUS" && record.userId) {
      await prisma.jobSeekerProfile.updateMany({
        where: { userId: record.userId },
        data: { plan: "PLUS", planExpiresAt: monthAhead },
      });
    }

    // 2) Employer subscription plans
    const employerPlan = EMPLOYER_PLAN_FOR_TYPE[record.type];
    if (employerPlan && record.userId) {
      await prisma.employerProfile.updateMany({
        where: { userId: record.userId },
        data: { plan: employerPlan, planExpiresAt: monthAhead },
      });
    }

    // 3) Job post upgrades / publishing
    const jobId = record.jobId || record.relatedJobId;
    if (jobId) {
      const jobData: Record<string, unknown> = {};
      if (record.type === "JOB_POST_FEATURED") jobData.featured = true;
      if (record.type === "JOB_POST_URGENT") { jobData.urgent = true; jobData.pinnedUntil = monthAhead; }
      // Any paid job post should be live
      if (record.type.startsWith("JOB_POST_")) {
        jobData.status = "PUBLISHED";
        jobData.publishedAt = new Date();
      }
      if (Object.keys(jobData).length > 0) {
        const job = await prisma.job.update({ where: { id: jobId }, data: jobData }).catch(() => null);
        if (job?.slug) revalidatePath(`/jobs/${job.slug}`);
      }
    }
  } else {
    // Reverting to UNPAID downgrades the matching grant
    if (record.type === "JOB_SEEKER_PLUS" && record.userId) {
      await prisma.jobSeekerProfile.updateMany({ where: { userId: record.userId }, data: { plan: "FREE", planExpiresAt: null } });
    }
    if (EMPLOYER_PLAN_FOR_TYPE[record.type] && record.userId) {
      await prisma.employerProfile.updateMany({ where: { userId: record.userId }, data: { plan: "FREE", planExpiresAt: null } });
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/payments");
  revalidatePath("/me");
  revalidatePath("/me/billing");
  revalidatePath("/me/cv");
  revalidatePath("/");
}

export async function adminUpdateApplicationStatus(id: string, status: string) {
  await requireEmployer();
  const app = await prisma.application.update({ 
    where: { id }, 
    data: { status: status as never },
    select: { jobId: true }
  });
  revalidatePath(`/employer/jobs/${app.jobId}/applications`);
  revalidatePath("/employer");
  redirect(`/employer/jobs/${app.jobId}/applications`);
}

export async function adminCreateSourceAction(_: unknown, form: FormData): Promise<any> {
  await requireAdmin();
  await prisma.jobSource.create({
    data: {
      sourceName: str(form, "sourceName") ?? "مصدر بدون اسم",
      sourceType: (str(form, "sourceType") as never) ?? "OTHER",
      sourceUrl: str(form, "sourceUrl"),
      organizationName: str(form, "organizationName"),
      trustLevel: (str(form, "trustLevel") as never) ?? "MEDIUM",
      notes: str(form, "notes"),
      active: form.get("active") !== "off",
    },
  });
  revalidatePath("/admin/sources");
  redirect("/admin/sources");
}

export async function adminToggleSourceAction(id: string, active: boolean) {
  await requireAdmin();
  await prisma.jobSource.update({ where: { id }, data: { active } });
  revalidatePath("/admin/sources");
}

export async function adminReviewClaimAction(id: string, status: "APPROVED" | "REJECTED") {
  await requireAdmin();
  await prisma.companyClaim.update({ where: { id }, data: { status, reviewedAt: new Date() } });
  revalidatePath("/admin/claims");
  redirect("/admin/claims");
}
