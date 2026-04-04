"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, FileText, Trash2, Eye, LayoutDashboard, Search,
  RefreshCw, MessageSquare, Crown, ChevronLeft, ChevronRight, Pencil, X, Menu,
} from "lucide-react";
import { cn, formatDate, POST_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";
const tabs = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "posts", label: "Posts", icon: FileText },
];

export default function AdminPage() {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [appliedUserQ, setAppliedUserQ] = useState("");
  const [postInput, setPostInput] = useState("");
  const [appliedPostQ, setAppliedPostQ] = useState("");
  const [postCategory, setPostCategory] = useState("all");
  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [userPagination, setUserPagination] = useState(null);
  const [postPagination, setPostPagination] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", username: "", bio: "", image: "" });
  const [savingUser, setSavingUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editPost, setEditPost] = useState(null);
  const [postEditForm, setPostEditForm] = useState({ title: "", content: "", category: "", tags: "" });
  const [savingPost, setSavingPost] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(null); // { id, label, type: 'user' | 'post' }

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch { toast.error("Could not load stats"); }
    finally { setLoadingStats(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page: String(userPage), limit: "12" });
      if (appliedUserQ.trim()) params.set("q", appliedUserQ.trim());
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users); setUserPagination(data.pagination);
    } catch { toast.error("Could not load users"); }
    finally { setLoadingUsers(false); }
  }, [userPage, appliedUserQ]);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams({ page: String(postPage), limit: "15" });
      if (appliedPostQ.trim()) params.set("q", appliedPostQ.trim());
      if (postCategory !== "all") params.set("category", postCategory);
      const res = await fetch(`/api/admin/posts?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPosts(data.posts); setPostPagination(data.pagination);
    } catch { toast.error("Could not load posts"); }
    finally { setLoadingPosts(false); }
  }, [postPage, appliedPostQ, postCategory]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (tab === "users") fetchUsers(); }, [tab, fetchUsers]);
  useEffect(() => { if (tab === "posts") fetchPosts(); }, [tab, fetchPosts]);

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    try {
      const url = type === "user" ? `/api/admin/users/${id}` : `/api/posts/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { toast.error(data.error || `Could not delete ${type}`); return; }
      
      if (type === "user") {
        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success("User removed");
      } else {
        setPosts((prev) => prev.filter((p) => p._id !== id));
        toast.success("Post removed");
      }
      fetchStats();
    } catch { toast.error(`Failed to delete ${type}`); }
    finally { setConfirmDelete(null); }
  };

  const openEditPost = (p) => {
    setEditPost(p);
    setPostEditForm({
      title: p.title || "",
      content: p.content || "",
      category: p.category || "general",
      tags: p.tags?.join(", ") || ""
    });
  };

  const saveEditPost = async (e) => {
    e.preventDefault();
    if (!editPost) return;
    setSavingPost(true);
    try {
      const tags = postEditForm.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);
      const res = await fetch(`/api/posts/${editPost._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...postEditForm, tags }),
      });
      if (!res.ok) throw new Error();
      toast.success("Post updated");
      setEditPost(null);
      fetchPosts();
    } catch { toast.error("Failed to update post"); }
    finally { setSavingPost(false); }
  };

  const onUserSearch = (e) => { e.preventDefault(); setAppliedUserQ(userInput.trim()); setUserPage(1); };
  const onPostSearch = (e) => { e.preventDefault(); setAppliedPostQ(postInput.trim()); setPostPage(1); };

  const Sidebar = () => (
    <aside className={cn(
      "fixed top-0 left-0 z-40 h-screen w-56 bg-[#020617] border-r border-gray-800 flex flex-col transition-transform duration-200",
      "md:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex items-center gap-2 px-4 h-12 border-b border-gray-800 flex-shrink-0">
        <Shield className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-bold text-white uppercase tracking-wider">InkVerse Admin</span>
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200",
                tab === t.id ? "bg-primary-500/15 text-primary-400 font-bold" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              )}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">System v1.2</p>
      </div>
    </aside>
  );

  const Pagination = ({ pagination, page, setPage }) => (
    pagination && pagination.pages > 1 && (
      <div className="flex items-center justify-center gap-4 py-6">
        <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-xl border border-gray-800 bg-[#020617] disabled:opacity-20 text-gray-400 hover:text-white transition-all"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-xs font-bold text-gray-500 tabular-nums">Page {page} / {pagination.pages}</span>
        <button disabled={!pagination.hasMore} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-xl border border-gray-800 bg-[#020617] disabled:opacity-20 text-gray-400 hover:text-white transition-all"><ChevronRight className="w-4 h-4" /></button>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-300">
      <Sidebar />
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="md:ml-56">
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-14 px-4 bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 rounded-xl hover:bg-white/5 text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">{tab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchStats} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-all active:opacity-70 duration-500"><RefreshCw className={cn("w-4 h-4", loadingStats && "animate-spin")} /></button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-[11px] font-bold text-white shadow-lg shadow-primary-500/20">AD</div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {tab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Users", value: stats?.usersCount ?? 0, icon: Users, color: "text-blue-400 bg-blue-500/10 shadow-blue-500/5" },
                    { label: "Posts", value: stats?.postsCount ?? 0, icon: FileText, color: "text-emerald-400 bg-emerald-500/10 shadow-emerald-500/5" },
                    { label: "Comments", value: stats?.commentsCount ?? 0, icon: MessageSquare, color: "text-violet-400 bg-violet-500/10 shadow-violet-500/5" },
                    { label: "Admins", value: stats?.adminsCount ?? 0, icon: Crown, color: "text-amber-400 bg-amber-500/10 shadow-amber-500/5" },
                  ].map((s) => (
                    <div key={s.label} className="p-4 rounded-2xl bg-[#020617] border border-gray-800 hover:border-gray-700 transition-all shadow-xl">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-inner", s.color)}><s.icon className="w-5 h-5" /></div>
                      <p className="text-2xl font-black text-white tabular-nums tracking-tight">{loadingStats ? "…" : s.value}</p>
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tab === "users" && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <form onSubmit={onUserSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Search name, username, email…"
                      className="w-full pl-10 pr-4 h-10 rounded-xl bg-[#020617] border border-gray-800 text-sm text-white focus:outline-none focus:border-primary-500/40 transition-all" />
                  </div>
                  <button type="submit" className="px-6 h-10 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20">Search</button>
                </form>

                <div className="rounded-2xl bg-[#020617] border border-gray-800 overflow-hidden shadow-2xl">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead><tr className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-800 bg-white/[0.02]">
                        <th className="px-4 py-3">Member</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 w-28 text-right">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {loadingUsers ? Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse"><td colSpan={5} className="px-4 py-4"><div className="h-4 bg-gray-800 rounded-lg w-full"></div></td></tr>
                        )) : users.map((u) => (
                          <tr key={u._id} className="group hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold shadow-md">{u.name?.[0]?.toUpperCase()}</div>
                                <div className="min-w-0"><p className="font-bold text-white text-sm truncate leading-tight">{u.name}</p><p className="text-xs text-gray-500 truncate">@{u.username}</p></div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 text-xs max-w-[150px] truncate">{u.email}</td>
                            <td className="px-4 py-2.5"><span className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight", u.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-gray-800 text-gray-400")}>{u.role}</span></td>
                            <td className="px-4 py-2.5 text-[11px] text-gray-500 tabular-nums">{formatDate(u.createdAt, true)}</td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/profile/${u.username}`} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 transition-colors" title="View"><Eye className="w-4 h-4" /></Link>
                                <button onClick={() => openEditUser(u)} className="p-1.5 rounded-lg hover:bg-primary-500/10 text-primary-400 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                                {u.role !== "admin" && <button onClick={() => setConfirmDelete({ id: u._id, label: u.username, type: 'user' })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden divide-y divide-gray-800">
                    {loadingUsers ? Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                      </div>
                    )) : users.map((u) => (
                      <div key={u._id} className="p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[12px] font-bold shadow-md">{u.name?.[0]?.toUpperCase()}</div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-white text-[15px] truncate leading-none">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-1">@{u.username}</p>
                            <p className="text-[11px] text-gray-600 truncate mt-0.5">{u.email}</p>
                          </div>
                          <span className={cn("shrink-0 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight", u.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-gray-800 text-gray-400")}>{u.role}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                          <span className="text-[10px] text-gray-600 font-bold uppercase tabular-nums">Joined {formatDate(u.createdAt)}</span>
                          <div className="flex items-center gap-1">
                            <Link href={`/profile/${u.username}`} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors"><Eye className="w-4 h-4" /></Link>
                            <button onClick={() => openEditUser(u)} className="p-2 rounded-xl hover:bg-primary-500/5 text-primary-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                            {u.role !== "admin" && <button onClick={() => setConfirmDelete({ id: u._id, label: u.username, type: 'user' })} className="p-2 rounded-xl hover:bg-red-500/5 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Pagination pagination={userPagination} page={userPage} setPage={setUserPage} />
              </motion.div>
            )}

            {tab === "posts" && (
              <motion.div key="posts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                <form onSubmit={onPostSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input value={postInput} onChange={(e) => setPostInput(e.target.value)} placeholder="Search title or content…"
                      className="w-full pl-10 pr-4 h-10 rounded-xl bg-[#020617] border border-gray-800 text-sm text-white focus:outline-none focus:border-primary-500/40 transition-all" />
                  </div>
                  <select value={postCategory} onChange={(e) => { setPostCategory(e.target.value); setPostPage(1); }}
                    className="h-10 px-4 rounded-xl bg-[#020617] border border-gray-800 text-sm text-white font-bold focus:outline-none shadow-sm">
                    <option value="all">All Categories</option>
                    {POST_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <button type="submit" className="px-6 h-10 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20">Search</button>
                </form>

                <div className="rounded-2xl bg-[#020617] border border-gray-800 overflow-hidden shadow-2xl">
                  {/* Desktop Post Table */}
                  <div className="hidden md:block overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead><tr className="text-left text-[11px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-800 bg-white/[0.02]">
                        <th className="px-4 py-3">Author</th><th className="px-4 py-3">Snippet</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Activity</th><th className="px-4 py-3">Created</th><th className="px-4 py-3 w-28 text-right">Actions</th>
                      </tr></thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {loadingPosts ? Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse"><td colSpan={6} className="px-4 py-4"><div className="h-4 bg-gray-800 rounded-lg w-full"></div></td></tr>
                        )) : posts.map((post) => (
                          <tr key={post._id} className="group hover:bg-white/[0.03] transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 text-[10px] font-black">{post.author?.name?.[0]?.toUpperCase()}</div>
                                <span className="text-sm text-gray-300 font-medium truncate">@{post.author?.username}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 max-w-[200px]"><p className="truncate text-xs text-gray-500">{(post.title || post.content || "").substring(0, 50)}</p></td>
                            <td className="px-4 py-2.5"><span className="px-2 py-0.5 rounded-lg text-[10px] bg-gray-800 text-gray-400 font-bold uppercase tracking-tight">{post.category}</span></td>
                            <td className="px-4 py-2.5 text-xs text-gray-500 tabular-nums font-medium">{post.likes?.length ?? 0} Likes</td>
                            <td className="px-4 py-2.5 text-[11px] text-gray-500 tabular-nums">{formatDate(post.createdAt, true)}</td>
                            <td className="px-4 py-2.5 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link href={`/post/${post._id}`} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 transition-colors" title="View"><Eye className="w-4 h-4" /></Link>
                                <button onClick={() => openEditPost(post)} className="p-1.5 rounded-lg hover:bg-primary-500/10 text-primary-400 transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => setConfirmDelete({ id: post._id, label: 'post', type: 'post' })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Post Card View */}
                  <div className="md:hidden divide-y divide-gray-800">
                    {loadingPosts ? Array(3).fill(0).map((_, i) => (
                      <div key={i} className="p-4 space-y-3 animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                      </div>
                    )) : posts.map((p) => (
                      <div key={p._id} className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 text-[9px] font-black">{p.author?.name?.[0]?.toUpperCase()}</div>
                            <span className="text-[13px] font-bold text-gray-300 truncate">@{p.author?.username}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-lg text-[9px] bg-gray-800 text-gray-500 font-bold uppercase tracking-tight shrink-0">{p.category}</span>
                        </div>
                        <p className="text-[13px] text-gray-400 leading-snug line-clamp-2 italic">{(p.title || p.content || "").substring(0, 100)}</p>
                        <div className="flex items-center justify-between pt-2">
                           <span className="text-[10px] text-gray-600 font-bold tabular-nums uppercase">{p.likes?.length ?? 0} Interaction • {formatDate(p.createdAt)}</span>
                           <div className="flex items-center gap-1">
                             <Link href={`/post/${p._id}`} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 transition-colors"><Eye className="w-4 h-4" /></Link>
                             <button onClick={() => openEditPost(p)} className="p-2 rounded-xl hover:bg-primary-500/5 text-primary-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                             <button onClick={() => setConfirmDelete({ id: p._id, label: 'post', type: 'post' })} className="p-2 rounded-xl hover:bg-red-500/5 text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Pagination pagination={postPagination} page={postPage} setPage={setPostPage} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setEditUser(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm mx-3 max-h-[90vh] overflow-hidden flex flex-col rounded-3xl bg-[#0f172a] border border-gray-800 shadow-2xl ring-1 ring-white/5"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-bold text-xs text-white uppercase tracking-widest">Edit Member</h2>
              <button onClick={() => setEditUser(null)} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={saveEditUser} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              {[
                { label: "Full Name", key: "name" },
                { label: "Username", key: "username" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
                  <input value={editForm[key]} onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 h-10 rounded-xl bg-[#020617] border border-gray-800 text-sm text-white focus:outline-none focus:border-primary-500/40 shadow-inner" />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">About / Bio</label>
                <textarea value={editForm.bio} onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))} rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-sm text-white resize-none focus:outline-none focus:border-primary-500/40 shadow-inner" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 h-10 rounded-xl border border-gray-800 text-xs font-bold text-gray-400 hover:bg-white/5 transition-colors uppercase tracking-tight">Cancel</button>
                <button type="submit" disabled={savingUser} className="flex-1 h-10 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all uppercase tracking-tight">{savingUser ? "..." : "Save Changes"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {editPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent backdrop-blur-md" onClick={() => setEditPost(null)}>
          <div className="absolute inset-0 bg-black/80" />
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl mx-3 max-h-[90vh] flex flex-col rounded-3xl bg-[#0f172a] border border-gray-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0f172a] sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                <h2 className="font-bold text-[10px] md:text-xs text-white uppercase tracking-[0.2em]">Refine Post</h2>
              </div>
              <button onClick={() => setEditPost(null)} className="p-2 rounded-xl hover:bg-white/5 text-gray-500"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={saveEditPost} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Context / Category</label>
                    <select value={postEditForm.category} onChange={(e) => setPostEditForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full px-3 h-10 rounded-xl bg-[#020617] border border-gray-800 text-xs font-bold text-white focus:outline-none focus:border-primary-500/40">
                      {POST_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Tags</label>
                    <input value={postEditForm.tags} onChange={(e) => setPostEditForm(f => ({ ...f, tags: e.target.value }))} placeholder="javascript, idea..."
                      className="w-full px-4 h-10 rounded-xl bg-[#020617] border border-gray-800 text-xs font-bold text-white focus:outline-none focus:border-primary-500/40" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Main Heading</label>
                  <input value={postEditForm.title} onChange={(e) => setPostEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-4 h-11 rounded-xl bg-[#020617] border border-gray-800 text-sm font-bold text-white focus:outline-none focus:border-primary-500/40" />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Content (Markdown)</label>
                  <textarea value={postEditForm.content} onChange={(e) => setPostEditForm(f => ({ ...f, content: e.target.value }))} rows={8}
                    className="w-full px-4 py-3 rounded-2xl bg-[#020617] border border-gray-800 text-sm leading-relaxed text-gray-300 focus:outline-none focus:border-primary-500/40 resize-none custom-scrollbar" />
                </div>
              </div>
            </form>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-[#0f172a]">
              <button type="button" onClick={() => setEditPost(null)} className="px-6 h-10 rounded-xl text-[10px] font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Cancel</button>
              <button type="button" onClick={saveEditPost} disabled={savingPost} 
                className="px-8 h-10 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all disabled:opacity-50 shadow-xl shadow-white/5">
                {savingPost ? "..." : "Commit Update"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg" onClick={() => setConfirmDelete(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm mx-3 rounded-[2.5rem] bg-[#0f172a] border border-red-500/20 px-6 py-10 text-center shadow-[0_0_60px_-12px_rgba(239,68,68,0.3)]"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Delete {confirmDelete.type === 'user' ? 'User' : 'Post'}</h2>
            <p className="text-[13px] text-gray-400 mb-8 leading-relaxed px-2">
              This action cannot be undone. This will permanently delete the {confirmDelete.type === 'user' ? 'user' : 'post'} and all associated data.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={executeDelete} 
                className="w-full h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[13px] font-black transition-all shadow-lg shadow-red-600/20 uppercase tracking-widest"
              >
                Delete
              </button>
              <button 
                onClick={() => setConfirmDelete(null)} 
                className="w-full h-12 rounded-2xl border border-gray-800 text-gray-400 text-[13px] font-bold hover:bg-white/5 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
