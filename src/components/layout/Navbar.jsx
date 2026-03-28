"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  PenTool,
  Plus,
  PlusCircle,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  SearchIcon,
  Feather,
} from "lucide-react";
import useStore from "@/store/useStore";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef(null);
  const { unreadCount } = useStore();

  useEffect(() => {
    setMounted(true);
    // Sync search query from URL if on search page
    if (pathname === "/search") {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setSearchQuery(q);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Real-time debounced search
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

  if (!mounted) return null;

  const BrandLogo = () => (
    <Link href={session ? "/feed" : "/"} className="flex items-center gap-2 flex-shrink-0 group">
      <Feather className="w-8 h-8 text-primary-600 dark:text-primary-400 group-hover:-translate-y-0.5 transition-all duration-300" />
      <span className="logo-glow logo-shimmer text-xl font-black bg-gradient-to-r from-primary-600 via-primary-400 to-accent-500 dark:from-primary-400 dark:via-white dark:to-accent-400 bg-clip-text text-transparent tracking-tight transition-all duration-500 inline-block">
        InkVerse
      </span>
    </Link>
  );

  // Authenticated Navbar
  if (session) {
    return (
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <BrandLogo />

            {/* Desktop Search Bar - Optimized & Synced */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search titles, people, tags..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 border border-transparent focus:border-blue-500/30 dark:focus:border-white/20 text-sm focus:outline-none transition-all"
                />
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 sm:gap-3" ref={menuRef}>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Only show Create button and Search on desktop */}
              <Link
                href="/post/new"
                className="hidden sm:flex items-center gap-2.5 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 text-white shadow-xl shadow-primary-500/20 text-sm font-black uppercase tracking-widest hover:scale-105 hover:shadow-primary-500/40 active:scale-95 transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5 stroke-[2.5px]" />
                <span>Create</span>
              </Link>

              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full border-2 border-transparent hover:border-blue-500/50 transition-all overflow-hidden bg-gray-200 dark:bg-white/10"
                >
                  {session.user?.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-600 dark:text-white">
                      {session.user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 p-2 bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="px-3 py-3 border-b border-gray-50 dark:border-white/5 mb-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{session.user?.username}</p>
                      </div>
                      <Link href={`/profile/${session.user?.username}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                      {session.user?.role === "admin" && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-xl transition-colors">
                          <Shield className="w-4 h-4" /> Admin
                        </Link>
                      )}
                      <button onClick={() => signOut()} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors mt-1">
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Non-Authenticated Navbar
  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/login" className="text-sm font-bold text-gray-700 dark:text-gray-300 px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Log in</Link>
            <Link href="/signup" className="text-sm font-bold text-white bg-blue-600 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">Get Started</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
