"use client";

import { useEffect, useState, use } from "react";
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
  Code2, 
  Feather, 
  Quote, 
  Music, 
  StickyNote, 
  Globe, 
  Book 
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import CommentSection from "@/components/posts/CommentSection";

const categoryDisplay = {
  code: { label: "Code", bgClass: "bg-[#1e3a8a]", textClass: "text-[#93c5fd]", icon: <Code2 className="w-3 h-3" /> },
  poetry: { label: "Poetry", bgClass: "bg-[#6b21a8]", textClass: "text-[#d8b4fe]", icon: <Feather className="w-3 h-3" /> },
  quote: { label: "Quote", bgClass: "bg-[#b45309]", textClass: "text-[#fcd34d]", icon: <Quote className="w-3 h-3" /> },
  shayri: { label: "Shayri", bgClass: "bg-[#9d174d]", textClass: "text-[#fbcfe8]", icon: <Book className="w-3 h-3" /> },
  song: { label: "Song", bgClass: "bg-[#047857]", textClass: "text-[#6ee7b7]", icon: <Music className="w-3 h-3" /> },
  note: { label: "Note", bgClass: "bg-[#4338ca]", textClass: "text-[#a5b4fc]", icon: <StickyNote className="w-3 h-3" /> },
  general: { label: "General", bgClass: "bg-[#334155]", textClass: "text-[#cbd5e1]", icon: <Globe className="w-3 h-3" /> },
};

export default function PostPage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

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

  if (loading) return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!post) return null;

  const isOwner = session?.user?.id === (post.author?._id || post.author);
  const catConfig = categoryDisplay[post.category] || categoryDisplay.general;

  return (
    <main className="min-h-screen bg-[#030712]">
      <Navbar />
      
      <div className="mt-3 pb-24 md:pb-16 max-w-3xl mx-auto px-3 space-y-4">
        {/* Back to feed */}
        <Link href="/feed" className="inline-flex items-center gap-1.5 text-s font-medium text-white/40 hover:text-white transition-colors ml-1">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to feed
        </Link>

        {/* Post container with Surface Styling */}
        <article className="bg-[#0B1120] border border-white/10 rounded-2xl overflow-hidden transition-all duration-300">
          <div className="p-4 space-y-3">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="min-w-0 pr-4 flex-1 flex items-center gap-3">
                <Link href={`/profile/${post.author?.username}`} className="flex-shrink-0 transition-opacity">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-[11px] overflow-hidden shadow-sm">
                    {post.author?.image ? (
                      <img src={post.author.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      post.author?.name?.[0]?.toUpperCase()
                    )}
                  </div>
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link href={`/profile/${post.author?.username}`} className="text-[15px] font-semibold text-white hover:text-primary-400 transition-colors truncate leading-none">
                    {post.author?.name}
                  </Link>
                  <p className="text-[15px] text-white/60 truncate mt-1">
                    @{post.author?.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[14px] font-medium tracking-tight uppercase", catConfig.bgClass, catConfig.textClass)}>
                  {catConfig.icon}
                  {catConfig.label}
                </span>

                {isOwner && (
                  <div className="flex items-center gap-1">
                    <Link 
                      href={`/post/${post._id}/edit`} 
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-primary-500 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Title & Tags Hierarchy Check */}
            {post.title && (
              <h1 className="text-2xl md:text-3xl font-semibold text-white leading-tight tracking-tight">
                {post.title}
              </h1>
            )}

            {/* Tags moved below title */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 pb-2">
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

            {/* Content Body with Synchronized Markdown Classes */}
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

            {/* Timestamp */}
            <div className="mt-8 flex items-center gap-2 text-[13px] font-medium text-white/30 border-t border-white/5 pt-4 tracking-wide uppercase">
              <span>{formatDate(post.createdAt, true)}</span>
              <span className="opacity-30">•</span>
              <span className="text-white/20">inkVerse</span>
            </div>

            {/* Footer Interactions */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleLike}
                  className={cn("flex flex-row items-center gap-1.5 transition-colors duration-200 group/btn",
                    liked ? "text-pink-500" : "text-white/40 hover:text-pink-500"
                  )}
                >
                  <div className="p-2 rounded-lg group-hover/btn:bg-pink-500/10 transition-colors">
                    <Heart className={cn("w-4.5 h-4.5 transition-all text-pink-500", liked && "fill-current")} />
                  </div>
                  {likesCount > 0 && <span className="text-s font-semibold tabular-nums">{likesCount}</span>}
                </button>
                
                <div
                  className="flex items-center gap-1.5 text-white/40 hover:text-primary-500 transition-colors group/btn cursor-pointer"
                >
                  <div className="p-2 rounded-lg group-hover/btn:bg-primary-500/10 transition-colors">
                    <MessageSquare className="w-4.5 h-4.5" />
                  </div>
                  {post.commentsCount > 0 && <span className="text-s font-semibold tabular-nums">{post.commentsCount}</span>}
                </div>
              </div>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-white/40 hover:text-primary-500 hover:bg-white/5 transition-all ml-auto"
              >
                <Share2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </article>

        {/* Flat Comment Section */}
        <div className="pt-2">
          <CommentSection postId={resolvedParams.id} />
        </div>
      </div>

      <MobileNav />
    </main>
  );
}
