import { NextResponse } from "next/server";
import { getMenu } from "@/lib/menu";

export async function GET() {
  const items = await getMenu();
  return NextResponse.json({ items });
}
