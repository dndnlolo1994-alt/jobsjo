import React from "react";
import { absoluteUrl, SITE_NAME } from "@/lib/seo/site";

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": absoluteUrl("/"),
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${absoluteUrl("/jobs")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
