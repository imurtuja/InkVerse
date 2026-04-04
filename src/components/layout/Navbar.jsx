"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  PlusCircle,
  LogOut,
  Moon,
  Sun,
  Feather,
  Bell,
  Shield,
} from "lucide-react";
import useStore from "@/store/useStore";
import NotificationsDropdown from "./NotificationsDropdown";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { unreadCount, setUnreadCount } = useStore();
  const menuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (pathname === "/search") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setSearchQuery(q);
    }
    fetchUnreadCount();
  }, [pathname]);

  const fetchUnreadCount = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.status === 401) return; // Silent skip for unauthorized
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      // Handle silently as requested
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const timer = setTimeout(() => {
      const currentQ = new URLSearchParams(window.location.search).get("q") || "";
      if (searchQuery.trim() !== currentQ) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`, { scroll: false });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, router]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!mounted) return null;

  const BrandLogo = () => (
    <Link href={session ? "/feed" : "/"} className="flex items-center gap-1.5 shrink-0 group transition-all active:opacity-80">
      <Feather className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:-rotate-12 transition-all duration-300" />
      <span className="logo-glow logo-shimmer text-lg font-bold bg-gradient-to-r from-primary-600 via-primary-400 to-accent-500 dark:from-white dark:via-primary-300 dark:to-accent-400 bg-clip-text text-transparent tracking-tight transition-all duration-500 inline-block">
        InkVerse
      </span>
    </Link>
  );

  if (session) {
    return (
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 h-14">
        <div className="max-w-5xl mx-auto px-3 md:px-4 h-full">
          <div className="flex items-center justify-between h-full gap-4">
            <BrandLogo />

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, people, tags..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-transparent focus:border-primary-500/30 dark:focus:border-white/20 text-sm focus:outline-none transition-all h-10 w-full"
                />
              </div>
            </form>

            <div className="flex items-center gap-2.5" ref={menuRef}>
              {/* Admin Button (Desktop Only) */}
              {session.user?.role === "admin" && (
                <Link
                  href="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all"
                title="Toggle visual style"
              >
                {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-all relative",
                    isNotifOpen && "bg-gray-100 dark:bg-white/10 text-primary-500"
                  )}
                >
                  <Bell className="w-[19px] h-[19px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary-500 rounded-full border-2 border-white dark:border-[#030712] animate-pulse" />
                  )}
                </button>
                <NotificationsDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
              </div>

              {/* Create Post Page (Desktop Only) */}
              <Link
                href="/post/new"
                className="hidden md:flex items-center gap-1.5 px-4 h-9 rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-500/20 text-sm font-medium hover:bg-primary-700 transition-all duration-200"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create</span>
              </Link>

              {/* Profile Avatar & Logout Logic */}
              <div className="relative">
                {pathname === `/profile/${session.user?.username}` ? (
                  <button
                    onClick={() => signOut()}
                    title="Log Out"
                    className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-500/20 transition-all border border-red-100/50 dark:border-red-500/20"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                  </button>
                ) : (
                  <Link
                    href={`/profile/${session.user?.username}`}
                    className="block w-10 h-10 rounded-xl border border-gray-200 dark:border-white/10 p-[1px] hover:border-primary-500/50 transition-all overflow-hidden bg-gray-100 dark:bg-white/5"
                  >
                    {session.user?.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover rounded-[10px]" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-sm text-gray-600 dark:text-gray-300">
                        {session.user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-14">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login" className="text-sm font-medium text-gray-700 dark:text-gray-300 px-3.5 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Log in</Link>
              <Link href="/signup" className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-xl shadow-lg shadow-blue-500/20 active:opacity-90 transition-all">Get Started</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
