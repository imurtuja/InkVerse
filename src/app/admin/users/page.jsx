"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, KeyRound, Ban, Pencil, X, CheckCircle, ShieldAlert } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: "", username: "", bio: "", image: "" });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users); 
      setPagination(data.pagination);
    } catch { 
      toast.error("Could not load users"); 
    }
    finally { 
      setLoading(false); 
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onSearch = (e) => {
    e.preventDefault();
    setSearchQuery(q);
    setPage(1);
  };

  const toggleBan = async (u) => {
    try {
      const res = await fetch(`/api/admin/users/${u._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setUsers(users.map(user => user._id === u._id ? { ...user, isBanned: data.isBanned } : user));
    } catch (e) {
      toast.error(e.message || "Failed to alter ban state.");
    }
  };

  const sendResetLink = async (u) => {
    try {
      const res = await fetch(`/api/auth/reset-password/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Reset link dispatched to user email.");
    } catch (e) {
      toast.error(e.message || "Failed to send reset link.");
    }
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({ name: u.name || "", username: u.username || "", bio: u.bio || "", image: u.image || "" });
    setEditModalOpen(true);
  };

  const submitEdit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("User updated securely");
      setUsers(users.map(u => u._id === editingUser._id ? { ...u, ...formData } : u));
      setEditModalOpen(false);
    } catch (e) {
      toast.error(e.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 lg:px-0">
      <form onSubmit={onSearch} className="flex gap-2 bg-white dark:bg-[#1B1A55]/60 p-2 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 shadow-sm lg:max-w-2xl backdrop-blur-xl">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search name, username, email…"
            className="w-full pl-11 pr-4 h-10 rounded-lg bg-gray-50 dark:bg-black/20 border border-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500/40 transition-all font-medium" 
          />
        </div>
        <button type="submit" className="px-6 h-10 rounded-lg bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-all shadow-sm active:scale-95">Search</button>
      </form>

      {/* MOBILE Layout (Cards) */}
      <div className="block lg:hidden space-y-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-40 bg-white dark:bg-[#1B1A55]/60 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 animate-pulse" />
        )) : users.map(u => (
          <div key={u._id} className={cn("relative bg-white dark:bg-[#1B1A55]/60 border rounded-2xl p-5 shadow-sm flex flex-col gap-3", u.isBanned ? "border-red-500/20" : "border-gray-200 dark:border-[#535C91]/30")}>
            
            {/* Absolute Badges Block */}
            <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap justify-end text-[10px] font-black uppercase tracking-widest z-10 w-[150px]">
               {u.role === "admin" && <span className="px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg whitespace-nowrap hidden sm:inline-flex">Admin</span>}
               {u.isBanned 
                 ? <span className="px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 rounded-lg whitespace-nowrap">Banned</span>
                 : <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20 rounded-lg whitespace-nowrap">Active</span>
               }
               {Number(u.riskScore) > 0 && <span className={cn("px-2 py-1 border rounded-lg whitespace-nowrap", u.riskScore >= 8 ? "bg-red-500/10 border-red-500/30 text-red-500" : u.riskScore >= 4 ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500")}>Risk: {u.riskScore}</span>}
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold shadow-md shrink-0 overflow-hidden">
                 <img src={u.image || "/default-avatar.webp"} onError={(e) => { e.target.src = "/default-avatar.webp" }} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 pr-16 sm:pr-24">
                <p className="font-bold text-gray-900 dark:text-white text-base truncate">{u.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{u.username}</p>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
               {u.email}
            </div>

            <div className="flex flex-col space-y-2 mt-3 border-t border-gray-100 dark:border-white/5 pt-4 w-full">
               <button onClick={() => openEditModal(u)} className="h-10 border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all w-full"><Pencil className="w-3.5 h-3.5"/> Edit</button>
               {u.role !== 'admin' && (
                 <>
                   <button onClick={() => sendResetLink(u)} className="h-10 border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all w-full"><KeyRound className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400"/> Reset</button>
                   <button onClick={() => toggleBan(u)} className={cn("h-10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold active:scale-95 transition-all w-full", u.isBanned ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-500")}><Ban className="w-3.5 h-3.5"/> {u.isBanned ? "Unban" : "Ban"}</button>
                 </>
               )}
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
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Risk Profile</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Interventions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#535C91]/10">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-white/5 rounded-xl w-full"></div></td>
                </tr>
              )) : users.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B1A55] to-gray-800 flex items-center justify-center text-white text-[12px] font-bold shadow-md overflow-hidden shrink-0">
                         <img src={u.image || "/default-avatar.webp"} onError={(e) => { e.target.src = "/default-avatar.webp" }} alt="User" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate leading-tight">{u.name}</p>
                        <p className="text-xs text-[#535C91] truncate">@{u.username} · {formatDate(u.createdAt, true)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest", u.role === "admin" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-gray-800/50 text-gray-400 border border-gray-700")}>{u.role}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg w-max text-[10px] font-black uppercase tracking-widest border", u.riskScore >= 8 ? "bg-red-500/10 border-red-500/30 text-red-500" : u.riskScore >= 4 ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-500")}>
                        <ShieldAlert className="w-3 h-3"/> Score: {u.riskScore ?? 0}
                     </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.isBanned ? (
                       <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">Banned</span>
                    ) : (
                       <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Active</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      
                      <button onClick={() => openEditModal(u)} className="h-10 px-4 border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"><Pencil className="w-3.5 h-3.5 text-gray-400"/> Edit</button>

                      {u.role !== "admin" && (
                        <>
                          <button onClick={() => sendResetLink(u)} className="h-10 px-4 border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold text-gray-700 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"><KeyRound className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400"/> Reset</button>
                          
                          <button onClick={() => toggleBan(u)} className={cn("h-10 px-4 border rounded-lg flex items-center justify-center gap-2 text-[11px] font-bold transition-all", u.isBanned ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-600 dark:text-red-500 border-red-500/20 hover:bg-red-500/20")}>
                            <Ban className="w-3.5 h-3.5" /> {u.isBanned ? "Unban" : "Ban"}
                          </button>
                        </>
                      )}
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

      {/* Edit User Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit User Account">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2">{editingUser?.email}</p>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full h-10 px-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary-500/50 outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Username</label>
              <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full h-10 px-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary-500/50 outline-none mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Profile Image URL</label>
              <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full h-10 px-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary-500/50 outline-none mt-1" placeholder="https://..." />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1">Biography</label>
              <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="w-full p-4 h-24 resize-none bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white focus:border-primary-500/50 outline-none mt-1" />
            </div>
          </div>
          
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-white/5 mt-4 pt-4">
             <button onClick={() => setEditModalOpen(false)} className="flex-1 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancel</button>
             <button onClick={submitEdit} disabled={isSaving} className="flex-1 h-10 rounded-lg bg-primary-600 text-white font-bold text-sm shadow-sm hover:bg-primary-700 transition disabled:opacity-50">
               {isSaving ? "Saving..." : "Save Changes"}
             </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
