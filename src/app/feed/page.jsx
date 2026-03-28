"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, Code2, Feather, Quote, Book, Music, Edit, Globe, Activity } from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import { cn } from "@/lib/utils";

const feedCategories = [
  { value: "all", label: "All", icon: null },
  { value: "code", label: "Code", icon: Code2 },
  { value: "poetry", label: "Poetry", icon: Feather },
  { value: "quote", label: "Quote", icon: Quote },
  { value: "shayri", label: "Shayri", icon: Book },
  { value: "song", label: "Song", icon: Music },
  { value: "note", label: "Note", icon: Edit },
  { value: "general", label: "General", icon: Globe },
];

export default function FeedPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [category, setCategory] = useState("all");
  const observerRef = useRef(null);

  const fetchPosts = useCallback(async (pageNum, cat, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({ page: pageNum, limit: 10 });
      if (cat && cat !== "all") params.append("category", cat);
      const res = await fetch(`/api/posts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts((prev) => (reset ? data.posts : [...prev, ...data.posts]));
        setHasMore(data.pagination.hasMore);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchPosts(1, category, true);
  }, [category, fetchPosts]);

  // Infinite scroll
  const lastPostRef = useCallback(
    (node) => {
      if (loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, category);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loadingMore, hasMore, page, category, fetchPosts]
  );

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6 px-1 flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary-500" />
        <h1 className="text-2xl font-black tracking-tight text-gray-900 dark:text-gray-100">Feed</h1>
      </div>

      {/* Category Filter - Fixed for Desktop Width Alignment */}
      <div className="flex gap-2 md:gap-0 md:justify-between overflow-x-auto md:overflow-visible pb-6 mb-2 scrollbar-hide">
        {feedCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "flex-shrink-0 flex items-center justify-center gap-1.5 px-3 md:px-2.5 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200 border",
                isActive
                  ? "bg-blue-600 dark:bg-[#1e40af] text-white border-blue-600 dark:border-[#1e40af] shadow-md shadow-blue-500/20"
                  : "bg-white/50 dark:bg-transparent text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#1e293b] hover:bg-gray-100 dark:hover:bg-[#1e293b]/50 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/40 dark:bg-[#030712]/10 backdrop-blur-md border border-gray-100 dark:border-[#1e293b]/30 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1e293b] animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 dark:bg-[#1e293b] rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-[#1e293b] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-24 bg-gray-100/50 dark:bg-[#1e293b]/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Sparkles className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-1">No posts right now</h3>
          <p className="text-sm text-gray-500">Be the first to share something!</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
            >
              <PostCard post={post} onDelete={handleDelete} />
            </div>
          ))}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
