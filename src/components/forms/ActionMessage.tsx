"use client";

import { useActionState } from "react";

type State = { ok?: boolean; message?: string } | null;

export function ActionForm({
  action,
  children,
  className,
}: {
  action: (state: State, formData: FormData) => Promise<State>;
  children: (state: State, pending: boolean) => React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={className}>
      {children(state, pending)}
      {state?.message && (
        <div className={`mt-3 rounded-xl border p-3 text-sm ${state.ok ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-700"}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}
