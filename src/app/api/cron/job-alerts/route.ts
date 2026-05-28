import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNotifier } from "@/lib/notifications";
import { parseJobSearchParams, searchJobsAdvanced } from "@/lib/search/jobs";
import { env } from "@/lib/env";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const isLocal = process.env.NODE_ENV !== "production" || env.SITE_URL.includes("localhost");
  const authorization = request.headers.get("authorization");
  if (!isLocal && secret && authorization !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  if (!isLocal && !secret) {
    return NextResponse.json({ ok: false, message: "CRON_SECRET is required" }, { status: 500 });
  }

  const notifier = getNotifier();
  const searches = await prisma.savedSearch.findMany({
    where: { isActive: true },
    include: { user: true, deliveries: { select: { jobId: true } } },
    take: 100,
  });

  let sentSearches = 0;
  let sentJobs = 0;

  for (const search of searches) {
    const query = (search.queryJson ?? {}) as Record<string, string>;
    const delivered = new Set(search.deliveries.map((d) => d.jobId));
    const result = await searchJobsAdvanced({ ...parseJobSearchParams(query), page: 1, perPage: 12 });
    const fresh = result.items.filter((job) => !delivered.has(job.id));
    if (!fresh.length) {
      await prisma.savedSearch.update({ where: { id: search.id }, data: { lastSentAt: new Date() } });
      continue;
    }

    const rows = fresh.map((job) => {
      const company = job.company?.name ?? job.companyNameText ?? "صاحب عمل خاص";
      return `<li><a href="${env.SITE_URL}/jobs/${job.slug}">${job.title}</a> - ${company} - ${job.city}</li>`;
    }).join("");

    await notifier.send({
      to: search.user.email,
      subject: `وظائف جديدة تطابق بحثك: ${search.name}`,
      text: fresh.map((job) => `${job.title} - ${env.SITE_URL}/jobs/${job.slug}`).join("\n"),
      html: `<div dir="rtl"><h2>وظائف جديدة من جوبز الأردن</h2><p>وجدنا وظائف تطابق بحثك المحفوظ: <strong>${search.name}</strong></p><ul>${rows}</ul></div>`,
    });

    await prisma.jobAlertDelivery.createMany({
      data: fresh.map((job) => ({ savedSearchId: search.id, jobId: job.id })),
      skipDuplicates: true,
    });
    await prisma.savedSearch.update({ where: { id: search.id }, data: { lastSentAt: new Date() } });
    sentSearches += 1;
    sentJobs += fresh.length;
  }

  return NextResponse.json({ ok: true, searches: searches.length, sentSearches, sentJobs });
}
