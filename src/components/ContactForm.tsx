"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendContactMessage, type ContactState } from "@/lib/actions/contact";
import { SubmitButton } from "./forms/SubmitButton";

const initialState: ContactState = {
  success: false,
};

export function ContactForm() {
  const [state, formAction] = useActionState(sendContactMessage, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state?.success]);

  return (
    <div className="card card-pad shadow-lg border border-gray-100 dark:border-gray-800">
      <h3 className="text-xl font-bold mb-6 text-[var(--color-text-title)] border-b pb-4 border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <span>✉️</span> أرسل لنا رسالة مباشرة
      </h3>

      <form ref={formRef} action={formAction} className="space-y-5">
        {state?.errors?.form && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
            {state.errors.form}
          </div>
        )}

        {state?.success && state?.message && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 p-4 rounded-xl text-sm font-medium">
            {state.message}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
            الاسم الكامل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="input w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="مثال: أحمد محمد"
          />
          {state?.errors?.name && (
            <p className="mt-1 text-xs text-red-500">{state.errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
            البريد الإلكتروني <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="input w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            placeholder="name@example.com"
          />
          {state?.errors?.email && (
            <p className="mt-1 text-xs text-red-500">{state.errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
            موضوع الرسالة <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            name="subject"
            required
            defaultValue=""
            className="input w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
          >
            <option value="" disabled>اختر موضوع الرسالة...</option>
            <option value="استفسار عام">استفسار عام</option>
            <option value="دعم فني">دعم فني</option>
            <option value="الإبلاغ عن وظيفة مشبوهة">الإبلاغ عن وظيفة مشبوهة</option>
            <option value="طلب إزالة إعلان">طلب إزالة إعلان وظيفة</option>
            <option value="اقتراح أو شكوى">اقتراح أو شكوى</option>
          </select>
          {state?.errors?.subject && (
            <p className="mt-1 text-xs text-red-500">{state.errors.subject}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
            تفاصيل الرسالة <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="input w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-y"
            placeholder="اكتب تفاصيل استفسارك أو بلاغك هنا..."
          />
          {state?.errors?.message && (
            <p className="mt-1 text-xs text-red-500">{state.errors.message}</p>
          )}
        </div>

        <div className="pt-2">
          <SubmitButton pendingText="جاري الإرسال..." className="btn-primary w-full py-3 text-base font-medium flex items-center justify-center gap-2">
            <span>✉️</span> إرسال الرسالة
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
