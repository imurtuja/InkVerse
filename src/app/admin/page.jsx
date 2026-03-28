"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  FileText,
  Trash2,
  Eye,
  LayoutDashboard,
  Search,
  RefreshCw,
  MessageSquare,
  Crown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react";
import { cn, formatDate, POST_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
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

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
    } catch {
      toast.error("Could not load stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({ page: String(userPage), limit: "12" });
      if (appliedUserQ.trim()) params.set("q", appliedUserQ.trim());
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
      setUserPagination(data.pagination);
    } catch {
      toast.error("Could not load users");
    } finally {
      setLoadingUsers(false);
    }
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
      setPosts(data.posts);
      setPostPagination(data.pagination);
    } catch {
      toast.error("Could not load posts");
    } finally {
      setLoadingPosts(false);
    }
  }, [postPage, appliedPostQ, postCategory]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === "users") fetchUsers();
  }, [tab, fetchUsers]);

  useEffect(() => {
    if (tab === "posts") fetchPosts();
  }, [tab, fetchPosts]);

  const deletePost = async (id) => {
    if (!confirm("Delete this post and its comments?")) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Post removed");
      fetchStats();
    } catch {
      toast.error("Failed to delete post");
    }
  };

  const openEditUser = (u) => {
    setEditUser(u);
    setEditForm({
      name: u.name || "",
      username: u.username || "",
      bio: u.bio || "",
      image: u.image || "",
    });
  };

  const saveEditUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    setSavingUser(true);
    try {
      const res = await fetch(`/api/admin/users/${editUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name.trim(),
          username: editForm.username.trim().toLowerCase(),
          bio: editForm.bio,
          image: editForm.image.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not update user");
        return;
      }
      toast.success("Profile updated");
      setEditUser(null);
      fetchUsers();
      fetchStats();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async (id, label) => {
    if (
      !confirm(
        `Permanently delete ${label}? Their posts, comments, and notifications will be removed. Admin accounts cannot be deleted here.`
      )
    ) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not delete user");
        return;
      }
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User removed");
      fetchStats();
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const onUserSearch = (e) => {
    e.preventDefault();
    setAppliedUserQ(userInput.trim());
    setUserPage(1);
  };

  const onPostSearch = (e) => {
    e.preventDefault();
    setAppliedPostQ(postInput.trim());
    setPostPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-8 pb-24 md:pb-10 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          <span className="flex h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 items-center justify-center shadow-lg shadow-amber-500/25">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </span>
          <span className="gradient-text">Admin</span>
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">
          Manage members and content. Administrator access is controlled only in the database — there is no UI or API to grant the admin role.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl glass-card w-full sm:w-auto overflow-x-auto scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center justify-center sm:justify-start gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 sm:flex-none min-w-0",
                active
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                  : "text-[hsl(var(--muted-foreground))] hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {tab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">Overview</h2>
              <button
                type="button"
                onClick={() => fetchStats()}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-[hsl(var(--muted-foreground))]"
                aria-label="Refresh stats"
              >
                <RefreshCw className={cn("w-4 h-4", loadingStats && "animate-spin")} />
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                {
                  label: "Users",
                  value: loadingStats ? "…" : stats?.usersCount ?? "—",
                  icon: Users,
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  label: "Posts",
                  value: loadingStats ? "…" : stats?.postsCount ?? "—",
                  icon: FileText,
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  label: "Comments",
                  value: loadingStats ? "…" : stats?.commentsCount ?? "—",
                  icon: MessageSquare,
                  gradient: "from-violet-500 to-purple-500",
                },
                {
                  label: "Admin accounts",
                  value: loadingStats ? "…" : stats?.adminsCount ?? "—",
                  icon: Crown,
                  gradient: "from-amber-500 to-orange-500",
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-4 sm:p-5">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3",
                      stat.gradient
                    )}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {tab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <form onSubmit={onUserSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Search name, username, email…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </form>

            {loadingUsers ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-2xl skeleton" />
                ))}
              </div>
            ) : (
              <>
                <div className="hidden md:block glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] border-b border-gray-200/60 dark:border-gray-700/60">
                          <th className="px-4 py-3">User</th>
                          <th className="px-4 py-3">Email</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Joined</th>
                          <th className="px-4 py-3 w-36">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr
                            key={u._id}
                            className="border-b border-gray-100/80 dark:border-gray-800/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold">
                                  {u.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium">{u.name}</p>
                                  <p className="text-xs text-[hsl(var(--muted-foreground))]">@{u.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[hsl(var(--muted-foreground))] max-w-[200px] truncate">
                              {u.email}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium",
                                  u.role === "admin"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                                )}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                              {formatDate(u.createdAt, true)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-0.5">
                                <Link
                                  href={`/profile/${u.username}`}
                                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[hsl(var(--muted-foreground))]"
                                  title="View profile"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openEditUser(u)}
                                  className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                  title="Edit profile"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                {u.role !== "admin" && (
                                  <button
                                    type="button"
                                    onClick={() => deleteUser(u._id, u.username)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                                    title="Delete user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="md:hidden space-y-3">
                  {users.map((u) => (
                    <div key={u._id} className="glass-card rounded-2xl p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{u.name}</p>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">@{u.username}</p>
                            <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 px-2 py-0.5 rounded-full text-xs font-medium",
                            u.role === "admin"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-gray-100 dark:bg-gray-800"
                          )}
                        >
                          {u.role}
                        </span>
                      </div>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Joined {formatDate(u.createdAt, true)}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link
                          href={`/profile/${u.username}`}
                          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditUser(u)}
                          className="flex-1 min-w-[100px] flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary-500/30 text-primary-600 dark:text-primary-400 text-sm font-medium"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </button>
                        {u.role !== "admin" && (
                          <button
                            type="button"
                            onClick={() => deleteUser(u._id, u.username)}
                            className="flex-1 min-w-[100px] basis-full sm:basis-auto flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {userPagination && userPagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      type="button"
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Page {userPage} / {userPagination.pages}
                    </span>
                    <button
                      type="button"
                      disabled={!userPagination.hasMore}
                      onClick={() => setUserPage((p) => p + 1)}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {tab === "posts" && (
          <motion.div
            key="posts"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <form onSubmit={onPostSearch} className="flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <input
                  value={postInput}
                  onChange={(e) => setPostInput(e.target.value)}
                  placeholder="Search title or content…"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              <select
                value={postCategory}
                onChange={(e) => {
                  setPostCategory(e.target.value);
                  setPostPage(1);
                }}
                className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm"
              >
                <option value="all">All categories</option>
                {POST_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
              >
                Search
              </button>
            </form>

            {loadingPosts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-2xl skeleton" />
                ))}
              </div>
            ) : (
              <>
                <div className="hidden lg:block glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[720px]">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))] border-b border-gray-200/60 dark:border-gray-700/60">
                          <th className="px-4 py-3">Author</th>
                          <th className="px-4 py-3">Preview</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Likes</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 w-32">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {posts.map((post) => (
                          <tr
                            key={post._id}
                            className="border-b border-gray-100/80 dark:border-gray-800/80 hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-[10px] font-bold">
                                  {post.author?.name?.[0]?.toUpperCase()}
                                </div>
                                <span className="font-medium">@{post.author?.username}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 max-w-xs">
                              <p className="truncate text-gray-500 dark:text-gray-400">
                                {(post.title || post.content || "").substring(0, 72)}
                                {(post.title || post.content || "").length > 72 ? "…" : ""}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800">{post.category}</span>
                            </td>
                            <td className="px-4 py-3">{post.likes?.length ?? 0}</td>
                            <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] whitespace-nowrap">
                              {formatDate(post.createdAt, true)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-0.5">
                                <Link
                                  href={`/post/${post._id}`}
                                  className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[hsl(var(--muted-foreground))]"
                                  title="View post"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                                <Link
                                  href={`/post/${post._id}/edit`}
                                  className="p-2 rounded-lg hover:bg-primary-500/10 text-primary-600 dark:text-primary-400"
                                  title="Edit post"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => deletePost(post._id)}
                                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                                  title="Delete post"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:hidden space-y-3">
                  {posts.map((post) => (
                    <div key={post._id} className="glass-card rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {post.author?.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium truncate">@{post.author?.username}</span>
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 shrink-0">{post.category}</span>
                      </div>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-3">
                        {post.title ? `${post.title} · ` : ""}
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
                        <span>{post.likes?.length ?? 0} likes</span>
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Link
                          href={`/post/${post._id}`}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs sm:text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                        <Link
                          href={`/post/${post._id}/edit`}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-primary-500/30 text-primary-600 dark:text-primary-400 text-xs sm:text-sm font-medium"
                        >
                          <Pencil className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => deletePost(post._id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">Del</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {postPagination && postPagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button
                      type="button"
                      disabled={postPage <= 1}
                      onClick={() => setPostPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">
                      Page {postPage} / {postPagination.pages}
                    </span>
                    <button
                      type="button"
                      disabled={!postPagination.hasMore}
                      onClick={() => setPostPage((p) => p + 1)}
                      className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-40"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {editUser && (
        <div
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-edit-user-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl glass-card border border-gray-200/50 dark:border-gray-700/50 shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-[hsl(var(--card))]/95 backdrop-blur-md">
              <h2 id="admin-edit-user-title" className="font-bold text-lg">
                Edit member
              </h2>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={saveEditUser} className="p-5 space-y-4">
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                Email and role are not editable here. Role changes only in the database.
              </p>
              <div>
                <label className="block text-sm font-medium mb-1.5">Display name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Username</label>
                <input
                  value={editForm.username}
                  onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm"
                  maxLength={30}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Image URL</label>
                <input
                  value={editForm.image}
                  onChange={(e) => setEditForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm"
                  placeholder="https://…"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-accent-500 disabled:opacity-50"
                >
                  {savingUser ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
