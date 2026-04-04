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
    <div className="max-w-3xl mx-auto px-3 md:px-0 py-4 mb-4">
      {/* Header */}
      <div className="mb-4 px-1 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-500" />
        <h1 className="text-xl font-semibold leading-tight text-white tracking-tight">Feed</h1>
      </div>

      {/* Category Filter - Sticky with unified surface blur */}
      <div className="sticky top-14 z-20 -mx-3 px-3 py-2.5 bg-[#030712]/60 backdrop-blur-xl border-b border-white/[0.05] mb-5">
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-0.5">
          {feedCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border uppercase tracking-wider",
                  isActive
                    ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20"
                    : "bg-white/[0.02] text-white/40 border-white/5 hover:bg-white/5 hover:text-white"
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 space-y-4 animate-pulse shadow-xl shadow-black/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-1/3 bg-white/5 rounded" />
                  <div className="h-2 w-1/4 bg-white/5 rounded" />
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="h-4 w-full bg-white/5 rounded" />
                <div className="h-4 w-5/6 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 animate-in fade-in duration-700">
          <Sparkles className="w-10 h-10 text-gray-800 mx-auto mb-4" />
          <h3 className="text-base font-bold text-gray-500 mb-1.5">No posts found</h3>
          <p className="text-sm text-gray-700">Be the first to ignite the verse!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
              className="animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <PostCard post={post} onDelete={handleDelete} />
            </div>
          ))}
          {loadingMore && (
            <div className="flex justify-center py-10">
              <div className="w-7 h-7 border-2 border-white/10 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
