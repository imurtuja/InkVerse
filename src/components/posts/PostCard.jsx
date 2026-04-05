"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  Heart,
  MessageSquare,
  Share2,
  Trash2,
  Edit2,
  MoreVertical,
  Flag,
  Link2,
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
import Modal from "@/components/ui/Modal";
import UserAvatar from "@/components/ui/UserAvatar";
import CodeBlock from "@/components/ui/CodeBlock";

/* ── Category config ─────────────────────────────────────── */
const categoryDisplay = {
  code: { label: "Code", icon: Code2, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  poetry: { label: "Poetry", icon: Feather, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  quote: { label: "Quote", icon: Quote, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  shayri: { label: "Shayri", icon: Book, color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  song: { label: "Song", icon: Music, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  note: { label: "Note", icon: StickyNote, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
  general: { label: "General", icon: Globe, color: "text-slate-400 bg-slate-500/10 border-slate-500/20" },
};

/* ── PostCard ─────────────────────────────────────────────── */
export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession();
  const router = useRouter();

  /* state */
  const [liked, setLiked] = useState(post.likes?.includes(session?.user?.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  const contentRef = useRef(null);
  const menuRef = useRef(null);

  const isOwner = session?.user?.id === (post.author?._id || post.author);
  const catConfig = categoryDisplay[post.category] || categoryDisplay.general;
  const CatIcon = catConfig.icon;

  /* detect content clamp */
  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      setIsClamped(el.scrollHeight > el.clientHeight + 2);
    }
  }, [post.content, expanded]);

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

  /* ── handlers ─────────────────────────────────────────── */
  const handleLike = async (e) => {
    e.stopPropagation();
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

  const handleShare = (e) => {
    e.stopPropagation();
    setIsShareModalOpen(true);
  };

  const copyShareLink = async (e) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post?._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const submitReport = async () => {
    if (!reportReason.trim()) return toast.error("Please enter a reason");
    setIsReporting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "Post",
          itemId: post._id,
          reason: reportReason,
          isAuto: false,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }
      const data = await res.json();

      toast.success(data.message || "Report submitted successfully");
      setIsReportModalOpen(false);
      setReportReason("");
    } catch (e) {
      toast.error(e.message || "Failed to submit report");
    } finally {
      setIsReporting(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Post deleted");
        onDelete?.(post._id);
        setIsDeleteModalOpen(false);
      } else throw new Error();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/post/${post._id}`);
  };

  /* ── render ───────────────────────────────────────────── */
  return (
    <>
      <article
        onClick={handleCardClick}
        className="group bg-white dark:bg-[#0B1120] border border-gray-200/60 dark:border-white/[0.06] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:border-gray-300/60 dark:hover:border-white/[0.1]"
      >
        <div className="p-3.5 md:p-5 flex flex-col gap-2.5">
          {/* ── HEADER ─────────────────────────────────── */}
          <div className="flex items-start gap-2.5">
            {/* Avatar */}
            <Link
              href={`/profile/${post.author?.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            >
              <UserAvatar
                src={post.author?.image}
                name={post.author?.name}
                size="sm"
                ring
              />
            </Link>

            {/* User Info — takes remaining space */}
            <div className="min-w-0 flex-1">
              <Link
                href={`/profile/${post.author?.username}`}
                onClick={(e) => e.stopPropagation()}
                className="block text-[14px] font-semibold text-gray-900 dark:text-white truncate leading-tight hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                {post.author?.name}
              </Link>
              <p className="flex items-center gap-1 text-[13px] text-gray-500 dark:text-white/40 leading-tight mt-0.5 min-w-0">
                <span className="truncate max-w-[120px] sm:max-w-[180px]">@{post.author?.username}</span>
                <span className="text-gray-300 dark:text-white/20 flex-shrink-0">·</span>
                <time className="whitespace-nowrap flex-shrink-0" dateTime={post.createdAt}>
                  {formatDate(post.createdAt)}
                </time>
              </p>
            </div>

            {/* Right side: Category badge + 3-dot menu */}
            <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <span className={cn(
                "inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-[2px] sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold uppercase tracking-wider border",
                catConfig.color
              )}>
                <CatIcon className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" />
                {catConfig.label}
              </span>

              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  aria-label="Post actions"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl dark:shadow-2xl dark:shadow-black/50 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {isOwner && (
                      <>
                        <Link
                          href={`/post/${post._id}/edit`}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          Edit
                        </Link>
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setIsDeleteModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                      </>
                    )}
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        copyShareLink();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Copy link
                    </button>
                    {!isOwner && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          if (!session) {
                            toast.error("Please login to report");
                            return;
                          }
                          setIsReportModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
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

          {/* ── BODY ────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            {post.title && (
              <h2 className="text-[15px] md:text-base font-semibold text-gray-900 dark:text-white leading-snug tracking-tight">
                {post.title}
              </h2>
            )}

            {/* Content with clamp */}
            <div className="relative">
              <div
                ref={contentRef}
                className={cn(
                  "text-[14px] text-gray-700 dark:text-white/80 leading-relaxed prose prose-sm prose-gray dark:prose-invert max-w-none break-words",
                  "prose-pre:my-0 prose-pre:bg-transparent prose-pre:border-0 prose-pre:p-0 prose-pre:rounded-none",
                  "prose-code:text-xs prose-code:text-primary-500 dark:prose-code:text-primary-400",
                  "prose-a:text-primary-500 dark:prose-a:text-primary-400 prose-a:no-underline hover:prose-a:underline",
                  "prose-blockquote:border-l-primary-500/50 prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-white/[0.02] prose-blockquote:py-0.5 prose-blockquote:px-3 prose-blockquote:not-italic prose-blockquote:text-gray-500 dark:prose-blockquote:text-white/60",
                  "prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-semibold prose-headings:text-sm",
                  "prose-ul:my-1 prose-ol:my-1 prose-li:my-0",
                  "prose-p:my-1",
                  `post-${post.category}`,
                  !expanded && "line-clamp-4"
                )}
              >
                <ReactMarkdown
                  rehypePlugins={[rehypeHighlight]}
                  remarkPlugins={[remarkGfm]}
                  components={{ pre: CodeBlock }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Show more / less */}
              {(isClamped || expanded) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(!expanded);
                    if (expanded && contentRef.current) {
                      setTimeout(() => {
                        const el = contentRef.current;
                        if (el) setIsClamped(el.scrollHeight > el.clientHeight + 2);
                      }, 0);
                    }
                  }}
                  className="mt-1 text-[13px] font-medium text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                >
                  {expanded ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          </div>

          {/* ── FOOTER ─────────────────────────────────── */}
          <div className="flex flex-col gap-2 mt-0.5">
            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=${tag}`}
                    className="text-[13px] font-medium text-primary-500/80 dark:text-primary-500/70 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Engagement row */}
            <div className="flex items-center border-t border-gray-100 dark:border-white/[0.04] pt-2 -mb-0.5" onClick={(e) => e.stopPropagation()}>
              {/* Like */}
              <button
                onClick={handleLike}
                className={cn(
                  "flex items-center gap-1.5 pr-4 transition-colors group/like",
                  liked ? "text-pink-500" : "text-gray-400 dark:text-white/35 hover:text-pink-500"
                )}
                title={liked ? "Unlike" : "Like"}
              >
                <div className="p-1.5 rounded-md group-hover/like:bg-pink-500/10 transition-colors">
                  <Heart className={cn("w-4 h-4", liked && "fill-current")} />
                </div>
                <span className="text-xs font-semibold tabular-nums">
                  {likesCount > 0 ? likesCount : ""}
                </span>
              </button>

              {/* Comment */}
              <div className="flex items-center gap-1.5 pr-4 text-gray-400 dark:text-white/35 hover:text-primary-500 dark:hover:text-primary-400 transition-colors group/comment cursor-pointer">
                <div className="p-1.5 rounded-md group-hover/comment:bg-primary-500/10 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold tabular-nums">
                  {post.commentsCount > 0 ? post.commentsCount : ""}
                </span>
              </div>

              {/* Share – pushed right */}
              <button
                onClick={handleShare}
                className="ml-auto p-1.5 rounded-md text-gray-400 dark:text-white/35 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* ── Share Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share inkVerse"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 512 512" fill="currentColor"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>, label: "X", color: "bg-black dark:bg-white text-white dark:text-black", onClick: () => window.open(`https://twitter.com/intent/tweet?text=Read this inkVerse&url=${window.location.origin}/post/${post?._id}`, "_blank") },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>, label: "WhatsApp", color: "bg-[#25D366] text-white", onClick: () => window.open(`https://api.whatsapp.com/send?text=Read this inkVerse: ${window.location.origin}/post/${post?._id}`, "_blank") },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, label: "Facebook", color: "bg-[#1877F2] text-white", onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/post/${post?._id}`, "_blank") },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, label: "Email", color: "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white", onClick: () => window.location.href = `mailto:?subject=Inkverse Zikr&body=Read this Zikr: ${window.location.origin}/post/${post?._id}` }
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} className="flex flex-col items-center gap-1.5 group active:opacity-70 transition-opacity">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-colors", btn.color)}>
                  {btn.icon}
                </div>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gray-100 dark:bg-white/5"></div>

          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Link</p>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl">
              <span className="flex-1 truncate font-medium text-sm text-gray-900 dark:text-white">
                {`${typeof window !== 'undefined' ? window.location.host : ''}/post/${post?._id?.substring(0, 7)}...`}
              </span>
              <button
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-all shadow-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>

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
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This action cannot be undone. This post will be permanently removed.
            </p>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Report Modal ────────────────────────────────── */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report Post"
      >
        <div className="space-y-4">
          <p className="text-gray-900 dark:text-white text-sm">
            Please describe why this post violates the community guidelines.
          </p>
          <div className="flex flex-col gap-2">
            {["Spam", "Abuse", "Other"].map(reason => (
              <button
                key={reason}
                onClick={() => setReportReason(reason)}
                className={cn(
                   "w-full h-10 rounded-xl border text-sm font-bold transition-all",
                   reportReason === reason
                     ? "bg-primary-50 dark:bg-primary-500/10 border-primary-500/50 text-primary-600 dark:text-primary-400"
                     : "bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
                )}
              >
                {reason}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="flex-1 h-10 px-4 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-medium text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={submitReport}
              disabled={isReporting || !reportReason.trim()}
              className="flex-1 h-10 px-4 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
            >
              {isReporting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
