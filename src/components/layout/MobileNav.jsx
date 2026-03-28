"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="flex items-center justify-around py-1.5 px-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== "/feed" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200",
                isActive ? "text-accent-500" : "text-[hsl(var(--muted-foreground))]"
              )}
            >
              {link.special ? (
                <div className="w-10 h-10 -mt-5 rounded-full bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span className={cn("text-[10px] font-medium", link.special && "mt-0.5")}>{link.label}</span>
              {link.badge > 0 && (
                <span className="absolute -top-0.5 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[7px] font-bold rounded-full flex items-center justify-center">
                  {link.badge > 9 ? "9+" : link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
