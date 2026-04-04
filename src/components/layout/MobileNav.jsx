"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Home, Search, PlusCircle, Bell, User, Shield } from "lucide-react";
import useStore from "@/store/useStore";
import { cn } from "@/lib/utils";

export default function MobileNav() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { unreadCount } = useStore();

  if (!session) return null;

  const links = [
    { href: "/feed", icon: Home, label: "Feed" },
    { href: "/search", icon: Search, label: "Search" },
    { href: "/post/new", icon: PlusCircle, label: "Create", special: true },
    { href: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
    ...(session.user?.role === "admin"
      ? [{ href: "/admin", icon: Shield, label: "Admin" }]
      : []),
    { href: `/profile/${session.user?.username}`, icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 z-50 md:hidden max-w-sm mx-auto">
      <div className="relative flex items-center justify-between p-1.5 bg-white/95 dark:bg-[#111111]/95 backdrop-blur-3xl border border-gray-200/60 dark:border-white/10 rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.15)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/feed" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative z-10 flex flex-row items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-full transition-all duration-300 ease-out",
                isActive ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="zomatoActivePill"
                  className="absolute inset-0 bg-gray-900 dark:bg-white rounded-full z-0 shadow-sm"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.55 }}
                />
              )}
              <div className="relative z-10">
                <Icon
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("w-[20px] h-[20px] transition-colors duration-300", isActive ? "text-white dark:text-black" : "")}
                />
                {link.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#111111] shadow-sm z-20">
                    {link.badge > 9 ? "9+" : link.badge}
                  </span>
                )}
              </div>
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="relative z-10 text-[13px] font-bold tracking-wide transition-all duration-300 text-white dark:text-black overflow-hidden whitespace-nowrap block"
                >
                  {link.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
