import { isCronRequest } from "@/lib/cron-auth";
import { drawGiveawayWinner, monthToDraw } from "@/lib/giveaway-draw";

// Supabase calls this at the top of every hour. It picks last month's winner
// the first time it runs in a new month (midnight Pacific on the 1st), and
// does nothing the rest of the month.
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isCronRequest(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const month = await monthToDraw();
  if (!month) return Response.json({ drawn: null });

  const result = await drawGiveawayWinner(month);
  if (!result.ok) {
    console.error("[giveaway]", month, result.error);
    return Response.json({ error: result.error }, { status: result.status });
  }
  return Response.json({ drawn: month, winner: result.winner.name });
}
