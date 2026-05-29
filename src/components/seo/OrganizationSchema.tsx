import React from "react";
import { absoluteUrl, OG_IMAGE_PATH, SITE_NAME, SITE_NAME_EN } from "@/lib/seo/site";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "alternateName": SITE_NAME_EN,
    "url": absoluteUrl("/"),
    "logo": absoluteUrl(OG_IMAGE_PATH),
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "info@jordan-job.shop",
      "contactType": "customer service",
      "areaServed": "JO",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
