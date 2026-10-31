import { timingSafeEqual } from "node:crypto";
import { remindStaffOfWaitingOrders } from "@/lib/staff-notify";

// Supabase calls this every 30 seconds (pg_cron + pg_net).
function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const reminded = await remindStaffOfWaitingOrders();
    return Response.json({ reminded });
  } catch (error) {
    console.error("[reminders]", error);
    return Response.json({ error: "Lookup failed" }, { status: 500 });
  }
}
