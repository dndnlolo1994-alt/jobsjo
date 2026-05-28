import { z } from "zod";
import { normalizeJordanPhone } from "./phone";

const jordanPhoneSchema = z
  .string()
  .min(1, "الرجاء إدخال رقم الهاتف")
  .transform((v) => normalizeJordanPhone(v) ?? "")
  .refine((v) => v.length > 0, "رقم هاتف أردني غير صحيح");

const optionalJordanPhoneSchema = z
  .string()
  .optional()
  .transform((v) => (v ? normalizeJordanPhone(v) ?? null : null));

const tolerantUrlSchema = z
  .string()
  .optional()
  .or(z.literal(""))
  .transform((v) => {
    if (!v) return "";
    let val = v.trim();
    if (!/^https?:\/\//i.test(val)) {
      val = "https://" + val;
    }
    return val;
  })
  .refine((v) => {
    if (v === "") return true;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }, "رابط غير صحيح");

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "الاسم قصير جداً"),
    email: z.string().email("بريد إلكتروني غير صحيح"),
    password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف فأكثر"),
    confirmPassword: z.string(),
    role: z.enum(["JOB_SEEKER", "EMPLOYER"]),
    phone: jordanPhoneSchema,
    acceptTerms: z.literal("on", { errorMap: () => ({ message: "يجب الموافقة على الشروط" }) }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "كلمة المرور غير متطابقة",
  });

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export const jobSeekerProfileSchema = z.object({
  fullName: z.string().min(2),
  phone: jordanPhoneSchema,
  whatsapp: optionalJordanPhoneSchema,
  city: z.string().optional(),
  area: z.string().optional(),
  headline: z.string().max(160).optional(),
  summary: z.string().max(2000).optional(),
  educationLevel: z.enum([
    "NONE", "SCHOOL", "HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD",
  ]).default("NONE"),
  yearsOfExperience: z.coerce.number().int().min(0).max(60).default(0),
  experienceLevel: z.enum([
    "NO_EXPERIENCE", "ENTRY", "JUNIOR", "MID", "SENIOR", "MANAGER",
  ]).default("NO_EXPERIENCE"),
  preferredJobTypes: z.string().optional(), // CSV
  preferredCities: z.string().optional(),
  expectedSalaryMin: z.coerce.number().int().min(0).optional(),
  expectedSalaryMax: z.coerce.number().int().min(0).optional(),
  availableImmediately: z.coerce.boolean().optional().default(true),
  hasDrivingLicense: z.coerce.boolean().optional().default(false),
  ownsCar: z.coerce.boolean().optional().default(false),
  languages: z.string().optional(),
  skills: z.string().optional(),
});

export const jobCreateSchema = z.object({
  title: z.string().min(4, "عنوان قصير جداً"),
  city: z.string().min(2),
  area: z.string().optional(),
  jobCategory: z.string().min(2),
  jobType: z.enum([
    "FULL_TIME", "PART_TIME", "SHIFT", "TEMPORARY", "INTERNSHIP", "REMOTE", "HYBRID",
  ]),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  salaryText: z.string().optional(),
  description: z.string().min(20, "الوصف قصير جداً"),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  experienceLevel: z.enum([
    "NO_EXPERIENCE", "ENTRY", "JUNIOR", "MID", "SENIOR", "MANAGER",
  ]).default("NO_EXPERIENCE"),
  educationLevel: z.enum([
    "NONE", "SCHOOL", "HIGH_SCHOOL", "DIPLOMA", "BACHELOR", "MASTER", "PHD",
  ]).default("NONE"),
  skills: z.string().optional(),
  womenFriendly: z.coerce.boolean().optional().default(false),
  noExperienceRequired: z.coerce.boolean().optional().default(false),
  requiresDrivingLicense: z.coerce.boolean().optional().default(false),
  contactMethod: z.enum(["INTERNAL_APPLY", "WHATSAPP", "EMAIL", "EXTERNAL_LINK"]).default("INTERNAL_APPLY"),
  contactWhatsapp: optionalJordanPhoneSchema,
  contactEmail: z.string().email().optional().or(z.literal("")),
  externalUrl: tolerantUrlSchema,
  expiresInDays: z.coerce.number().int().min(1).max(120).default(30),
});

export const applicationSchema = z.object({
  jobId: z.string().min(1),
  coverNote: z.string().max(2000).optional(),
});

export const companyClaimSchema = z.object({
  companyId: z.string().min(1),
  claimantName: z.string().min(2),
  phone: jordanPhoneSchema,
  email: z.string().email(),
  companyRole: z.string().min(2),
  proofText: z.string().max(2000).optional(),
  proofUrl: tolerantUrlSchema,
});

export const cvSchema = z.object({
  fullName: z.string().min(2),
  jobTitle: z.string().optional(),
  summary: z.string().max(2000).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: optionalJordanPhoneSchema,
  city: z.string().optional(),
  website: tolerantUrlSchema,
  linkedin: tolerantUrlSchema,
  photo: z.string().optional(),
  template: z.string().optional().default("modern-emerald"),
  experiencesJson: z.string().optional(),
  educationsJson: z.string().optional(),
  skillsJson: z.string().optional(),
  certificationsJson: z.string().optional(),
  englishVersion: z.string().optional(),
});

export const employerSetupSchema = z.object({
  companyName: z.string().min(2),
  ownerName: z.string().min(2),
  phone: jordanPhoneSchema,
  whatsapp: optionalJordanPhoneSchema,
  city: z.string().min(2),
  area: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  description: z.string().max(2000).optional(),
  website: z.string().url().optional().or(z.literal("")),
  facebookUrl: z.string().url().optional().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type JobCreateInput = z.infer<typeof jobCreateSchema>;
export type JobSeekerProfileInput = z.infer<typeof jobSeekerProfileSchema>;
export type CompanyClaimInput = z.infer<typeof companyClaimSchema>;
export type CVInput = z.infer<typeof cvSchema>;
export type EmployerSetupInput = z.infer<typeof employerSetupSchema>;
