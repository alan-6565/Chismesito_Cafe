import { NextResponse } from "next/server";
import { pausedUntil } from "@/lib/ordering-pause";

export const dynamic = "force-dynamic";

/** Whether online ordering is paused, for the menu and checkout */
export async function GET() {
  try {
    return NextResponse.json({ pausedUntil: await pausedUntil() }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    // If we can't tell, don't block customers; checkout checks again
    return NextResponse.json({ pausedUntil: null });
  }
}
