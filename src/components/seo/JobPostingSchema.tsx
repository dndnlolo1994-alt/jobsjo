import React from "react";
import { buildJobPostingJsonLd } from "@/lib/seo/jobposting";

interface JobPostingSchemaProps {
  job: Parameters<typeof buildJobPostingJsonLd>[0];
}

export function JobPostingSchema({ job }: JobPostingSchemaProps) {
  const schema = buildJobPostingJsonLd(job);
  if (!schema) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
