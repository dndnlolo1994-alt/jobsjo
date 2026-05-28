import type { Metadata, Viewport } from "next";
import { Cairo, Readex_Pro, Tajawal } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import NextTopLoader from "nextjs-toploader";
import { NavigationLoader } from "@/components/NavigationLoader";

const readexPro = Readex_Pro({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-readex-pro",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  manifest: "/manifest.webmanifest",
  applicationName: env.SITE_NAME,
  appleWebApp: {
    capable: true,
    title: env.SITE_NAME,
    statusBarStyle: "default",
  },
  title: {
    default: `${env.SITE_NAME} — وظائف الأردن الشاغرة والقريبة منك`,
    template: `%s | ${env.SITE_NAME}`,
  },
  description:
    "منصة جوبز الأردن: ابحث عن أحدث الوظائف المحلية الشاغرة في عمان وإربد وسائر المحافظات الأردنية، أنشئ سيرة ذاتية احترافية باللغتين العربية والإنجليزية مجاناً، وقدم طلبك بنقرة زر.",
  keywords: [
    "وظائف الأردن",
    "وظائف شاغرة في الأردن",
    "وظائف عمان",
    "وظائف إربد",
    "فرص عمل في الأردن",
    "سيرة ذاتية مجانية",
    "عمل في الأردن",
    "توظيف الأردن",
    "باني السيرة الذاتية",
    "سيرة ذاتية عربي انجليزي"
  ],
  openGraph: {
    type: "website",
    locale: "ar_JO",
    siteName: env.SITE_NAME,
    title: `${env.SITE_NAME} — منصة وظائف الأردن وباني السيرة الذاتية`,
    description: "ابحث عن وظائف محلية شاغرة في الأردن، صمم سيرة ذاتية احترافية باللغتين مجاناً، وقدم للشركات مباشرة.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.SITE_NAME} — وظائف الأردن وباني السيرة الذاتية`,
    description: "ابحث عن وظائف محلية شاغرة في الأردن، صمم سيرة ذاتية احترافية باللغتين مجاناً، وقدم للشركات مباشرة.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0a1320",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body className={`${readexPro.variable} ${cairo.variable} ${tajawal.variable}`}>
        <NextTopLoader
          color="#10b981"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #10b981,0 0 5px #10b981"
        />
        <NavigationLoader />
        <div className="min-h-screen flex flex-col pb-16 md:pb-0">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileNav />
          <PwaInstallPrompt />
        </div>
      </body>
    </html>
  );
}
