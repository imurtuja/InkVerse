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

  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const scrollContainerRef = useRef(null);

  const updateScrollMask = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    
    if (scrollWidth <= clientWidth) {
      el.style.maskImage = "none";
      el.style.WebkitMaskImage = "none";
      return;
    }

    const isAtStart = scrollLeft <= 0;
    const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 1;

    let mask = "";
    if (isAtStart) {
      mask = "linear-gradient(to right, black 90%, transparent)";
    } else if (isAtEnd) {
      mask = "linear-gradient(to right, transparent, black 10%)";
    } else {
      mask = "linear-gradient(to right, transparent, black 10%, black 90%, transparent)";
    }

    el.style.maskImage = mask;
    el.style.WebkitMaskImage = mask;
  };

  useEffect(() => {
    updateScrollMask();
    window.addEventListener("resize", updateScrollMask);
    return () => window.removeEventListener("resize", updateScrollMask);
  }, []);

  const handleMouseDown = (e) => {
    isDown.current = true;
    startX.current = e.pageX - e.currentTarget.offsetLeft;
    scrollLeftPos.current = e.currentTarget.scrollLeft;
  };
  const handleMouseLeave = () => { isDown.current = false; };
  const handleMouseUp = () => { isDown.current = false; };
  const handleMouseMove = (e) => {
    if (!isDown.current) return;
    e.preventDefault();
    const x = e.pageX - e.currentTarget.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    e.currentTarget.scrollLeft = scrollLeftPos.current - walk;
    // updateMask not strictly required here if onScroll is on the div, but we can rely on onScroll event.
  };

  return (
    <div className="max-w-3xl mx-auto px-3 md:px-0 py-4 mb-4">
      {/* Header */}
      <div className="mb-4 px-1 flex items-center gap-2">
        <Activity className="w-5 h-5 text-primary-500" />
        <h1 className="text-lg font-semibold leading-tight text-gray-900 dark:text-white tracking-tight">Feed</h1>
      </div>

      {/* Category Filter - Sticky with unified surface blur */}
      <div className="sticky top-14 z-20 -mx-3 px-3 py-2 sm:py-2.5 bg-white/60 dark:bg-[#030712]/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/[0.05] mb-5">
        <div 
          ref={scrollContainerRef}
          className="flex flex-nowrap gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1 scroll-smooth"
          style={{ maskImage: "linear-gradient(to right, black 90%, transparent)", WebkitMaskImage: "linear-gradient(to right, black 90%, transparent)" }}
          onScroll={updateScrollMask}
          onWheel={(e) => {
            e.currentTarget.scrollLeft += e.deltaY;
          }}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {feedCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "flex-shrink-0 flex items-center justify-center gap-2 h-9 px-4 rounded-full text-sm transition-all",
                  isActive
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-white/70"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0B1120] border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-3.5 md:p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full skeleton" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-28 skeleton" />
                  <div className="h-3 w-36 skeleton" />
                </div>
                <div className="h-5 w-16 rounded-full skeleton" />
              </div>
              <div className="space-y-2 pt-1">
                <div className="h-4 w-3/4 skeleton" />
                <div className="h-3.5 w-full skeleton" />
                <div className="h-3.5 w-5/6 skeleton" />
                <div className="h-3.5 w-2/3 skeleton" />
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                <div className="h-3.5 w-12 skeleton" />
                <div className="h-3.5 w-12 skeleton" />
                <div className="ml-auto h-3.5 w-8 skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24 animate-in fade-in duration-700">
          <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-800 mx-auto mb-4" />
          <h3 className="text-base font-bold text-gray-500 mb-1.5">No posts found</h3>
          <p className="text-[14px] text-gray-400 dark:text-gray-700">Be the first to ignite the verse!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div
              key={post._id}
              ref={index === posts.length - 1 ? lastPostRef : null}
              className="animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <PostCard post={post} onDelete={handleDelete} />
            </div>
          ))}
          {loadingMore && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/10 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
