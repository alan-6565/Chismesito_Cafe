"use client";

import { useOrderingPause } from "@/lib/use-ordering-pause";

/** Shown on every page while staff have online orders paused */
export default function OrderingPausedBanner() {
  const { paused, backAt } = useOrderingPause();
  if (!paused) return null;
  return (
    <div role="status" className="bg-maroon text-cream text-center text-sm font-medium px-4 py-2.5">
      Online ordering is currently unavailable. We&apos;ll be back around {backAt}. You can still browse the menu ♡
    </div>
  );
}
