import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { adminReviewClaimAction } from "@/lib/actions/platform";

export const metadata: Metadata = { title: "مطالبات الشركات", robots: { index: false, follow: false } };

export default async function ClaimsPage() {
  await requireAdmin();
  const claims = await prisma.companyClaim.findMany({ include: { company: true, claimant: true }, orderBy: { createdAt: "desc" } });
  return <section className="container-jo py-8"><h1 className="section-title">مطالبات إدارة الشركات</h1><div className="space-y-3">{claims.map((c) => <div className="card-pad" key={c.id}><h2 className="font-bold">{c.company.name}</h2><p className="text-sm text-navy-600">{c.claimantName} · {c.companyRole} · {c.phone} · {c.email} · {c.status}</p>{c.proofText && <p className="text-sm mt-2">{c.proofText}</p>}<div className="flex gap-2 mt-3"><form action={adminReviewClaimAction.bind(null, c.id, "APPROVED")}><button className="btn-primary">قبول</button></form><form action={adminReviewClaimAction.bind(null, c.id, "REJECTED")}><button className="btn-danger">رفض</button></form></div></div>)}</div></section>;
}
