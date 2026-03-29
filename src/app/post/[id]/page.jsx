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
  Trash2,
  Globe,
  Edit2
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

import Modal from "@/components/ui/Modal";

export default function PostPage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const copyShareLink = async () => {
    const shortUrl = `${window.location.origin}/s/${post?._id}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

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

  const handleShare = () => {
    setIsShareModalOpen(true);
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
            <div className="min-w-0 pr-4">
              <Link href={`/profile/${post.author?.username}`} className="flex items-center gap-3">
                <div className="w-10 h-10 min-w-[40px] flex-shrink-0 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-[15px] overflow-hidden hover:scale-105 transition-transform duration-300 shadow-md">
                  {post.author?.image ? (
                    <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    post.author?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[15px] font-bold text-gray-900 dark:text-gray-50 hover:underline truncate">
                    {post.author?.name}
                  </p>
                  <p className="text-[13px] text-gray-500 dark:text-[#8b949e] truncate">
                    @{post.author?.username}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm", catConfig.bgClass, catConfig.textClass)}>
                {catConfig.icon}
                {catConfig.label}
              </span>

              {isOwner && (
                <div className="flex items-center gap-1 bg-gray-50 dark:bg-[#1e293b]/50 rounded-lg p-0.5 mt-1">
                  <Link 
                    href={`/post/${post._id}/edit`} 
                    className="p-1.5 rounded-md hover:bg-white dark:hover:bg-[#30363d] text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm"
                  >
                    <Edit2 className="w-[13px] h-[13px]" />
                  </Link>
                  <button className="p-1.5 rounded-md hover:bg-white dark:hover:bg-[#30363d] text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors shadow-sm">
                    <Trash2 className="w-[13px] h-[13px]" />
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

          {/* Twitter-style Timestamp */}
          <div className="mt-8 mb-4 text-[15px] font-medium text-gray-500 dark:text-[#8b949e]">
            {formatDate(post.createdAt, true)}
          </div>

          {/* Minimal Footer */}
          <div className="flex items-center justify-between mt-4 sm:mt-6 pt-3 border-t border-gray-100 dark:border-[#1e293b]">
            <div className="flex items-center gap-4 sm:gap-8">
              <button
                onClick={handleLike}
                className={cn("flex flex-row items-center gap-1.5 transition-all duration-200 group whitespace-nowrap",
                  liked ? "text-pink-500" : "text-gray-500 dark:text-[#8b949e] hover:text-pink-600 dark:hover:text-pink-500"
                )}
              >
                <div className="p-2 rounded-full group-hover:bg-pink-50 dark:group-hover:bg-pink-500/10 transition-colors">
                  <Heart className={cn("w-[20px] h-[20px] transition-transform", liked && "fill-current")} />
                </div>
                <span className="text-[14px] font-bold">
                  {likesCount > 0 ? likesCount : ''}
                  <span className={cn("hidden min-[375px]:inline ml-1 font-medium", liked ? "text-pink-500" : "text-gray-500 dark:text-[#8b949e]")}>
                    likes
                  </span>
                </span>
              </button>
              
              <div
                className="flex flex-row items-center gap-1.5 text-gray-500 dark:text-[#8b949e] hover:text-blue-600 dark:hover:text-blue-400 transition-all group whitespace-nowrap cursor-pointer"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-colors">
                  <MessageSquare className="w-[20px] h-[20px]" />
                </div>
                <span className="text-[14px] font-bold">
                  {post.commentsCount > 0 ? post.commentsCount : ''}
                  <span className="hidden min-[375px]:inline ml-1 font-medium text-gray-500 dark:text-[#8b949e]">
                    comments
                  </span>
                </span>
              </div>
            </div>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 p-2 rounded-full text-gray-500 dark:text-[#8b949e] hover:text-green-600 dark:hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all group whitespace-nowrap ml-auto"
            >
              <Share2 className="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>
      </article>

      {/* Embedded Comments Section */}
      <CommentSection postId={resolvedParams.id} />

      {/* Custom Share Modal */}
      <Modal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        title="Share Zikr"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>, label: "X", color: "bg-black dark:bg-white text-white dark:text-black", onClick: () => window.open(`https://twitter.com/intent/tweet?text=Read this Zikr&url=${window.location.origin}/s/${post?._id}`, "_blank") },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.052 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>, label: "WhatsApp", color: "bg-[#25D366] text-white", onClick: () => window.open(`https://api.whatsapp.com/send?text=Read this Zikr: ${window.location.origin}/s/${post?._id}`, "_blank") },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>, label: "Facebook", color: "bg-[#1877F2] text-white", onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}/s/${post?._id}`, "_blank") },
              { icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>, label: "Email", color: "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white", onClick: () => window.location.href = `mailto:?subject=Inkverse Zikr&body=Read this Zikr: ${window.location.origin}/s/${post?._id}` }
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} className="flex flex-col items-center gap-2 group">
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 active:scale-95", btn.color)}>
                  {btn.icon}
                </div>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">{btn.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-4"></div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Link</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl relative group">
              <span className="flex-1 truncate font-medium text-sm text-gray-900 dark:text-white">
                {`${typeof window !== 'undefined' ? window.location.host : ''}/s/${post?._id}`}
              </span>
              <button 
                onClick={copyShareLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/20"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
