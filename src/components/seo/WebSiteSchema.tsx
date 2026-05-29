import React from "react";

export function WebSiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "جوبز الأردن",
    "url": "https://www.jordan-job.shop",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.jordan-job.shop/jobs?q={search_term_string}",
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
