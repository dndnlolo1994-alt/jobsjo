import Link from "next/link";
import { env } from "@/lib/env";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-100 mt-12">
      <div className="container-jo py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Logo size="md" variant="light" />
          <p className="mt-3 text-sm text-navy-200 leading-relaxed">
            منصة وظائف الأردن — تجمع الفرص المحلية وتساعدك تعمل سيرة ذاتية احترافية وتتابع طلباتك من مكان واحد.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">للباحثين عن عمل</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/jobs" className="hover:text-white">تصفّح الوظائف</Link></li>
            <li><Link href="/cv-builder" className="hover:text-white">اعمل CV</Link></li>
            <li><Link href="/pricing" className="hover:text-white">الأسعار</Link></li>
            <li><Link href="/me" className="hover:text-white">حسابي</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">للشركات</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/employer" className="hover:text-white">انشر وظيفة</Link></li>
            <li><Link href="/pricing" className="hover:text-white">باقات الشركات</Link></li>
            <li><Link href="/companies" className="hover:text-white">دليل الشركات</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-3">المنصة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">عن المنصة</Link></li>
            <li><Link href="/contact" className="hover:text-white">اتصل بنا</Link></li>
            <li><Link href="/privacy" className="hover:text-white">سياسة الخصوصية</Link></li>
            <li><Link href="/terms" className="hover:text-white">الشروط والأحكام</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-700">
        <div className="container-jo py-4 text-xs text-navy-300 flex flex-col sm:flex-row justify-between gap-2">
          <span>© {new Date().getFullYear()} {env.SITE_NAME}. جميع الحقوق محفوظة.</span>
          <span>مشروع مفتوح المصدر — صُمّم في الأردن.</span>
        </div>
      </div>
    </footer>
  );
}
