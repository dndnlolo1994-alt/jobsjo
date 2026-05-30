import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchJobsAdvanced } from "@/lib/search/jobs";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production" && !isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const totalJobs = await prisma.job.count();
    const publishedJobs = await prisma.job.count({ where: { status: "PUBLISHED" } });
    const totalCompanies = await prisma.company.count();
    
    // Test searchJobsAdvanced
    let searchResult: any = null;
    let searchError: any = null;
    try {
      searchResult = await searchJobsAdvanced({});
    } catch (err: any) {
      searchError = {
        message: err.message,
        stack: err.stack,
      };
    }

    // Mask database password
    const rawDbUrl = process.env.DATABASE_URL || "";
    const maskedDbUrl = rawDbUrl.replace(/:([^@:]+)@/, ":****@");

    return NextResponse.json({
      ok: true,
      time: new Date().toISOString(),
      database: {
        url: maskedDbUrl,
        totalJobs,
        publishedJobs,
        totalCompanies,
      },
      searchTest: {
        success: !searchError,
        itemsCount: searchResult?.items?.length ?? 0,
        total: searchResult?.total ?? 0,
        error: searchError,
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
