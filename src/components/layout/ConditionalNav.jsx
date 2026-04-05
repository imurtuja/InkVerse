"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";

/**
 * Conditionally renders Navbar and MobileNav.
 * Hidden on /banned and /login and /signup to avoid
 * useSession() polling loops and unnecessary UI.
 */
export default function ConditionalNav() {
  const pathname = usePathname();

  if (pathname === "/banned") return null;

  return (
    <>
      <Navbar />
      <MobileNav />
    </>
  );
}
