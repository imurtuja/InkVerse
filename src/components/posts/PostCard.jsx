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

  const copyShareLink = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${post?._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied!");
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
className="group bg-white/[0.02] border border-white/10 shadow-xl shadow-black/40 rounded-2xl overflow-hidden transition-colors duration-200 text-gray-100 cursor-pointer w-full hover:bg-black/20"      >
        <div className="p-3 flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div onClick={(e) => e.stopPropagation()} className="min-w-0 pr-3 flex-1 flex items-center gap-2">
              <Link href={`/profile/${post.author?.username}`} className="flex-shrink-0 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-[10px] overflow-hidden shadow-sm">
                  {post.author?.image ? (
                    <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    post.author?.name?.[0]?.toUpperCase()
                  )}
                </div>
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${post.author?.username}`}
                  className="block text-[15px] font-semibold leading-snug text-white [overflow-wrap:anywhere] hover:text-primary-400"
                >
                  {post.author?.name}
                </Link>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[15px] font-light leading-snug text-white/60">
                  <span className="min-w-0 break-all">@{post.author?.username}</span>
                  <span className="text-white/25" aria-hidden>
                    •
                  </span>
                  <time className="whitespace-nowrap text-white/60" dateTime={post.createdAt}>
                    {formatDate(post.createdAt)}
                  </time>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[14px] font-semibold tracking-tight uppercase", catConfig.bgClass, catConfig.textClass)}>
                {catConfig.icon}
                {catConfig.label}
              </span>
              
              {isOwner && (
                <div className="flex items-center gap-0.5">
                  <Link 
                    href={`/post/${post._id}/edit`} 
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-primary-500 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }} 
                    className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="flex flex-col gap-2">
            {post.title && (
              <h2 className="text-[15px] font-bold text-white leading-snug">
                {post.title}
              </h2>
            )}

            <div className="relative">
              <div className={cn(
              "text-[15px] text-white/90 leading-relaxed prose prose-sm md:prose-base prose-invert max-w-none break-words",
              "prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-pre:text-[15px] prose-code:text-[15px] prose-a:text-primary-500 prose-blockquote:border-l-primary-500 prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:px-3",
              "prose-headings:text-white prose-headings:font-semibold prose-headings:tracking-tight",
              `post-${post.category}`
            )}>
                <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                  {post.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center" onClick={(e) => e.stopPropagation()}>
              {post.tags.map((tag) => (
                <Link 
                  key={tag} 
                  href={`/search?q=${tag}`} 
                  className="text-[15px] font-medium text-primary-500/80 hover:text-primary-400 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Footer Interactions */}
          <div className="flex items-center gap-5 mt-1 border-t border-white/5 pt-3">
            <button
              onClick={handleLike}
              className={cn("flex items-center gap-1.5 text-s font-semibold transition-colors group/btn",
                liked ? "text-pink-500" : "text-white/40 hover:text-pink-500"
              )}
              title={liked ? "Unlike" : "Like"}
            >
              <div className="p-2 rounded-lg group-hover/btn:bg-pink-500/10 transition-colors">
                <Heart className={cn("w-4.5 h-4.5 transition-all text-pink-500", liked && "fill-current")} />
              </div>
              {likesCount > 0 && <span className="tabular-nums">{likesCount}</span>}
            </button>
            
            <div 
              className="flex items-center gap-1.5 text-white/40 hover:text-primary-500 transition-colors text-s font-semibold cursor-pointer group/btn"
              title="Comments"
            >
              <div className="p-2 rounded-lg group-hover/btn:bg-primary-500/10 transition-colors">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              {post.commentsCount > 0 && <span className="tabular-nums">{post.commentsCount}</span>}
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-lg text-white/40 hover:text-primary-500 hover:bg-white/5 transition-colors ml-auto"
              title="Share"
            >
              <Share2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </article>

      {/* Share Modal */}
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
            <p className="text-[15px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Short Link</p>
            <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl">
              <span className="flex-1 truncate font-medium text-[15px] text-gray-900 dark:text-white">
                {`${typeof window !== 'undefined' ? window.location.host : ''}/post/${post?._id?.substring(0, 7)}...`}
              </span>
              <button 
                onClick={copyShareLink}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all shadow-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
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
              This action cannot be undone. This zikr will be permanently removed from the verse.
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
    </>
  );
}
