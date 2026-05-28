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
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      fullName: data.fullName,
      phone: data.phone,
      role,
      passwordHash: await hashPassword(data.password),
      ...(role === "JOB_SEEKER" ? { jobSeekerProfile: { create: { fullName: data.fullName, phone: data.phone, email: data.email.toLowerCase() } } } : {}),
      ...(role === "EMPLOYER" ? { employerProfile: { create: { ownerName: data.fullName, phone: data.phone } } } : {}),
    },
  });
  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();
  redirect(role === "EMPLOYER" ? "/employer" : role === "ADMIN" ? "/admin" : "/me");
}

export async function loginAction(_: unknown, form: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "بيانات الدخول غير صحيحة" };
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user || user.isSuspended || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const session = await getSession();
  session.user = { id: user.id, email: user.email, role: user.role, fullName: user.fullName };
  session.createdAt = Date.now();
  await (session as any).save();
  redirect(user.role === "EMPLOYER" ? "/employer" : user.role === "ADMIN" ? "/admin" : "/me");
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

export async function applyToJobAction(_: unknown, form: FormData) {
  const user = await requireJobSeeker();
  const parsed = applicationSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "تعذر إرسال الطلب" };
  
  const [job, seeker, cv] = await Promise.all([
    prisma.job.findUnique({ where: { id: parsed.data.jobId } }),
    prisma.jobSeekerProfile.findUnique({ where: { userId: user.id } }),
    prisma.cVProfile.findUnique({ where: { userId: user.id } }),
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
      const cvLink = `https://jojobs.jo/cv/${user.id}`;
      await notifier.send({
        to: employerEmail,
        subject: `طلب تقديم جديد لوظيفة: ${job.title}`,
        text: `مرحبا،\n\nلقد تقدم مرشح جديد لوظيفة "${job.title}".\n\nتفاصيل المتقدم:\nالاسم: ${cv?.fullName || user.fullName}\nالبريد الإلكتروني: ${cv?.email || user.email}\nالهاتف: ${cv?.phone || ""}\nنسبة المطابقة للوظيفة: ${match.score}%\n\nرسالة التقديم (Cover Letter):\n${parsed.data.coverNote || "لا توجد رسالة مرفقة"}\n\nعرض السيرة الذاتية للمتقدم:\n${cvLink}\n\nنتمنى لك التوفيق في التوظيف.\nفريق جوبز الأردن`,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; color: #1e293b;">
            <h2 style="color: #059669; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">طلب تقديم جديد لوظيفة: ${job.title}</h2>
            <p>مرحباً،</p>
            <p>لقد تقدم مرشح جديد لوظيفة <strong>"${job.title}"</strong> عبر منصة جوبز الأردن.</p>
            
            <h3 style="color: #0f172a; margin-top: 20px;">تفاصيل المتقدم:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">الاسم الكامل:</td>
                <td style="padding: 8px 0;">${cv?.fullName || user.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">البريد الإلكتروني:</td>
                <td style="padding: 8px 0;">${cv?.email || user.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">الهاتف:</td>
                <td style="padding: 8px 0;">${cv?.phone || ""}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">نسبة المطابقة:</td>
                <td style="padding: 8px 0;"><span style="background-color: #ecfdf5; color: #065f46; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${match.score}%</span></td>
              </tr>
            </table>

            <h3 style="color: #0f172a; margin-top: 20px;">رسالة التقديم (Cover Letter):</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-style: italic; font-size: 13px;">
              ${parsed.data.coverNote ? parsed.data.coverNote.replace(/\n/g, "<br>") : "لا توجد رسالة مرفقة"}
            </div>

            <p style="margin-top: 30px; text-align: center;">
              <a href="${cvLink}" style="background-color: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">عرض السيرة الذاتية الكاملة</a>
            </p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 40px; margin-bottom: 20px;" />
            <p style="font-size: 11px; color: #64748b; text-align: center;">هذا الإشعار مرسل تلقائياً من نظام جوبز الأردن لإدارة التوظيف.</p>
          </div>
        `
      });
    }
  } catch (err) {
    console.error("Apply to job error:", err);
    return { ok: false, message: "لقد تقدمت لهذه الوظيفة سابقاً" };
  }

  revalidatePath("/me/applications");
  return { ok: true, message: "تم إرسال طلبك بنجاح" };
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

export async function createClaimAction(_: unknown, form: FormData) {
  const parsed = companyClaimSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, message: "تحقق من بيانات المطالبة" };
  const user = await requireUser().catch(() => null);
  await prisma.companyClaim.create({
    data: { ...parsed.data, claimantId: user?.id, proofUrl: parsed.data.proofUrl || undefined, websiteOrSocialUrl: str(form, "websiteOrSocialUrl") },
  });
  return { ok: true, message: "تم استلام طلب المطالبة وسيتم مراجعته" };
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

export async function adminUpdatePaymentAction(id: string, status: "PAID" | "WAIVED" | "UNPAID") {
  await requireAdmin();
  await prisma.billingRecord.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : undefined },
  });
  revalidatePath("/admin/payments");
}

export async function adminUpdateApplicationStatus(id: string, status: string) {
  await requireEmployer();
  await prisma.application.update({ where: { id }, data: { status: status as never } });
  revalidatePath("/employer");
}

export async function adminCreateSourceAction(_: unknown, form: FormData) {
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
  return { ok: true, message: "تم حفظ المصدر" };
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
}
