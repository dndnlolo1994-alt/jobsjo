"use client";

import { ActionForm } from "@/components/forms/ActionMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { saveCurrentSearchAction } from "@/lib/actions/platform";

export function SaveSearchForm({ queryJson, defaultName }: { queryJson: string; defaultName: string }) {
  return (
    <ActionForm action={saveCurrentSearchAction} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
      {(state) => (
        <>
          <input type="hidden" name="queryJson" value={queryJson} />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input name="name" defaultValue={defaultName} className="input h-11 flex-1 text-sm" />
            <SubmitButton pendingText="جاري الحفظ..." className="btn-primary h-11 px-4 text-sm">
              احفظ هذا البحث
            </SubmitButton>
          </div>
          {state?.ok && (
            <a href="/me/saved-searches" className="mt-2 inline-block text-xs font-bold text-emerald-700 hover:underline">
              إدارة البحوث المحفوظة
            </a>
          )}
        </>
      )}
    </ActionForm>
  );
}
