"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";

// Staff pages under /admin have their own sidebar layout, so the public
// navbar, footer and mobile tab bar are hidden there.
export default function HideOnAdmin({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname.startsWith("/admin") ? null : children;
}
