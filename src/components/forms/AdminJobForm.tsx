import { adminCreateJobAction, employerCreateJobAction } from "@/lib/actions/platform";
import { getCurrentUserFull } from "@/lib/auth";
import { JOB_CATEGORIES, JORDAN_CITIES, JOB_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL, EDUCATION_LEVEL_LABEL, SOURCE_TYPE_LABEL } from "@/lib/utils";

export async function AdminJobForm() {
  const user = await getCurrentUserFull();
  const isAdmin = user?.role === "ADMIN";
  const defaultCompanyName = user?.employerProfile?.company?.name || "";

  async function createJob(formData: FormData) {
    "use server";
    if (isAdmin) {
      await adminCreateJobAction(null, formData);
    } else {
      await employerCreateJobAction(null, formData);
    }
  }

  return (
    <form action={createJob} className="card-pad grid md:grid-cols-2 gap-4">
      <Field name="title" label="عنوان الوظيفة" required />
      <Field name="companyNameText" label="اسم الشركة" defaultValue={defaultCompanyName} required={!isAdmin} />
      
      {isAdmin && (
        <Select name="companyRelation" label="علاقة الشركة" options={[["DIRECT_EMPLOYER", "صاحب عمل مباشر"], ["CURATED_EXTERNAL", "منسّقة من مصدر خارجي"], ["UNKNOWN", "غير معروف"]]} />
      )}
      
      <Select name="city" label="المدينة" options={JORDAN_CITIES.map((c) => [c, c])} />
      <Field name="area" label="المنطقة" />
      <Select name="jobCategory" label="التصنيف" options={JOB_CATEGORIES.map((c) => [c, c])} />
      <Select name="jobType" label="نوع الدوام" options={Object.entries(JOB_TYPE_LABEL)} />
      <Field name="salaryMin" label="أقل راتب" type="number" />
      <Field name="salaryMax" label="أعلى راتب" type="number" />
      <Field name="salaryText" label="نص الراتب" />
      <Select name="experienceLevel" label="الخبرة" options={Object.entries(EXPERIENCE_LEVEL_LABEL)} />
      <Select name="educationLevel" label="التعليم" options={Object.entries(EDUCATION_LEVEL_LABEL)} />
      <Text name="description" label="الوصف" required />
      <Text name="responsibilities" label="المسؤوليات" />
      <Text name="requirements" label="المتطلبات" required />
      <Text name="benefits" label="المزايا" />
      <Field name="skills" label="المهارات (افصل بفواصل)" />
      
      <Select name="contactMethod" label="طريقة التقديم" options={[["INTERNAL_APPLY", "داخل المنصة"], ["WHATSAPP", "واتساب"], ["EMAIL", "بريد إلكتروني"], ["EXTERNAL_LINK", "رابط خارجي"]]} />
      <Field name="contactWhatsapp" label="رقم واتساب" />
      <Field name="contactEmail" label="بريد التقديم" type="email" required />
      <Field name="externalUrl" label="رابط خارجي" />
      
      {isAdmin && (
        <>
          <Select name="sourceType" label="نوع المصدر" options={Object.entries(SOURCE_TYPE_LABEL)} />
          <Field name="sourceName" label="اسم المصدر" />
          <Field name="sourceUrl" label="رابط المصدر" />
          <Select name="sourceTrustLevel" label="ثقة المصدر" options={[["HIGH", "عالية"], ["MEDIUM", "متوسطة"], ["LOW", "منخفضة"]]} />
          <Field name="originalPostedAt" label="تاريخ النشر الأصلي" type="date" />
          <Field name="expiresAt" label="تاريخ الانتهاء" type="date" />
          <Select name="status" label="الحالة" options={[["DRAFT", "مسودة"], ["PENDING_REVIEW", "بانتظار المراجعة"], ["PUBLISHED", "منشورة"], ["EXPIRED", "منتهية"], ["REJECTED", "مرفوضة"]]} />
        </>
      )}
      
      <div className="md:col-span-2 flex flex-wrap gap-4 text-sm">
        {isAdmin && (
          <>
            <label><input type="checkbox" name="featured" /> مميزة</label>
            <label><input type="checkbox" name="urgent" /> عاجلة</label>
            <label><input type="checkbox" name="pinned" /> مثبتة</label>
          </>
        )}
        <label><input type="checkbox" name="womenFriendly" /> مناسبة للسيدات</label>
        <label><input type="checkbox" name="noExperienceRequired" /> بدون خبرة</label>
        <label><input type="checkbox" name="requiresDrivingLicense" /> تتطلب رخصة</label>
      </div>
      <button className="btn-primary md:col-span-2">حفظ الوظيفة</button>
    </form>
  );
}

function Field({ name, label, type = "text", required, defaultValue }: { name: string; label: string; type?: string; required?: boolean; defaultValue?: string }) { return <div><label className="label">{label}</label><input className="input" name={name} type={type} required={required} defaultValue={defaultValue} /></div>; }
function Text({ name, label, required }: { name: string; label: string; required?: boolean }) { return <div className="md:col-span-2"><label className="label">{label}</label><textarea className="input min-h-28" name={name} required={required} /></div>; }
function Select({ name, label, options }: { name: string; label: string; options: string[][] }) { return <div><label className="label">{label}</label><select className="input" name={name}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>; }

