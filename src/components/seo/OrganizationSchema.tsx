import React from "react";

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "جوبز الأردن",
    "url": "https://www.jordan-job.shop",
    "logo": "https://www.jordan-job.shop/icons/icon-192x192.png",
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
