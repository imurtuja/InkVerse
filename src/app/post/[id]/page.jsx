"use client";

import { useState, useEffect, use } from "react";
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
  Code2,
  Feather,
  Quote,
  Music,
  StickyNote,
  Globe,
  Edit2,
  Trash2
} from "lucide-react";
import CommentSection from "@/components/posts/CommentSection";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const categoryDisplay = {
  dev: { label: "Code", bgClass: "bg-[#1e3a8a]", textClass: "text-[#93c5fd]", icon: <Code2 className="w-3 h-3" /> },
  poetry: { label: "Poetry", bgClass: "bg-[#6b21a8]", textClass: "text-[#d8b4fe]", icon: <Feather className="w-3 h-3" /> },
  quote: { label: "Quote", bgClass: "bg-[#b45309]", textClass: "text-[#fcd34d]", icon: <Quote className="w-3 h-3" /> },
  song: { label: "Song", bgClass: "bg-[#047857]", textClass: "text-[#6ee7b7]", icon: <Music className="w-3 h-3" /> },
  note: { label: "Note", bgClass: "bg-[#4338ca]", textClass: "text-[#a5b4fc]", icon: <StickyNote className="w-3 h-3" /> },
  other: { label: "General", bgClass: "bg-[#334155]", textClass: "text-[#cbd5e1]", icon: <Globe className="w-3 h-3" /> },
};

export default function PostPage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    fetchPost();
  }, [resolvedParams.id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/posts/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
        setLiked(data.post.likes?.includes(session?.user?.id));
        setLikesCount(data.post.likes?.length || 0);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session) return toast.error("Please login to like");
    setLiked(!liked);
    setLikesCount((c) => (liked ? c - 1 : c + 1));
    try {
      await fetch(`/api/posts/${resolvedParams.id}/like`, { method: "POST" });
    } catch {
      setLiked(liked);
      setLikesCount(post.likes?.length || 0);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Check out this post", url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      }
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white/40 dark:bg-[#030712]/10 backdrop-blur-md border border-gray-100 dark:border-[#1e293b]/30 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-[#1e293b] animate-pulse" />
            <div className="space-y-2 flex-1"><div className="h-4 w-1/3 bg-gray-200 dark:bg-[#1e293b] rounded animate-pulse" /><div className="h-3 w-1/4 bg-gray-200 dark:bg-[#1e293b] rounded animate-pulse" /></div>
          </div>
          <div className="h-40 bg-gray-100/50 dark:bg-[#1e293b]/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Post not found</h2>
        <Link href="/feed" className="text-blue-500 hover:underline">← Back to Feed</Link>
      </div>
    );
  }

  const isOwner = session?.user?.id === (post.author?._id || post.author);
  const catConfig = categoryDisplay[post.category] || categoryDisplay.other;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-gray-900 dark:text-gray-100">
      {/* Back to feed */}
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-[15px] font-bold text-blue-600 dark:text-blue-400 hover:underline transition-colors ml-2">
        <ChevronLeft className="w-4 h-4" /> Back to feed
      </Link>

      {/* Post container */}
      <article className="bg-white/60 dark:bg-[#030712]/40 backdrop-blur-xl border border-gray-200/60 dark:border-[#1e293b]/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="p-6 md:p-8">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <Link href={`/profile/${post.author?.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-[15px] overflow-hidden">
                {post.author?.image ? (
                  <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  post.author?.name?.[0]?.toUpperCase()
                )}
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 dark:text-gray-50 hover:underline">
                  {post.author?.name}
                </p>
                <p className="text-[13px] text-gray-500 dark:text-[#8b949e]">
                  @{post.author?.username} · {formatDate(post.createdAt, true)}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm", catConfig.bgClass, catConfig.textClass)}>
                {catConfig.icon}
                {catConfig.label}
              </span>

              {isOwner && (
                <div className="flex items-center gap-1 ml-2 border-l border-gray-200 dark:border-[#1e293b] pl-3">
                  <Link 
                    href={`/post/${post._id}/edit`} 
                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e293b] text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                  >
                    <Edit2 className="w-[15px] h-[15px]" />
                  </Link>
                  <button className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e293b] text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-[15px] h-[15px]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
              {post.title}
            </h1>
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6 pt-1">
              {post.tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/search?q=${tag}`} 
                  className="text-[12px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-[#1e293b] hover:bg-gray-200 dark:hover:bg-[#30363d] px-2.5 py-0.5 rounded-full font-medium transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Content Body */}
          <div className={cn(
            "text-[15px] text-gray-700 dark:text-[#e2e8f0] leading-relaxed prose-invert prose-p:my-4 prose-pre:my-6 max-w-none break-words",
            "prose-pre:bg-gray-50 dark:prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-[#30363d] prose-pre:rounded-xl prose-a:text-blue-600 dark:prose-a:text-blue-400",
            `post-${post.category}`
          )}>
            <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Minimal Footer */}
          <div className="flex items-center gap-8 mt-8 pt-5 border-t border-gray-100 dark:border-[#1e293b]">
            <button
              onClick={handleLike}
              className={cn("flex items-center gap-2 text-[14px] transition-all duration-200",
                liked ? "text-pink-500" : "text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Heart className={cn("w-[17px] h-[17px] transition-transform", liked && "fill-current scale-110")} />
              <span className="font-medium">{likesCount} likes</span>
            </button>
            <div className="flex items-center gap-2 text-[14px] text-gray-500 dark:text-[#8b949e]">
              <MessageSquare className="w-[17px] h-[17px]" />
              <span className="font-medium">{post.commentsCount || 0} comments</span>
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-[14px] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white transition-colors ml-auto"
            >
              <Share2 className="w-[17px] h-[17px]" />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>
      </article>

      {/* Embedded Comments Section */}
      <CommentSection postId={resolvedParams.id} />
    </div>
  );
}
