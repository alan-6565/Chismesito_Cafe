import { NextRequest, NextResponse } from "next/server";
import { drawGiveawayWinner } from "@/lib/giveaway-draw";

/** Backup for the automatic draw: picks a month's winner now. */
export async function POST(req: NextRequest) {
  const { month } = (await req.json()) as { month?: string };
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Missing month" }, { status: 400 });
  }

  const result = await drawGiveawayWinner(month);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ winner: result.winner });
}
