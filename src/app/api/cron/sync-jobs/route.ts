import { NextResponse } from "next/server";
import { syncAllJobSources } from "@/lib/tasks/sync-jobs";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");

  // Get authorization header
  const authHeader = request.headers.get("authorization");
  const secretHeader = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  const expectedSecret = process.env.CRON_SECRET || "dev_secret_key_123";
  const providedSecret = secretParam || secretHeader;

  if (providedSecret !== expectedSecret) {
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
