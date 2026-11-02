import { NextRequest, NextResponse } from "next/server";
import { MAX_PAUSE_MINUTES, pausedUntil, setPause } from "@/lib/ordering-pause";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ pausedUntil: await pausedUntil() });
}

/** { minutes: 15 } pauses online orders; { minutes: 0 } turns them back on */
export async function POST(req: NextRequest) {
  const { minutes } = (await req.json().catch(() => ({}))) as { minutes?: number };
  if (typeof minutes !== "number" || minutes < 0 || minutes > MAX_PAUSE_MINUTES) {
    return NextResponse.json({ error: `Pick up to ${MAX_PAUSE_MINUTES} minutes` }, { status: 400 });
  }
  try {
    return NextResponse.json({ pausedUntil: await setPause(minutes) });
  } catch {
    return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  }
}
