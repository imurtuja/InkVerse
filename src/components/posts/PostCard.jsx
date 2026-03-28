"use client";

import Link from "next/link";
import { useState } from "react";
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

const categoryDisplay = {
  code: { label: "Code", bgClass: "bg-[#1e3a8a]", textClass: "text-[#93c5fd]", icon: <Code2 className="w-3 h-3" /> },
  poetry: { label: "Poetry", bgClass: "bg-[#6b21a8]", textClass: "text-[#d8b4fe]", icon: <Feather className="w-3 h-3" /> },
  quote: { label: "Quote", bgClass: "bg-[#b45309]", textClass: "text-[#fcd34d]", icon: <Quote className="w-3 h-3" /> },
  shayri: { label: "Shayri", bgClass: "bg-[#9d174d]", textClass: "text-[#fbcfe8]", icon: <Book className="w-3 h-3" /> },
  song: { label: "Song", bgClass: "bg-[#047857]", textClass: "text-[#6ee7b7]", icon: <Music className="w-3 h-3" /> },
  note: { label: "Note", bgClass: "bg-[#4338ca]", textClass: "text-[#a5b4fc]", icon: <StickyNote className="w-3 h-3" /> },
  general: { label: "General", bgClass: "bg-[#334155]", textClass: "text-[#cbd5e1]", icon: <Globe className="w-3 h-3" /> },
};

export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(post.likes?.includes(session?.user?.id));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = session?.user?.id === (post.author?._id || post.author);
  const catConfig = categoryDisplay[post.category] || categoryDisplay.general;

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

  const copyShareLink = async () => {
    const shortUrl = `${window.location.origin}/s/${post._id}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Short link copied!");
    } catch {
      toast.error("Failed to copy");
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

  return (
    <>
      <article 
        onClick={handleCardClick}
        className="group bg-white/60 dark:bg-[#030712]/40 backdrop-blur-xl border border-gray-200/60 dark:border-[#1e293b]/60 hover:border-blue-500/30 dark:hover:border-[#1e293b] hover:bg-white/80 dark:hover:bg-[#030712]/60 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40 rounded-2xl overflow-hidden transition-all duration-300 text-gray-900 dark:text-gray-100 ease-out cursor-pointer"
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div onClick={(e) => e.stopPropagation()}>
              <Link href={`/profile/${post.author?.username}`} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-[15px] overflow-hidden hover:scale-105 transition-transform duration-300">
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
                  <p className="text-[13px] text-gray-400 dark:text-[#8b949e]">
                    @{post.author?.username} · {formatDate(post.createdAt)}
                  </p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase shadow-sm", catConfig.bgClass, catConfig.textClass)}>
                {catConfig.icon}
                {catConfig.label}
              </span>
              
              {isOwner && (
                <div className="hidden sm:flex items-center gap-1 ml-2 border-l border-gray-100 dark:border-[#1e293b] pl-3">
                  <Link 
                    href={`/post/${post._id}/edit`} 
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/40 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all hover:scale-110 active:scale-95"
                    title="Edit Post"
                  >
                    <Edit2 className="w-[15px] h-[15px]" />
                  </Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }} 
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 text-gray-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95"
                    title="Delete Post"
                  >
                    <Trash2 className="w-[15px] h-[15px]" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          {post.title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h2>
          )}

          {/* Content Body */}
          <div className={cn(
            "text-[15px] text-gray-700 dark:text-[#e2e8f0] leading-relaxed prose-invert max-w-none break-words",
            "prose-pre:bg-gray-50 dark:prose-pre:bg-white/[0.04] prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-[#30363d] prose-pre:rounded-xl prose-a:text-blue-600 dark:prose-a:text-blue-400",
            `post-${post.category}`
          )}>
            <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
              {post.content?.length > 700 ? post.content.substring(0, 700) + "..." : post.content}
            </ReactMarkdown>
          </div>

          {/* Tags - Capsule Style with Hover */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5" onClick={(e) => e.stopPropagation()}>
              {post.tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/search?q=${tag}`} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-white/5 hover:bg-blue-50 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800/50 transition-all duration-200"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Minimal Footer */}
          <div className="flex items-center gap-4 sm:gap-8 mt-6 pt-5 border-t border-gray-100 dark:border-[#1e293b]">
            <button
              onClick={handleLike}
              className={cn("flex items-center gap-2 p-1 text-sm transition-all duration-200 hover:scale-110 active:scale-95",
                liked ? "text-pink-500" : "text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Heart className={cn("w-[18px] h-[18px] transition-transform", liked && "fill-current")} />
              <span className="font-bold hidden xs:inline">{likesCount} likes</span>
              <span className="font-bold xs:hidden">{likesCount}</span>
            </button>
            
            <div
              className="flex items-center gap-2 p-1 text-sm text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all"
            >
              <MessageSquare className="w-[18px] h-[18px]" />
              <span className="font-bold hidden xs:inline">{post.commentsCount || 0} comments</span>
              <span className="font-bold xs:hidden">{post.commentsCount || 0}</span>
            </div>

            {isOwner && (
              <div className="flex sm:hidden items-center gap-2 border-l border-gray-100 dark:border-[#1e293b] pl-3" onClick={(e) => e.stopPropagation()}>
                <Link 
                  href={`/post/${post._id}/edit`} 
                  className="p-1 rounded-md text-gray-400 hover:text-blue-600 transition-all hover:scale-110"
                >
                  <Edit2 className="w-[17px] h-[17px]" />
                </Link>
                <button 
                  onClick={() => setIsDeleteModalOpen(true)} 
                  className="p-1 rounded-md text-gray-400 hover:text-red-500 transition-all hover:scale-110"
                >
                  <Trash2 className="w-[17px] h-[17px]" />
                </button>
              </div>
            )}
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 p-1 text-sm text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110 ml-auto"
            >
              <Share2 className="w-[18px] h-[18px]" />
              <span className="font-bold hidden xs:inline">Share</span>
            </button>
          </div>
        </div>
      </article>

      {/* Custom Share Modal */}
      <Modal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        title="Share Zikr"
      >
        <div className="space-y-6">
          <p className="text-gray-500 dark:text-gray-400 font-medium">Use this short link to share this piece of the verse:</p>
          <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-black/40 border border-gray-100 dark:border-white/5 rounded-2xl">
            <span className="flex-1 truncate font-mono text-sm text-blue-600 dark:text-blue-400">
              {`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${post._id}`}
            </span>
            <button 
              onClick={copyShareLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all active:scale-95"
            >
              Copy
            </button>
          </div>
          <div className="flex justify-center gap-4 pt-2">
            {/* Social icons could go here */}
            <p className="text-[11px] text-gray-400 dark:text-gray-600 uppercase font-bold tracking-widest leading-none">Powered by InkVerse Shortener</p>
          </div>
        </div>
      </Modal>

      {/* Custom Delete Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Delete Post?"
      >
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trash2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <p className="text-gray-900 dark:text-white font-bold text-lg">Are you absolutely sure?</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              This action cannot be undone. This zikr will be permanently removed from the verse.
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 hover:scale-[1.02] disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete Post"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
