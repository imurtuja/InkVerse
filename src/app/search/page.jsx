"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search as SearchIcon, Users, FileText, X } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import { cn } from "@/lib/utils";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(searchParams.get("type") || "all");

  const search = useCallback(async (q, t) => {
    if (!q || q.trim().length < 2) {
      setPosts([]);
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${t}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setUsers(data.users || []);
      }
    } catch {
      console.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time debounced search
  useEffect(() => {
    // Skip initial load to avoid duplicate requests (search is already called by the other useEffect)
    if (query === initialQuery) return;

    const timer = setTimeout(() => {
      search(query, type);
      const params = new URLSearchParams(window.location.search);
      if (query.trim()) params.set("q", query);
      else params.delete("q");
      router.replace(`/search?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, type, initialQuery, router, search]);

  // Sync internal state with URL params (for Navbar search)
  useEffect(() => {
    setQuery(initialQuery);
    search(initialQuery, type);
  }, [initialQuery, type, search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    search(query, type);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white md:hidden">
        <SearchIcon className="w-6 h-6 text-primary-500" /> Search
      </h1>
 
      <form onSubmit={handleSubmit} className="relative group md:hidden">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts, users, tags..."
          className="w-full pl-12 pr-12 py-3.5 rounded-2xl glass-card text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all bg-white/70 dark:bg-black/40 border-gray-200 dark:border-white/10"
        />
        {query && (
          <button 
            type="button" 
            onClick={() => { setQuery(""); setPosts([]); setUsers([]); router.replace("/search", { scroll: false }); }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      <div className="flex gap-2">
        {[
          { value: "all", label: "All" }, 
          { value: "posts", label: "Posts", icon: FileText }, 
          { value: "users", label: "Users", icon: Users }
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => { setType(t.value); search(query, t.value); }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              type === t.value
                ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                : "glass bg-white/40 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200"
            )}
          >
            {t.icon && <t.icon className="w-4 h-4" />}
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-4 h-24 skeleton bg-gray-100 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {users.length > 0 && (type === "all" || type === "users") && (
            <div className="space-y-3">
              <h2 className="text-[13px] font-black uppercase tracking-[0.1em] text-gray-500/80">Users</h2>
              <div className="grid gap-3">
                {users.map((user) => (
                  <Link 
                    key={user._id} 
                    href={`/profile/${user.username}`} 
                    className="glass-card rounded-xl p-3.5 flex items-center gap-3 bg-white/60 dark:bg-black/40 border border-gray-100 dark:border-white/5 hover:scale-[1.01] transition-all hover:border-primary-500/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold overflow-hidden shadow-sm">
                      {user.image ? <img src={user.image} alt="" className="w-full h-full object-cover" /> : user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {posts.length > 0 && (type === "all" || type === "posts") && (
            <div className="space-y-4">
              <h2 className="text-[13px] font-black uppercase tracking-[0.1em] text-gray-500/80">Posts</h2>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {!loading && initialQuery && posts.length === 0 && users.length === 0 && (
            <div className="text-center py-16 text-gray-400 bg-white/30 dark:bg-white/5 rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
              <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No results found for &ldquo;{initialQuery}&rdquo;</p>
            </div>
          )}

          {!loading && !initialQuery && (
            <div className="text-center py-20 opacity-30">
              <p className="text-lg font-bold italic tracking-tight">Explore the Verse</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-8"><div className="h-12 glass-card rounded-2xl animate-pulse" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
