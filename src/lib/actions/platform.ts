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
import { sendApplicationConfirmation, sendNewApplicationAlert } from "@/lib/emails/applicationConfirmation";
import { env } from "@/lib/env";

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
}

async function notifyJobSeekerPlanChange(userId: string, plan: "FREE" | "PLUS", expiresAt: Date | null) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });
  if (!user?.email) return;

  const isPlus = plan === "PLUS";
  const expiresText = expiresAt
    ? new Intl.DateTimeFormat("ar-JO", { dateStyle: "long" }).format(expiresAt)
    : "";
  const subject = isPlus
    ? "تم تفعيل باقة Plus في جوبز الأردن"
    : "تم تحديث خطة حسابك في جوبز الأردن";
  const text = isPlus
    ? `مرحباً ${user.fullName}، تم تفعيل باقة Plus لحسابك في جوبز الأردن. يمكنك الآن استخدام مزايا Plus حتى ${expiresText}.`
    : `مرحباً ${user.fullName}، تم تحديث خطة حسابك إلى الخطة المجانية في جوبز الأردن.`;
  const html = `
    <div dir="rtl" style="font-family:'Cairo',Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;color:#1e293b;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;text-align:right;">
      <div style="background:#064e3b;color:#ffffff;padding:22px;text-align:center;">
        <h1 style="margin:0;font-size:20px;">جوبز الأردن</h1>
        <p style="margin:6px 0 0;color:#bbf7d0;font-size:13px;">إشعار تفعيل الخطة</p>
      </div>
      <div style="padding:24px;line-height:1.8;">
        <p style="margin:0 0 12px;">مرحباً <strong>${user.fullName}</strong>،</p>
        ${
          isPlus
            ? `<p style="margin:0 0 12px;">تم تفعيل <strong>باقة Plus</strong> لحسابك من قبل إدارة المنصة.</p>
               <div style="background:#ecfdf5;border:1px solid #a7f3d0;color:#065f46;border-radius:12px;padding:14px;margin:16px 0;">
                 يمكنك الآن استخدام مزايا Plus: التقديم غير المحدود، مزايا السيرة الذاتية، صفحة QR التعريفية، وتتبع الطلبات.
                 ${expiresText ? `<br/>تاريخ انتهاء التفعيل الحالي: <strong>${expiresText}</strong>.` : ""}
               </div>`
            : `<p style="margin:0 0 12px;">تم تحديث حسابك إلى الخطة المجانية. يمكنك الاستمرار باستخدام مزايا الحساب المجاني.</p>`
        }
        <p style="margin:16px 0 0;color:#64748b;font-size:13px;">إذا كان لديك أي استفسار، تواصل معنا عبر صفحة التواصل في المنصة.</p>
      </div>
    </div>`;

  await getNotifier().send({ to: user.email, subject, text, html });
}

/**
 * Delivers a one-time code to the user. Sends a real email via the configured
 * notifier (SMTP in production) and ONLY prints the code to the console in
 * development — production logs must never contain OTP codes.
 */
async function deliverOtp(email: string, code: string, purpose: "register" | "login" | "reset") {
  const titles = {
    register: "تفعيل حسابك في جوبز الأردن",
    login: "رمز تسجيل الدخول",
    reset: "إعادة تعيين كلمة المرور",
  } as const;
  const title = titles[purpose];
  const subject = `${title} — رمز التحقق ${code}`;
  const text = `رمز التحقق الخاص بك هو: ${code}\nالرمز صالح لمدة 10 دقائق.\nإذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة.`;
  const html = `
    <div dir="rtl" style="font-family:'Cairo',Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;background:#ffffff;color:#1e293b;text-align:right;">
      <div style="background:#084c41;padding:20px;text-align:center;color:#ffffff;">
        <h2 style="margin:0;font-size:18px;font-weight:bold;">منصة جوبز الأردن | JoJobs</h2>
        <p style="margin:6px 0 0 0;font-size:12px;color:#c2a06c;font-weight:bold;">${title}</p>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 12px 0;font-size:14px;">استخدم الرمز التالي لإتمام العملية:</p>
        <div style="text-align:center;font-size:30px;font-weight:bold;letter-spacing:8px;color:#084c41;background:#ecfdf5;border:1px dashed #84cc16;border-radius:10px;padding:14px;margin:0 0 14px 0;">${code}</div>
        <p style="margin:0;font-size:12px;color:#64748b;">الرمز صالح لمدة 10 دقائق. إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.</p>
      </div>
    </div>`;
  try {
    await getNotifier().send({ to: email, subject, text, html });
  } catch (err) {
    console.error("[otp] فشل إرسال رمز التحقق:", err);
  }
  // Dev convenience only — never log OTP codes in production.
  if (process.env.NODE_ENV !== "production") {
    console.log(`\n======================================================`);
    console.log(`🔑 OTP [${purpose}] [${email}]: [${code}]`);
    console.log(`======================================================\n`);
  }
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

    await deliverOtp(user.email, otpCode, "register");

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
  
  // Auto-promote to admin if email is in ADMIN_EMAILS
  if (isAdminEmail(user.email) && user.role !== "ADMIN") {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN", isActive: true }, // Ensure active as well
      });
      user.role = "ADMIN";
      user.isActive = true;
    } catch (err) {
      console.error("[login] Failed to auto-promote admin email on login:", err);
    }
  }

  if (!user.isActive) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    await prisma.otpVerification.upsert({
      where: { email: user.email },
      create: { email: user.email, code: otpCode, expiresAt },
      update: { code: otpCode, expiresAt, createdAt: new Date() },
    });

    await deliverOtp(user.email, otpCode, "login");

    redirect(`/verify-otp?email=${encodeURIComponent(user.email)}`);
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();
  return {
    ok: true,
    redirect: user.role === "EMPLOYER" ? "/employer" : user.role === "ADMIN" ? "/admin" : "/me",
  };
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

  await deliverOtp(user.email, otpCode, "register");

  return { ok: true, message: "تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني" };
}

export async function requestPasswordResetAction(_: unknown, form: FormData) {
  const email = str(form, "email")?.toLowerCase();
  if (!email) return { ok: false, message: "البريد الإلكتروني مطلوب" };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: true, message: "إذا كان البريد مسجلاً لدينا، سيظهر رمز إعادة الضبط في البريد أو لوحة التشغيل." };
  }

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otpVerification.upsert({
    where: { email },
    create: { email, code: otpCode, expiresAt },
    update: { code: otpCode, expiresAt, createdAt: new Date() },
  });

  await deliverOtp(email, otpCode, "reset");

  return {
    ok: true,
    message: "تم إنشاء رمز إعادة ضبط كلمة المرور. الرمز صالح لمدة 10 دقائق.",
    redirect: `/reset-password?email=${encodeURIComponent(email)}`,
  };
}

export async function resendPasswordResetCodeAction(email: string) {
  if (!email) return { ok: false, message: "البريد الإلكتروني مطلوب" };

  const form = new FormData();
  form.set("email", email);
  return requestPasswordResetAction(null, form);
}

export async function resetPasswordAction(_: unknown, form: FormData) {
  const email = str(form, "email")?.toLowerCase();
  const code = str(form, "code");
  const password = str(form, "password");
  const confirmPassword = str(form, "confirmPassword");

  if (!email || !code || !password || !confirmPassword) {
    return { ok: false, message: "جميع الحقول مطلوبة" };
  }
  if (password.length < 8) return { ok: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  if (password !== confirmPassword) return { ok: false, message: "كلمتا المرور غير متطابقتين" };

  const verification = await prisma.otpVerification.findUnique({ where: { email } });
  if (!verification || verification.code !== code.trim()) {
    return { ok: false, message: "رمز إعادة الضبط غير صحيح" };
  }
  if (new Date() > verification.expiresAt) {
    return { ok: false, message: "انتهت صلاحية الرمز. اطلب رمزاً جديداً." };
  }

  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash: await hashPassword(password),
      isActive: true,
      isSuspended: false,
      lastLoginAt: new Date(),
    },
  });

  await prisma.otpVerification.delete({ where: { email } }).catch(() => {});

  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();

  return {
    ok: true,
    message: "تم تغيير كلمة المرور وتسجيل الدخول بنجاح",
    redirect: user.role === "EMPLOYER" ? "/employer" : user.role === "ADMIN" ? "/admin" : "/me",
  };
}

export async function saveCurrentSearchAction(_: unknown, form: FormData) {
  const user = await requireUser();
  const name = str(form, "name") ?? "بحث محفوظ";
  const queryJsonRaw = str(form, "queryJson");
  if (!queryJsonRaw) return { ok: false, message: "لا توجد فلاتر لحفظها" };

  let queryJson: Record<string, string> = {};
  try {
    queryJson = JSON.parse(queryJsonRaw);
  } catch {
    return { ok: false, message: "تعذر قراءة الفلاتر الحالية" };
  }

  await prisma.savedSearch.create({
    data: {
      userId: user.id,
      name: name.slice(0, 80),
      queryJson,
    },
  });
  revalidatePath("/jobs");
  revalidatePath("/me/saved-searches");
  return { ok: true, message: "تم حفظ البحث. سنرسل لك تنبيهات عند توفر وظائف مطابقة." };
}

export async function toggleSavedSearchAction(id: string) {
  const user = await requireUser();
  const existing = await prisma.savedSearch.findFirst({ where: { id, userId: user.id } });
  if (!existing) return;
  await prisma.savedSearch.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  revalidatePath("/me/saved-searches");
}

export async function deleteSavedSearchAction(id: string) {
  const user = await requireUser();
  await prisma.savedSearch.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/me/saved-searches");
}

export async function createCompanyReviewAction(_: unknown, form: FormData) {
  const user = await requireUser();
  const companyId = str(form, "companyId");
  const rating = Number(str(form, "rating"));
  const title = str(form, "title");
  const comment = str(form, "comment");
  if (!companyId || !title || !comment) return { ok: false, message: "يرجى تعبئة جميع حقول التقييم" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { ok: false, message: "التقييم يجب أن يكون من 1 إلى 5" };

  const company = await prisma.company.findUnique({ where: { id: companyId }, select: { slug: true } });
  if (!company) return { ok: false, message: "الشركة غير موجودة" };

  await prisma.companyReview.create({
    data: {
      companyId,
      userId: user.id,
      rating,
      title: title.slice(0, 120),
      comment: comment.slice(0, 1200),
      status: "PENDING",
    },
  });
  revalidatePath(`/companies/${company.slug}`);
  return { ok: true, message: "تم إرسال تقييمك للمراجعة. سيظهر بعد اعتماده من الإدارة." };
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
  revalidatePath("/me/cv/preview");
  revalidatePath("/me/cv/download");
  revalidatePath(`/cv/${user.id}`);
  revalidatePath(`/cv/${cv.id}`);
  return { ok: true, message: "تم حفظ السيرة الذاتية بنجاح" };
}

export async function applyToJobAction(_: unknown, form: FormData): Promise<any> {
  const user = await requireJobSeeker();
  const parsed = applicationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "تعذر إرسال الطلب" };
  
  const [job, seeker, cv] = await Promise.all([
    prisma.job.findUnique({
      where: { id: parsed.data.jobId },
      include: { company: true },
    }),
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
    const application = await prisma.application.create({
      data: { jobId: job.id, jobSeekerId: user.id, cvId: cv?.id, coverNote: parsed.data.coverNote, matchScore: match.score, appliedVia: "INTERNAL" },
    });
    await prisma.job.update({ where: { id: job.id }, data: { applicationCount: { increment: 1 } } });

    // Send confirmation email to Seeker
    try {
      await sendApplicationConfirmation({
        to: user.email,
        applicantName: cv?.fullName || user.fullName,
        jobTitle: job.title,
        companyName: job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص",
        city: job.city,
        jobType: job.jobType,
        salary: job.salaryText || (job.salaryMin || job.salaryMax ? `${job.salaryMin} - ${job.salaryMax}` : null),
        applicationId: application.id,
        appliedAt: application.createdAt,
      });
    } catch (err) {
      console.error("Failed to send seeker confirmation email:", err);
    }

    // Send notification to employer
    let employerEmail = job.contactEmail;
    if (!employerEmail && job.postedById) {
      const poster = await prisma.user.findUnique({ where: { id: job.postedById } });
      employerEmail = poster?.email || null;
    }

    if (employerEmail) {
      try {
        await sendNewApplicationAlert({
          to: employerEmail,
          jobTitle: job.title,
          applicantFirstName: (cv?.fullName || user.fullName).split(" ")[0],
          appliedAt: application.createdAt,
          reviewUrl: `${env.SITE_URL}/employer`,
        });
      } catch (err) {
        console.error("Failed to send employer alert email:", err);
      }
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
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/");
  if (job?.slug) {
    revalidatePath(`/jobs/${job.slug}`);
  }
}

export async function adminRejectJobAction(jobId: string) {
  await requireAdmin();
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: "REJECTED",
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath("/");
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
      await notifyJobSeekerPlanChange(record.userId, "PLUS", monthAhead);
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

  const claim = await prisma.companyClaim.findUnique({ where: { id } });
  if (!claim) redirect("/admin/claims");

  let adminNote: string | undefined;

  if (status === "APPROVED") {
    // 1) Mark the company as verified.
    await prisma.company.update({
      where: { id: claim.companyId },
      data: { verificationStatus: "VERIFIED" },
    });

    // 2) Link the claimant as the company's employer (only if the company has no other owner).
    if (claim.claimantId) {
      const currentOwner = await prisma.employerProfile.findUnique({ where: { companyId: claim.companyId } });
      if (!currentOwner || currentOwner.userId === claim.claimantId) {
        try {
          await prisma.employerProfile.upsert({
            where: { userId: claim.claimantId },
            create: { userId: claim.claimantId, companyId: claim.companyId, ownerName: claim.claimantName, phone: claim.phone },
            update: { companyId: claim.companyId },
          });
          await prisma.user.update({ where: { id: claim.claimantId }, data: { role: "EMPLOYER" } });
        } catch {
          adminNote = "تمت الموافقة وتوثيق الشركة، لكن تعذّر ربط حساب صاحب الطلب تلقائياً (قد يكون مرتبطاً بشركة أخرى).";
        }
      } else {
        adminNote = "تمت الموافقة وتوثيق الشركة، لكنها مرتبطة مسبقاً بحساب صاحب عمل آخر.";
      }
    }
  } else {
    adminNote = "تم رفض طلب ملكية الشركة.";
  }

  await prisma.companyClaim.update({
    where: { id },
    data: { status, reviewedAt: new Date(), ...(adminNote ? { adminNote } : {}) },
  });

  const company = await prisma.company.findUnique({ where: { id: claim.companyId }, select: { slug: true } });
  if (company?.slug) revalidatePath(`/companies/${company.slug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/claims");
}

const PURGE_CONFIRM_DEMO = "حذف-التجريبي";
const PURGE_CONFIRM_FULL = "إعادة-ضبط-المنصة";

function revalidateAfterPurge() {
  revalidatePath("/admin");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/companies");
  revalidatePath("/admin/job-seekers");
  revalidatePath("/admin/employers");
  revalidatePath("/admin/applications");
  revalidatePath("/");
  revalidatePath("/jobs");
}

/** حذف بيانات seed (@jojobs.local) + كل الوظائف والشركات والتقديمات */
export async function adminPurgeDemoDataAction(form: FormData) {
  await requireAdmin();
  if (str(form, "confirm") !== PURGE_CONFIRM_DEMO) {
    redirect("/admin/settings?error=confirm");
  }
  const { purgeDemoSeedData } = await import("@/lib/admin/purge-data");
  const stats = await purgeDemoSeedData();
  revalidateAfterPurge();
  redirect(
    `/admin/settings?purged=demo&users=${stats.deletedUsers}&jobs=${stats.jobs}&companies=${stats.companies}`
  );
}

/** إعادة ضبط كاملة: يبقي حسابات ADMIN_EMAILS فقط */
export async function adminResetPlatformAction(form: FormData) {
  await requireAdmin();
  if (str(form, "confirm") !== PURGE_CONFIRM_FULL) {
    redirect("/admin/settings?error=confirm");
  }
  const { resetPlatformKeepAdmins, getPreservedAdminEmails } = await import("@/lib/admin/purge-data");
  const stats = await resetPlatformKeepAdmins();
  revalidateAfterPurge();
  const kept = getPreservedAdminEmails().join(",");
  redirect(
    `/admin/settings?purged=full&users=${stats.deletedUsers}&jobs=${stats.jobs}&kept=${encodeURIComponent(kept)}`
  );
}

export async function requestPlusUpgradeAction() {
  const user = await requireJobSeeker();

  const seeker = await prisma.jobSeekerProfile.findUnique({
    where: { userId: user.id },
    select: { plan: true },
  });
  if (seeker?.plan === "PLUS") {
    return { ok: true, message: "أنت مشترك بالفعل في باقة Plus المميزة." };
  }

  // Idempotent: reuse an existing pending request instead of creating duplicates.
  const existing = await prisma.billingRecord.findFirst({
    where: { userId: user.id, type: "JOB_SEEKER_PLUS", status: "UNPAID" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    revalidatePath("/me/billing");
    return { ok: true, message: "لديك طلب ترقية قيد المراجعة بالفعل. أرسل إثبات الدفع وسيتم التفعيل فوراً." };
  }

  await prisma.billingRecord.create({
    data: {
      userId: user.id,
      type: "JOB_SEEKER_PLUS",
      amountJod: 2,
      status: "UNPAID",
      adminNote: "طلب ترقية إلى باقة Plus بانتظار تأكيد الدفع.",
    },
  });

  revalidatePath("/me");
  revalidatePath("/me/billing");
  revalidatePath("/me/cv");
  return { ok: true, message: "تم استلام طلب الترقية! أرسل إثبات الدفع للأدمن عبر واتساب وسيتم تفعيل باقتك فوراً." };
}

export async function adminToggleUserSuspensionAction(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: !user.isSuspended },
  });
  revalidatePath("/admin/employers");
  revalidatePath("/admin/job-seekers");
  revalidatePath("/admin");
}

export async function adminUpdateEmployerPlanAction(userId: string, plan: "FREE" | "BASIC" | "PRO" | "BUSINESS") {
  await requireAdmin();
  const monthAhead = new Date(Date.now() + 30 * 86400000);
  await prisma.employerProfile.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      planExpiresAt: plan === "FREE" ? null : monthAhead,
      ownerName: "صاحب عمل",
    },
    update: {
      plan,
      planExpiresAt: plan === "FREE" ? null : monthAhead,
    },
  });
  revalidatePath("/admin/employers");
  revalidatePath("/admin");
}

export async function adminUpdateJobSeekerPlanAction(userId: string, plan: "FREE" | "PLUS") {
  await requireAdmin();
  const monthAhead = new Date(Date.now() + 30 * 86400000);
  const planExpiresAt = plan === "FREE" ? null : monthAhead;
  await prisma.jobSeekerProfile.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      planExpiresAt,
      fullName: "باحث عن عمل",
    },
    update: {
      plan,
      planExpiresAt,
    },
  });
  await notifyJobSeekerPlanChange(userId, plan, planExpiresAt);
  revalidatePath("/admin/job-seekers");
  revalidatePath("/admin");
}
