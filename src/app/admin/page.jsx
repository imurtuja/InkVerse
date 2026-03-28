"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  Users,
  FileText,
  Trash2,
  Eye,
  AlertTriangle,
  Activity,
  TrendingUp,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posts");

  useEffect(() => {
    if (session && session.user?.role !== "admin") {
      toast.error("Access denied");
      router.push("/feed");
      return;
    }
    fetchPosts();
  }, [session, router]);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts?limit=50");
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Post deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (session?.user?.role !== "admin") return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="w-6 h-6 text-amber-500" />
        Admin Dashboard
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Posts", value: posts.length, icon: FileText, color: "from-blue-500 to-cyan-500" },
          { label: "Active Users", value: "—", icon: Users, color: "from-emerald-500 to-teal-500" },
          { label: "Reports", value: 0, icon: AlertTriangle, color: "from-amber-500 to-orange-500" },
          { label: "Growth", value: "—", icon: TrendingUp, color: "from-purple-500 to-pink-500" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-4">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Posts Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <h2 className="font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4" /> All Posts
          </h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-12 skeleton" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3">Author</th>
                  <th className="px-6 py-3">Content</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Likes</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                          {post.author?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium">{post.author?.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 max-w-xs truncate text-gray-500">{post.content?.substring(0, 50)}...</td>
                    <td className="px-6 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">{post.category}</span></td>
                    <td className="px-6 py-3">{post.likes?.length || 0}</td>
                    <td className="px-6 py-3 text-gray-400 text-xs">{formatDate(post.createdAt)}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-1">
                        <a href={`/post/${post._id}`} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </a>
                        <button onClick={() => deletePost(post._id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
