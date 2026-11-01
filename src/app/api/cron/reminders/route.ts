import { isCronRequest } from "@/lib/cron-auth";
import { remindStaffOfWaitingOrders } from "@/lib/staff-notify";

// Supabase calls this every 30 seconds (pg_cron + pg_net).
export async function POST(req: Request) {
  if (!isCronRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reminded = await remindStaffOfWaitingOrders();
    return Response.json({ reminded });
  } catch (error) {
    console.error("[reminders]", error);
    return Response.json({ error: "Lookup failed" }, { status: 500 });
  }
}
