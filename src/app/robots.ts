import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/register", "/me", "/employer", "/api"] },
    ],
    sitemap: `${env.SITE_URL}/sitemap.xml`,
  };
}
