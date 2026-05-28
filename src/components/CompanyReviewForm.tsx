"use client";

import { ActionForm } from "@/components/forms/ActionMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { createCompanyReviewAction } from "@/lib/actions/platform";

export function CompanyReviewForm({ companyId }: { companyId: string }) {
  return (
    <ActionForm action={createCompanyReviewAction} className="space-y-3">
      {() => (
        <>
          <input type="hidden" name="companyId" value={companyId} />
          <div>
            <label className="label">التقييم</label>
            <select name="rating" className="input" defaultValue="5" required>
              <option value="5">5 - ممتاز</option>
              <option value="4">4 - جيد جداً</option>
              <option value="3">3 - جيد</option>
              <option value="2">2 - مقبول</option>
              <option value="1">1 - ضعيف</option>
            </select>
          </div>
          <input className="input" name="title" placeholder="عنوان مختصر للتقييم" required />
          <textarea className="input min-h-28" name="comment" placeholder="اكتب تجربتك أو ملاحظتك عن الشركة" required />
          <SubmitButton className="btn-primary w-full" pendingText="جاري إرسال التقييم...">
            إرسال التقييم للمراجعة
          </SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
