import type { Metadata, Viewport } from "next";
import { Cairo, Readex_Pro, Tajawal } from "next/font/google";
import "./globals.css";
import { env } from "@/lib/env";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import NextTopLoader from "nextjs-toploader";
import { WebSiteSchema } from "@/components/seo/WebSiteSchema";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { absoluteUrl, OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";

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
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: absoluteUrl("/"),
  },
  manifest: "/manifest.webmanifest",
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  title: {
    default: `${SITE_NAME} — وظائف الأردن الشاغرة`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "وظائف الأردن",
    "عمل في الأردن",
    "وظائف عمّان",
    "وظائف إربد",
    "فرص عمل أردن",
    "شغل في الأردن",
    "توظيف الأردن",
    "باني السيرة الذاتية",
    "سيرة ذاتية مجانية"
  ],
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — وظائف الأردن الشاغرة`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absoluteUrl(OG_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: "منصة جوبز الأردن للتوظيف",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — وظائف الأردن الشاغرة`,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(OG_IMAGE_PATH)],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
  },
  verification: {
    google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1B4FDB",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <WebSiteSchema />
        <OrganizationSchema />
      </head>
      <body className={`${readexPro.variable} ${cairo.variable} ${tajawal.variable}`}>
        <a href="#main-content" className="skip-link">
          الانتقال إلى المحتوى الرئيسي
        </a>
        <GoogleAnalytics />
        <NextTopLoader
          color="#FF6B35"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #FF6B35,0 0 5px #FF6B35"
        />
        <div className="min-h-screen flex flex-col pb-16 md:pb-0">
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <MobileNav />
          <PwaInstallPrompt />
        </div>
      </body>
    </html>
  );
}
