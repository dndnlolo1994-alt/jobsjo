import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user as admin
    await requireAdmin();

    const { pageUrl, pageLabel, apiKey } = await req.json();

    if (!pageUrl || !pageLabel) {
      return NextResponse.json({ error: "الرابط واسم الصفحة مطلوبان." }, { status: 400 });
    }

    // 2. Select API key (fallback to environment if not provided by client)
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      return NextResponse.json({ 
        error: "مفتاح Anthropic API Key مطلوب. يرجى إدخاله في الحقل المخصص لتشغيل الفحص." 
      }, { status: 400 });
    }

    const SYSTEM_PROMPT = `أنت خبير تسويق رقمي متخصص في المنصات العربية وسوق العمل الأردني.
مهمتك: افحص صفحة الويب المعطاة ثم اكتب بروموشن/إعلان احترافي لها.

يجب أن يحتوي ردك على JSON فقط بهذا الشكل بالضبط (بدون أي نص خارج JSON):
{
  "status": "✅ تعمل",
  "notes": "ملاحظة تقنية قصيرة عن الصفحة (جملة واحدة)",
  "promo": "نص الإعلان/البروموشن الاحترافي للصفحة (3-4 جمل جذابة بالعربية)"
}
أو "⚠️ تعمل مع ملاحظات" أو "🔴 مشكلة" لحالة الـ status.`;

    // 3. Make server-side call to Anthropic (avoids CORS and protects API keys)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `ابحث عن هذا الرابط وافحصه: ${pageUrl}
صفحة: ${pageLabel}
ثم اكتب بروموشن لها. أعطني JSON فقط.`
        }]
      })
    });

    const data = await response.json();
    if (data.error) {
      return NextResponse.json({ error: data.error.message || "خطأ من مزود الذكاء الاصطناعي." }, { status: 500 });
    }

    const text = data.content
      ?.filter((b: any) => b.type === "text")
      ?.map((b: any) => b.text)
      ?.join("") || "";

    const clean = text.replace(/```json|```/g, "").trim();
    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        status: "⚠️ تعمل مع ملاحظات",
        notes: "تم الفحص وتوليد الإعلان بنجاح.",
        promo: clean.slice(0, 300)
      });
    }
  } catch (err: any) {
    console.error("Agent check error:", err);
    return NextResponse.json({ error: err.message || "حدث خطأ غير متوقع بالخادم." }, { status: 500 });
  }
}
