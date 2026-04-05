"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Home, Search, Plus, Bell, User } from "lucide-react";
import useStore from "@/store/useStore";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { unreadCount } = useStore();
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);
  const rafId = useRef(null);

  /* ── scroll-aware hide/show — lightweight, no jank ──── */
  useEffect(() => {
    let scheduled = false;

    const onScroll = () => {
      if (scheduled) return;
      scheduled = true;

      rafId.current = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 60 && y - lastY.current > 12) {
          setVisible(false);
        } else if (lastY.current - y > 6) {
          setVisible(true);
        }
        lastY.current = y;
        scheduled = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Always show on route change
  useEffect(() => {
    setVisible(true);
    lastY.current = window.scrollY;
  }, [pathname]);

  if (!session) return null;

  const links = [
    { href: "/feed", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/post/new", icon: Plus, label: "Create", create: true },
    { href: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    { href: `/profile/${session.user?.username}`, icon: User, label: "Profile" },
  ];

  return (
    <motion.nav
      initial={false}
      animate={{ y: visible ? 0 : 80, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
    >
      <div className="mx-auto max-w-[340px] w-full px-4 mb-4">
        <div className="p-1.5 bg-white/70 dark:bg-[#030712]/70 backdrop-blur-md border border-gray-200/50 dark:border-white/[0.08] rounded-full shadow-xl dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-around">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/feed" && !link.create && pathname.startsWith(link.href));

              /* ── Elevated Create button ───────────── */
              if (link.create) {
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative -translate-y-2 active:scale-95 transition-transform duration-200"
                  >
                    <div className="relative z-10 w-[48px] h-[48px]">
                      <Button circular>
                        <Plus className="w-[20px] h-[20px]" strokeWidth={2.5} />
                      </Button>
                    </div>
                  </Link>
                );
              }

              /* ── Regular tab ─────────────────────── */
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 active:scale-90",
                    isActive ? "text-primary-600 dark:text-primary-400" : "text-gray-400 dark:text-white/35 hover:bg-gray-100/50 dark:hover:bg-white/5"
                  )}
                >
                  <div className="relative flex flex-col items-center justify-center">
                    <Icon
                      className={cn(
                        "w-[22px] h-[22px] transition-transform duration-200 origin-center",
                        isActive && "scale-110"
                      )}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    {link.badge > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#030712]">
                        {link.badge > 9 ? "9+" : link.badge}
                      </span>
                    )}
                    
                    {/* Active dot */}
                    {isActive && (
                       <motion.div
                         layoutId="navDot"
                         className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-primary-600 dark:bg-primary-400"
                         transition={{ type: "spring", stiffness: 500, damping: 30 }}
                       />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
