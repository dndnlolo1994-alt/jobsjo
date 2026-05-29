"use server";

import { getNotifier } from "@/lib/notifications";
import { env } from "@/lib/env";
import { z } from "zod";

export interface ContactState {
  success: boolean;
  errors?: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    form?: string;
  };
  message?: string;
}

const contactSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون أكثر من حرفين"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  subject: z.string().min(3, "يرجى تحديد موضوع الرسالة"),
  message: z.string().min(10, "الرسالة يجب أن لا تقل عن 10 أحرف"),
});

export async function sendContactMessage(prevState: ContactState, formData: FormData): Promise<ContactState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  const result = contactSchema.safeParse({ name, email, subject, message });

  if (!result.success) {
    const errorMap = result.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        name: errorMap.name?.[0],
        email: errorMap.email?.[0],
        subject: errorMap.subject?.[0],
        message: errorMap.message?.[0],
      },
    };
  }

  try {
    const notifier = getNotifier();
    await notifier.send({
      to: env.CONTACT_TO_EMAIL,
      subject: `✉️ رسالة اتصال جديدة: ${subject}`,
      html: `
        <div style="direction: rtl; font-family: sans-serif; padding: 20px; line-height: 1.6;">
          <h2 style="color: #1B4FDB; border-bottom: 2px solid #eee; padding-bottom: 10px;">رسالة اتصال جديدة من منصة جوبز الأردن</h2>
          <p><strong>الاسم:</strong> ${name}</p>
          <p><strong>البريد الإلكتروني:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>الموضوع:</strong> ${subject}</p>
          <div style="background-color: #f7f8fc; border-right: 4px solid #1B4FDB; padding: 15px; margin-top: 20px; border-radius: 4px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 12px; color: #777;">تم إرسال هذه الرسالة تلقائياً عبر نموذج الاتصال في منصة جوبز الأردن.</p>
        </div>
      `,
      text: `رسالة جديدة من: ${name}\nبريد إلكتروني: ${email}\nالموضوع: ${subject}\nالرسالة:\n${message}`,
    });

    return {
      success: true,
      message: "تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت ممكن.",
    };
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return {
      success: false,
      errors: {
        form: "حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً أو الاتصال بنا عبر واتساب مباشرة.",
      },
    };
  }
}
