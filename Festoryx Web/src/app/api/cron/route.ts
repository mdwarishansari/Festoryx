import { NextResponse } from "next/server";
import { runInactivityChecks } from "@/lib/inactivity-check";
import { runEventReminders } from "@/lib/event-reminders";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Optional security token check to prevent unauthorized runs
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    console.log("[Cron Job] Starting inactivity and upcoming event reminder checks...");
    await runInactivityChecks();
    await runEventReminders();
    console.log("[Cron Job] Finished successfully.");
    return NextResponse.json({ success: true, message: "Cron jobs completed successfully." });
  } catch (error: any) {
    console.error("[Cron Job] Execution error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
