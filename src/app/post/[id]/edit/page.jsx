"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PostEditor from "@/components/posts/PostEditor";
import toast from "react-hot-toast";

export default function EditPostPage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.post.author._id !== session?.user?.id && session?.user?.role !== "admin") {
            toast.error("Not authorized");
            router.push("/feed");
            return;
          }
          setPost(data.post);
        } else {
          toast.error("Post not found");
          router.push("/feed");
        }
      } catch {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    };
    if (session) fetchPost();
  }, [resolvedParams.id, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] pt-20">
        <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse space-y-4">
          <div className="h-4 w-24 bg-white/5 rounded"></div>
          <div className="h-[400px] w-full bg-white/[0.02] border border-white/10 rounded-2xl shadow-xl shadow-black/20"></div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 pb-[120px] md:pb-8">
      <PostEditor initialData={post} isEdit />
    </div>
  );
}
