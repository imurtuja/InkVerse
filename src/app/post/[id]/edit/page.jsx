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
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="h-8 w-48 skeleton mb-6" />
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="h-12 skeleton" />
          <div className="h-64 skeleton" />
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="w-full">
      <PostEditor initialData={post} isEdit />
    </div>
  );
}
