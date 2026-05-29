import type { Metadata } from "next";
import { env } from "@/lib/env";

export const SITE_NAME = "جوبز الأردن";
export const SITE_NAME_EN = "Jordan Job";
export const SITE_DESCRIPTION =
  "منصة وظائف أردنية للباحثين عن عمل وأصحاب الشركات، لعرض الوظائف، استقبال الطلبات، وإنشاء السيرة الذاتية.";
export const OG_IMAGE_PATH = "/images/og-image.png";

function normalizeSiteUrl(value: string) {
  const clean = value.replace(/\/$/, "");
  if (!clean || clean.includes("localhost") || clean.includes("127.0.0.1") || clean.includes("vercel.app")) {
    return "https://www.jordan-job.shop";
  }
  return clean;
}

export const SITE_URL = normalizeSiteUrl(env.SITE_URL);

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function publicMetadata(input: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = absoluteUrl(OG_IMAGE_PATH);

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: input.type ?? "website",
      locale: "ar_JO",
      url,
      siteName: SITE_NAME,
      title: input.title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: "منصة جوبز الأردن للتوظيف" }],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
    robots: { index: true, follow: true },
  };
}

export function privateMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: { index: false, follow: false },
  };
}
