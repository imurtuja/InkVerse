"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  Heart,
  MessageSquare,
  Share2,
  ChevronLeft,
  Trash2,
  Edit2,
  MoreVertical,
  Link2,
  Flag,
  Code2,
  Feather,
  Quote,
  Music,
  StickyNote,
  Globe,
  Book,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import CommentSection from "@/components/posts/CommentSection";
import UserAvatar from "@/components/ui/UserAvatar";
import CodeBlock from "@/components/ui/CodeBlock";
import Modal from "@/components/ui/Modal";

const categoryDisplay = {
  code: { label: "Code", icon: Code2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  poetry: { label: "Poetry", icon: Feather, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  quote: { label: "Quote", icon: Quote, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  shayri: { label: "Shayri", icon: Book, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  song: { label: "Song", icon: Music, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  note: { label: "Note", icon: StickyNote, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  general: { label: "General", icon: Globe, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

export default function PostPage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${resolvedParams.id}`);
        if (!res.ok) throw new Error("Post not found");
        const data = await res.json();
        setPost(data.post);
        setLiked(data.post.likes?.includes(session?.user?.id));
        setLikesCount(data.post.likes?.length || 0);
      } catch (err) {
        toast.error("Failed to load post");
        router.push("/feed");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [resolvedParams.id, session?.user?.id, router]);

  /* close menu on outside click */
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleLike = async () => {
    if (!session) return toast.error("Please login to like");
    setLiked(!liked);
    setLikesCount((c) => (liked ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/posts/${post._id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setLiked(liked);
      setLikesCount(post.likes?.length || 0);
      toast.error("Failed to like post");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post?._id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted");
        router.push("/feed");
      } else throw new Error();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto px-3 py-8">
      <div className="h-4 w-24 skeleton mb-4" />
      <div className="bg-white dark:bg-[#0B1120] border border-gray-200/60 dark:border-white/[0.06] rounded-xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton" />
          <div className="space-y-2 flex-1">
            <div className="h-3.5 w-32 skeleton" />
            <div className="h-3 w-24 skeleton" />
          </div>
          <div className="h-5 w-16 rounded-full skeleton" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-3/4 skeleton" />
          <div className="h-4 w-full skeleton" />
          <div className="h-4 w-5/6 skeleton" />
          <div className="h-4 w-4/6 skeleton" />
          <div className="h-4 w-3/4 skeleton" />
        </div>
        <div className="flex items-center gap-4 pt-3 border-t border-gray-100 dark:border-white/[0.04]">
          <div className="h-4 w-14 skeleton" />
          <div className="h-4 w-14 skeleton" />
          <div className="ml-auto h-4 w-8 skeleton" />
        </div>
      </div>
      {/* Comment skeleton */}
      <div className="mt-4 space-y-3">
        <div className="h-5 w-28 skeleton" />
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/[0.04]">
            <div className="w-8 h-8 rounded-full skeleton" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-24 skeleton" />
              <div className="h-3 w-full skeleton" />
              <div className="h-3 w-3/4 skeleton" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!post) return null;

  const isOwner = session?.user?.id === (post.author?._id || post.author);
  const catConfig = categoryDisplay[post.category] || categoryDisplay.general;
  const CatIcon = catConfig.icon;

  return (
    <div className="max-w-3xl mx-auto px-3 pb-24 md:pb-8">
      {/* ── Sticky back header ──────────────────────────── */}
      <div className="sticky top-14 z-20 -mx-3 px-3 py-3 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to feed
        </Link>
      </div>

      {/* ── Post Article ────────────────────────────────── */}
      <article className="bg-white dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] rounded-xl overflow-hidden">
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Link href={`/profile/${post.author?.username}`} className="flex-shrink-0">
                <UserAvatar
                  src={post.author?.image}
                  name={post.author?.name}
                  size="md"
                  ring
                />
              </Link>
              <div className="min-w-0">
                <Link
                  href={`/profile/${post.author?.username}`}
                  className="text-[14px] font-semibold text-gray-900 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 transition-colors truncate block leading-tight"
                >
                  {post.author?.name}
                </Link>
                <p className="text-[13px] text-gray-500 dark:text-white/40 truncate mt-0.5">
                  @{post.author?.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Category badge */}
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border",
                catConfig.color
              )}>
                <CatIcon className="w-2.5 h-2.5" />
                {catConfig.label}
              </span>

              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/50 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {isOwner && (
                      <>
                        <Link
                          href={`/post/${post._id}/edit`}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => { setMenuOpen(false); setIsDeleteModalOpen(true); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <div className="h-px bg-white/5 my-1" />
                      </>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); handleShare(); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Copy link
                    </button>
                    {!isOwner && (
                      <button
                        onClick={() => { setMenuOpen(false); toast.success("Report submitted"); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <h1 className={cn(
              "text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-3",
              post.category === "quote" && "text-2xl md:text-3xl italic font-serif"
            )}>
              {post.title}
            </h1>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${tag}`}
                  className="text-[13px] font-medium text-primary-500/80 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* ── Content Body ────────────────────────────── */}
          <div className={cn(
            "text-[14px] md:text-[15px] text-gray-700 dark:text-white/85 leading-relaxed prose prose-sm md:prose-base prose-gray dark:prose-invert max-w-none break-words",
            "prose-pre:my-0 prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0 prose-pre:rounded-none",
            "prose-code:text-sm prose-code:text-primary-500 dark:prose-code:text-primary-400",
            "prose-a:text-primary-500 dark:prose-a:text-primary-400 hover:prose-a:underline",
            "prose-blockquote:border-l-2 prose-blockquote:border-primary-500/50 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-white/[0.02] prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-500 dark:prose-blockquote:text-white/60",
            "prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-img:rounded-xl",
            `post-${post.category}`
          )}>
            <ReactMarkdown
              rehypePlugins={[rehypeHighlight]}
              remarkPlugins={[remarkGfm]}
              components={{ pre: CodeBlock }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Timestamp */}
          <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-gray-400 dark:text-white/25 border-t border-gray-100 dark:border-white/[0.04] pt-4 uppercase tracking-wider">
            <time dateTime={post.createdAt}>{formatDate(post.createdAt, true)}</time>
            <span className="text-gray-300 dark:text-white/10">·</span>
            <span className="text-gray-300 dark:text-white/15">inkVerse</span>
          </div>

          {/* ── Engagement Bar ──────────────────────────── */}
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.04]">
            <button
              onClick={handleLike}
              className={cn(
                "flex items-center gap-1.5 pr-5 transition-colors group/like",
                liked ? "text-pink-500" : "text-gray-400 dark:text-white/35 hover:text-pink-500"
              )}
            >
              <div className="p-1.5 rounded-md group-hover/like:bg-pink-500/10 transition-colors">
                <Heart className={cn("w-[18px] h-[18px]", liked && "fill-current")} />
              </div>
              {likesCount > 0 && (
                <span className="text-sm font-semibold tabular-nums">{likesCount}</span>
              )}
            </button>

            <div className="flex items-center gap-1.5 pr-5 text-gray-400 dark:text-white/35 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group/comment cursor-pointer">
              <div className="p-1.5 rounded-md group-hover/comment:bg-primary-500/10 transition-colors">
                <MessageSquare className="w-[18px] h-[18px]" />
              </div>
              {post.commentsCount > 0 && (
                <span className="text-sm font-semibold tabular-nums">{post.commentsCount}</span>
              )}
            </div>

            <button
              onClick={handleShare}
              className="ml-auto p-1.5 rounded-md text-gray-400 dark:text-white/35 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <Share2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </article>

      {/* ── Comments ────────────────────────────────────── */}
      <div className="mt-4">
        <CommentSection postId={resolvedParams.id} />
      </div>

      {/* ── Delete Modal ────────────────────────────────── */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Post?"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <p className="text-gray-900 dark:text-white font-bold text-base">Are you absolutely sure?</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">This action cannot be undone.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
            <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50">{isDeleting ? "Deleting..." : "Delete"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
