"use client";

import { usePathname } from "next/navigation";
import { AppNav } from "@/components/AppNav";

const ROUTES_WITHOUT_CATEGORY_BAR = ["/listings/new", "/messages"];

export function AppNavForLayout() {
  const pathname = usePathname();
  const hideCategoryBar = ROUTES_WITHOUT_CATEGORY_BAR.some((r) => pathname.startsWith(r));
  return <AppNav hideCategoryBar={hideCategoryBar} />;
}
