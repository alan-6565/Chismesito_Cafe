import { NextResponse } from "next/server";

// Pay-at-pickup ordering was retired: every order is now paid online up
// front (/api/checkout), so a no-show never costs the cafe the drink.
// Existing pay-at-pickup orders still display and bill normally.
export async function POST() {
  return NextResponse.json(
    { error: "Pay-at-pickup is no longer available — please pay online." },
    { status: 410 }
  );
}
