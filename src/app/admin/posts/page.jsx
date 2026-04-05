"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, Trash2, X, AlertTriangle } from "lucide-react";
import { cn, formatDate, POST_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (category !== "all") params.set("category", category);

      const res = await fetch(`/api/admin/posts?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts); 
      setPagination(data.pagination);
    } catch { 
      toast.error("Could not load posts"); 
    }
    finally { 
      setLoading(false); 
    }
  }, [page, searchQuery, category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const onSearch = (e) => {
    e.preventDefault();
    setSearchQuery(q);
    setPage(1);
  };

  const confirmDelete = (post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postToDelete._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Post removed permanently.");
      setPosts(posts.filter(p => p._id !== postToDelete._id));
      setDeleteModalOpen(false);
    } catch (e) {
      toast.error(e.message || "Failed to remove post.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 lg:px-0">
      <form onSubmit={onSearch} className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-[#1B1A55]/60 p-2 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 shadow-sm backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search content or title…"
            className="w-full pl-11 pr-4 h-10 rounded-lg bg-gray-50 dark:bg-black/20 border border-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500/40 transition-all font-medium" 
          />
        </div>
        <select 
          value={category} 
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="h-10 px-4 rounded-lg bg-gray-50 dark:bg-black/20 border border-transparent text-sm text-gray-900 dark:text-white font-bold focus:outline-none max-w-[200px]"
        >
          <option value="all">All Categories</option>
          {POST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button type="submit" className="px-6 h-10 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95">Search</button>
      </form>

      {/* MOBILE Layout (Cards) */}
      <div className="block lg:hidden space-y-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-40 bg-white dark:bg-[#1B1A55]/60 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 animate-pulse" />
        )) : posts.length === 0 ? (
          <div className="py-10 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">No posts found</div>
        ) : posts.map(post => (
          <div key={post._id} className="bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-5 shadow-sm flex flex-col gap-3 backdrop-blur-xl">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-[10px] font-black shrink-0 overflow-hidden text-primary-600 dark:text-primary-400">
                     {post.author ? (
                       <img src={post.author.image || "/default-avatar.png"} onError={(e) => { e.target.src = "/default-avatar.png" }} className="w-full h-full object-cover" alt="Avatar"/>
                     ) : (
                       "?"
                     )}
                   </div>
                   <div className="min-w-0">
                     <p className="text-sm text-gray-900 dark:text-white font-bold truncate max-w-[150px]">@{post.author?.username}</p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest">{formatDate(post.createdAt, true)}</p>
                   </div>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-[10px] bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tight">{post.category}</span>
             </div>
             
             <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug line-clamp-2 italic">
               "{post.title || post.content}"
             </p>

             <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
               <span>{post.likes?.length ?? 0} Likes</span>
               <span>{post.comments?.length ?? 0} Comments</span>
             </div>

             <div className="flex flex-col sm:flex-row gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-white/5">
                <Link href={`/post/${post._id}`} target="_blank" className="flex-1 h-10 border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all w-full">
                  <Eye className="w-3.5 h-3.5"/> View
                </Link>
                <button onClick={() => confirmDelete(post)} className="flex-1 h-10 border border-red-500/30 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95 transition-all w-full">
                  <Trash2 className="w-3.5 h-3.5"/> Delete
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* DESKTOP Layout (Tables) */}
      <div className="hidden lg:block rounded-2xl bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 overflow-hidden shadow-sm backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/10">
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Content Snippet</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Metrics</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#535C91]/10">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-gray-100 dark:bg-white/5 rounded-lg w-full"></div></td>
                </tr>
              )) : posts.map((post) => (
                <tr key={post._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-500/20 flex items-center justify-center text-[11px] font-black shrink-0 overflow-hidden text-primary-600 dark:text-primary-400">
                         {post.author ? (
                           <img src={post.author.image || "/default-avatar.png"} onError={(e) => { e.target.src = "/default-avatar.png" }} className="w-full h-full object-cover" alt="Avatar"/>
                         ) : (
                           "?"
                         )}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-bold text-gray-900 dark:text-white truncate">@{post.author?.username}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{post.author?.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[250px]">
                     <p className="truncate text-xs text-gray-600 dark:text-gray-300 italic">"{(post.title || post.content || "").substring(0, 80)}"</p>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2.5 py-1 rounded-lg text-[10px] bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest">{post.category}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 dark:text-gray-400 tabular-nums font-bold">
                     <span className="text-rose-500">{post.likes?.length ?? 0}</span> L · <span className="text-blue-500">{post.comments?.length ?? 0}</span> C
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums uppercase tracking-widest">{formatDate(post.createdAt, true)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/post/${post._id}`} target="_blank" className="h-9 px-3 rounded-lg border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-[11px] transition-all">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                      <button onClick={() => confirmDelete(post)} className="h-9 px-3 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-500/10 flex items-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold text-[11px] transition-all">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 pb-8">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-10 px-4 rounded-lg font-bold text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-[#535C91]/30 text-gray-500 dark:text-gray-400 disabled:opacity-30">Prev</button>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase">Page {page} of {pagination.pages}</span>
          <button disabled={!pagination.hasMore} onClick={() => setPage((p) => p + 1)} className="h-10 px-4 rounded-lg font-bold text-sm bg-white dark:bg-black/20 border border-gray-200 dark:border-[#535C91]/30 text-gray-500 dark:text-gray-400 disabled:opacity-30">Next</button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Destroy Post">
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
             <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
             <div>
                <p className="text-sm font-bold text-red-900 dark:text-red-400">Are you absolutely sure?</p>
                <p className="text-xs text-red-700 dark:text-red-500/80 mt-1 leading-relaxed">This action cannot be undone. The post will be permanently deleted from the database along with all its likes and comments.</p>
             </div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-white/5 mt-4 pt-4">
             <button onClick={() => setDeleteModalOpen(false)} className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancel</button>
             <button onClick={executeDelete} disabled={isDeleting} className="flex-1 h-10 rounded-lg bg-red-600 text-white font-bold text-sm shadow-sm hover:bg-red-700 transition disabled:opacity-50 flex justify-center items-center gap-2">
               {isDeleting ? "Destroying..." : <><Trash2 className="w-4 h-4"/> Destroy Payload</>}
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
