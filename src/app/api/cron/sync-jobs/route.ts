import { NextResponse } from "next/server";
import { syncAllJobSources } from "@/lib/tasks/sync-jobs";
import { isAuthorizedCronRequest } from "@/lib/cron-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Invalid secret." },
      { status: 401 }
    );
  }

  try {
    const result = await syncAllJobSources();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal Server Error during sync" },
      { status: 500 }
    );
  }
}
