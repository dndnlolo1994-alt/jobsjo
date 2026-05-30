
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  fullName: 'fullName',
  phone: 'phone',
  isActive: 'isActive',
  isSuspended: 'isSuspended',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt'
};

exports.Prisma.JobSeekerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fullName: 'fullName',
  phone: 'phone',
  whatsapp: 'whatsapp',
  email: 'email',
  city: 'city',
  area: 'area',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
  headline: 'headline',
  summary: 'summary',
  educationLevel: 'educationLevel',
  yearsOfExperience: 'yearsOfExperience',
  experienceLevel: 'experienceLevel',
  preferredJobTypes: 'preferredJobTypes',
  preferredCities: 'preferredCities',
  expectedSalaryMin: 'expectedSalaryMin',
  expectedSalaryMax: 'expectedSalaryMax',
  availableImmediately: 'availableImmediately',
  hasDrivingLicense: 'hasDrivingLicense',
  ownsCar: 'ownsCar',
  languages: 'languages',
  skills: 'skills',
  portfolioLinks: 'portfolioLinks',
  plan: 'plan',
  planExpiresAt: 'planExpiresAt',
  publicProfile: 'publicProfile',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CVProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fullName: 'fullName',
  jobTitle: 'jobTitle',
  summary: 'summary',
  email: 'email',
  phone: 'phone',
  city: 'city',
  country: 'country',
  website: 'website',
  linkedin: 'linkedin',
  photo: 'photo',
  language: 'language',
  template: 'template',
  englishVersion: 'englishVersion',
  paymentStatus: 'paymentStatus',
  paidAt: 'paidAt',
  lastExportedAt: 'lastExportedAt',
  qrEnabled: 'qrEnabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CVExperienceScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  position: 'position',
  company: 'company',
  city: 'city',
  startDate: 'startDate',
  endDate: 'endDate',
  description: 'description',
  order: 'order'
};

exports.Prisma.CVEducationScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  degree: 'degree',
  institution: 'institution',
  city: 'city',
  startDate: 'startDate',
  endDate: 'endDate',
  description: 'description',
  order: 'order'
};

exports.Prisma.CVSkillScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  level: 'level',
  order: 'order'
};

exports.Prisma.CVCertificationScalarFieldEnum = {
  id: 'id',
  cvId: 'cvId',
  name: 'name',
  issuer: 'issuer',
  year: 'year',
  order: 'order'
};

exports.Prisma.EmployerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  companyId: 'companyId',
  ownerName: 'ownerName',
  phone: 'phone',
  whatsapp: 'whatsapp',
  plan: 'plan',
  planExpiresAt: 'planExpiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  name: 'name',
  description: 'description',
  city: 'city',
  area: 'area',
  industry: 'industry',
  companySize: 'companySize',
  logoUrl: 'logoUrl',
  website: 'website',
  facebookUrl: 'facebookUrl',
  phone: 'phone',
  whatsapp: 'whatsapp',
  email: 'email',
  verificationStatus: 'verificationStatus',
  isCurated: 'isCurated',
  publishedAt: 'publishedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JobScalarFieldEnum = {
  id: 'id',
  slug: 'slug',
  title: 'title',
  companyId: 'companyId',
  companyNameText: 'companyNameText',
  companyRelation: 'companyRelation',
  city: 'city',
  area: 'area',
  jobCategory: 'jobCategory',
  jobType: 'jobType',
  salaryMin: 'salaryMin',
  salaryMax: 'salaryMax',
  salaryText: 'salaryText',
  currency: 'currency',
  description: 'description',
  responsibilities: 'responsibilities',
  requirements: 'requirements',
  benefits: 'benefits',
  experienceLevel: 'experienceLevel',
  educationLevel: 'educationLevel',
  skills: 'skills',
  womenFriendly: 'womenFriendly',
  noExperienceRequired: 'noExperienceRequired',
  requiresDrivingLicense: 'requiresDrivingLicense',
  contactMethod: 'contactMethod',
  contactWhatsapp: 'contactWhatsapp',
  contactEmail: 'contactEmail',
  externalUrl: 'externalUrl',
  sourceType: 'sourceType',
  sourceName: 'sourceName',
  sourceUrl: 'sourceUrl',
  source: 'source',
  isVerified: 'isVerified',
  sourceVerifiedAt: 'sourceVerifiedAt',
  curatedByAdminId: 'curatedByAdminId',
  originalPostedAt: 'originalPostedAt',
  sourceTrustLevel: 'sourceTrustLevel',
  removalRequested: 'removalRequested',
  jobSourceId: 'jobSourceId',
  status: 'status',
  featured: 'featured',
  urgent: 'urgent',
  pinnedUntil: 'pinnedUntil',
  publishedAt: 'publishedAt',
  expiresAt: 'expiresAt',
  applicationCount: 'applicationCount',
  viewCount: 'viewCount',
  postedById: 'postedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ApplicationScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  jobSeekerId: 'jobSeekerId',
  cvId: 'cvId',
  coverNote: 'coverNote',
  status: 'status',
  appliedVia: 'appliedVia',
  applicantConfirmationSentAt: 'applicantConfirmationSentAt',
  employerNotificationSentAt: 'employerNotificationSentAt',
  statusNotificationSentAt: 'statusNotificationSentAt',
  employerNotificationTo: 'employerNotificationTo',
  notificationError: 'notificationError',
  matchScore: 'matchScore',
  employerNotes: 'employerNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SavedJobScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  userId: 'userId',
  createdAt: 'createdAt'
};

exports.Prisma.SavedSearchScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  queryJson: 'queryJson',
  lastSentAt: 'lastSentAt',
  isActive: 'isActive',
  createdAt: 'createdAt'
};

exports.Prisma.JobAlertDeliveryScalarFieldEnum = {
  id: 'id',
  savedSearchId: 'savedSearchId',
  jobId: 'jobId',
  sentAt: 'sentAt'
};

exports.Prisma.BillingRecordScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  employerId: 'employerId',
  type: 'type',
  amountJod: 'amountJod',
  status: 'status',
  paymentMethod: 'paymentMethod',
  adminNote: 'adminNote',
  referenceCode: 'referenceCode',
  referenceText: 'referenceText',
  periodStart: 'periodStart',
  periodEnd: 'periodEnd',
  relatedJobId: 'relatedJobId',
  jobId: 'jobId',
  relatedCvId: 'relatedCvId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paidAt: 'paidAt'
};

exports.Prisma.CompanyClaimScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  claimantId: 'claimantId',
  claimantName: 'claimantName',
  phone: 'phone',
  email: 'email',
  companyRole: 'companyRole',
  proofText: 'proofText',
  proofUrl: 'proofUrl',
  websiteOrSocialUrl: 'websiteOrSocialUrl',
  status: 'status',
  adminNote: 'adminNote',
  reviewedAt: 'reviewedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyReviewScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  userId: 'userId',
  rating: 'rating',
  title: 'title',
  comment: 'comment',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.JobSourceScalarFieldEnum = {
  id: 'id',
  sourceName: 'sourceName',
  sourceType: 'sourceType',
  sourceUrl: 'sourceUrl',
  organizationName: 'organizationName',
  trustLevel: 'trustLevel',
  notes: 'notes',
  active: 'active',
  lastCheckedAt: 'lastCheckedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ReportedJobScalarFieldEnum = {
  id: 'id',
  jobId: 'jobId',
  userId: 'userId',
  reason: 'reason',
  details: 'details',
  resolved: 'resolved',
  createdAt: 'createdAt'
};

exports.Prisma.PageViewScalarFieldEnum = {
  id: 'id',
  path: 'path',
  ts: 'ts',
  userId: 'userId'
};

exports.Prisma.PlatformSettingScalarFieldEnum = {
  key: 'key',
  value: 'value',
  updatedAt: 'updatedAt'
};

exports.Prisma.OtpVerificationScalarFieldEnum = {
  id: 'id',
  email: 'email',
  code: 'code',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  ADMIN: 'ADMIN',
  JOB_SEEKER: 'JOB_SEEKER',
  EMPLOYER: 'EMPLOYER'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  UNSPECIFIED: 'UNSPECIFIED'
};

exports.EducationLevel = exports.$Enums.EducationLevel = {
  NONE: 'NONE',
  SCHOOL: 'SCHOOL',
  HIGH_SCHOOL: 'HIGH_SCHOOL',
  DIPLOMA: 'DIPLOMA',
  BACHELOR: 'BACHELOR',
  MASTER: 'MASTER',
  PHD: 'PHD'
};

exports.ExperienceLevel = exports.$Enums.ExperienceLevel = {
  NO_EXPERIENCE: 'NO_EXPERIENCE',
  ENTRY: 'ENTRY',
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  MANAGER: 'MANAGER'
};

exports.JobSeekerPlan = exports.$Enums.JobSeekerPlan = {
  FREE: 'FREE',
  PLUS: 'PLUS'
};

exports.CVPaymentStatus = exports.$Enums.CVPaymentStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  WAIVED: 'WAIVED'
};

exports.EmployerPlan = exports.$Enums.EmployerPlan = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PRO: 'PRO',
  BUSINESS: 'BUSINESS'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  UNVERIFIED: 'UNVERIFIED',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

exports.CompanyRelation = exports.$Enums.CompanyRelation = {
  DIRECT_EMPLOYER: 'DIRECT_EMPLOYER',
  CURATED_EXTERNAL: 'CURATED_EXTERNAL',
  UNKNOWN: 'UNKNOWN'
};

exports.JobType = exports.$Enums.JobType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  SHIFT: 'SHIFT',
  TEMPORARY: 'TEMPORARY',
  INTERNSHIP: 'INTERNSHIP',
  REMOTE: 'REMOTE',
  HYBRID: 'HYBRID'
};

exports.ContactMethod = exports.$Enums.ContactMethod = {
  INTERNAL_APPLY: 'INTERNAL_APPLY',
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
  EXTERNAL_LINK: 'EXTERNAL_LINK'
};

exports.JobSourceType = exports.$Enums.JobSourceType = {
  EMPLOYER_DIRECT: 'EMPLOYER_DIRECT',
  ADMIN_MANUAL: 'ADMIN_MANUAL',
  COMPANY_CAREERS_PAGE: 'COMPANY_CAREERS_PAGE',
  PUBLIC_GOVERNMENT_SOURCE: 'PUBLIC_GOVERNMENT_SOURCE',
  PUBLIC_NGO_SOURCE: 'PUBLIC_NGO_SOURCE',
  PUBLIC_TRAINING_PROGRAM: 'PUBLIC_TRAINING_PROGRAM',
  PUBLIC_SOCIAL_POST_MANUAL: 'PUBLIC_SOCIAL_POST_MANUAL',
  REFERRAL: 'REFERRAL',
  OTHER: 'OTHER'
};

exports.SourceTrustLevel = exports.$Enums.SourceTrustLevel = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW'
};

exports.JobStatus = exports.$Enums.JobStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  PUBLISHED: 'PUBLISHED',
  EXPIRED: 'EXPIRED',
  REJECTED: 'REJECTED'
};

exports.ApplicationStatus = exports.$Enums.ApplicationStatus = {
  SUBMITTED: 'SUBMITTED',
  VIEWED: 'VIEWED',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  REJECTED: 'REJECTED',
  HIRED: 'HIRED',
  WITHDRAWN: 'WITHDRAWN'
};

exports.AppliedVia = exports.$Enums.AppliedVia = {
  INTERNAL: 'INTERNAL',
  WHATSAPP: 'WHATSAPP',
  EMAIL: 'EMAIL',
  EXTERNAL: 'EXTERNAL'
};

exports.BillingType = exports.$Enums.BillingType = {
  CV_PDF: 'CV_PDF',
  JOB_SEEKER_PLUS: 'JOB_SEEKER_PLUS',
  JOB_POST_STANDARD: 'JOB_POST_STANDARD',
  JOB_POST_FEATURED: 'JOB_POST_FEATURED',
  JOB_POST_URGENT: 'JOB_POST_URGENT',
  EMPLOYER_BASIC: 'EMPLOYER_BASIC',
  EMPLOYER_PRO: 'EMPLOYER_PRO',
  EMPLOYER_BUSINESS: 'EMPLOYER_BUSINESS',
  SHORTLISTING_SERVICE: 'SHORTLISTING_SERVICE'
};

exports.BillingStatus = exports.$Enums.BillingStatus = {
  UNPAID: 'UNPAID',
  PAID: 'PAID',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  WAIVED: 'WAIVED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  CASH: 'CASH',
  CLIQ: 'CLIQ',
  BANK_TRANSFER: 'BANK_TRANSFER',
  WALLET: 'WALLET',
  OTHER: 'OTHER'
};

exports.ClaimStatus = exports.$Enums.ClaimStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.Prisma.ModelName = {
  User: 'User',
  JobSeekerProfile: 'JobSeekerProfile',
  CVProfile: 'CVProfile',
  CVExperience: 'CVExperience',
  CVEducation: 'CVEducation',
  CVSkill: 'CVSkill',
  CVCertification: 'CVCertification',
  EmployerProfile: 'EmployerProfile',
  Company: 'Company',
  Job: 'Job',
  Application: 'Application',
  SavedJob: 'SavedJob',
  SavedSearch: 'SavedSearch',
  JobAlertDelivery: 'JobAlertDelivery',
  BillingRecord: 'BillingRecord',
  CompanyClaim: 'CompanyClaim',
  CompanyReview: 'CompanyReview',
  JobSource: 'JobSource',
  ReportedJob: 'ReportedJob',
  PageView: 'PageView',
  PlatformSetting: 'PlatformSetting',
  OtpVerification: 'OtpVerification'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
