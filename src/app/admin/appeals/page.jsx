"use client";

import { useState, useCallback, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, ShieldX } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminAppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isProcessing, setIsProcessing] = useState(null);
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/appeals?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAppeals(data.appeals); 
      setPagination(data.pagination);
    } catch { 
      toast.error("Could not load appeals"); 
    }
    finally { 
      setLoading(false); 
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const processAppeal = async (id, status, responseMsg = null) => {
    setIsProcessing(id);
    try {
      const res = await fetch(`/api/admin/appeals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminResponse: responseMsg })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      setAppeals(appeals.filter(a => a._id !== id));
    } catch (e) {
      toast.error(e.message || "Failed to process appeal");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt("Optional rejection note to be shown to the user:", "Your appeal has been reviewed and denied.");
    if (reason !== null) {
      processAppeal(id, "rejected", reason);
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 lg:px-0">
      <div className="flex flex-col sm:flex-row gap-2 bg-white dark:bg-[#1B1A55]/60 p-2 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 shadow-sm backdrop-blur-xl">
        <select 
          value={statusFilter} 
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-10 px-4 rounded-lg bg-gray-50 dark:bg-black/20 border border-transparent text-sm text-gray-900 dark:text-white font-bold focus:outline-none w-full sm:w-auto"
        >
          <option value="pending">Pending Appeals</option>
          <option value="approved">Approved & Unbanned</option>
          <option value="rejected">Rejected Appeals</option>
          <option value="all">All Records</option>
        </select>
        <button onClick={fetchAppeals} className="px-6 h-10 w-full sm:w-auto rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm hover:bg-primary-700 transition-all active:scale-95">Refresh List</button>
      </div>

      {/* MOBILE Layout (Cards) */}
      <div className="block lg:hidden space-y-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-40 bg-white dark:bg-[#1B1A55]/60 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 animate-pulse" />
        )) : appeals.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-[#535C91]/30 rounded-2xl">
            <span className="text-4xl mb-3">🎉</span>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Queue Clear</p>
          </div>
        ) : appeals.map(a => (
          <div key={a._id} className="bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-5 shadow-sm flex flex-col gap-3 backdrop-blur-xl relative">
             <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-black/20 flex items-center justify-center shrink-0 overflow-hidden">
                   <img src={a.user?.image || "/default-avatar.webp"} onError={(e) => e.target.src="/default-avatar.webp"} className="w-full h-full object-cover"/>
                </div>
                <div className="flex-1 min-w-0 pr-20">
                   <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.user?.name}</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{a.user?.username}</p>
                </div>
             </div>

             <div className="absolute top-4 right-4 text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{formatDate(a.createdAt, true)}</p>
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
                  a.status === 'pending' ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-500/20" :
                  a.status === 'approved' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20" :
                  "bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20"
                )}>{a.status}</span>
             </div>

             <div className="bg-gray-50 dark:bg-[#020617] rounded-xl p-3 border border-gray-200 dark:border-white/5 mt-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Restricted For: {a.user?.banReason || "Policy Violation"}</p>
                <div className="p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-lg">
                   <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">"{a.message}"</p>
                </div>
             </div>

             {a.status === "pending" && (
               <div className="flex flex-col space-y-2 mt-2 pt-3 border-t border-gray-100 dark:border-white/5 w-full">
                 <button onClick={() => processAppeal(a._id, "approved")} disabled={isProcessing === a._id} className="h-10 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 transition-all w-full disabled:opacity-50">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve & Unban User
                 </button>
                 <button onClick={() => handleReject(a._id)} disabled={isProcessing === a._id} className="h-10 border border-red-500/30 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95 transition-all w-full disabled:opacity-50">
                    <XCircle className="w-3.5 h-3.5" /> Reject Appeal
                 </button>
               </div>
             )}
          </div>
        ))}
      </div>

      {/* DESKTOP View */}
      <div className="hidden lg:block rounded-2xl bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 overflow-hidden shadow-sm backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/10">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Ban Context</th>
                <th className="px-6 py-4">Appeal Message</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#535C91]/10">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4"><div className="h-10 bg-gray-100 dark:bg-white/5 rounded-lg w-full"></div></td>
                </tr>
              )) : appeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">No appeals found</td>
                </tr>
              ) : appeals.map((a) => (
                <tr key={a._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-black/20 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-white/5">
                           <img src={a.user?.image || "/default-avatar.webp"} onError={(e) => e.target.src="/default-avatar.webp"} className="w-full h-full object-cover"/>
                        </div>
                        <div className="min-w-0">
                           <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{a.user?.name}</p>
                           <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">@{a.user?.username}</p>
                        </div>
                     </div>
                   </td>
                   <td className="px-6 py-4 w-[200px]">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Reason</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate">{a.user?.banReason || "ToS Violation"}</p>
                   </td>
                   <td className="px-6 py-4 max-w-[250px]">
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{a.message.substring(0, 80)}{a.message.length > 80 ? '...' : ''}"</p>
                   </td>
                   <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight block w-max", 
                        a.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20" : 
                        a.status === 'approved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20" : 
                        "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20"
                      )}>{a.status}</span>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-2">{formatDate(a.createdAt, true)}</p>
                   </td>
                   <td className="px-6 py-4 text-right">
                      {a.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                           <button onClick={() => processAppeal(a._id, "approved")} disabled={isProcessing === a._id} className="h-9 px-3 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 font-bold text-[11px] transition-all disabled:opacity-50">
                             <CheckCircle className="w-3.5 h-3.5" /> Approve
                           </button>
                           <button onClick={() => handleReject(a._id)} disabled={isProcessing === a._id} className="h-9 px-3 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-500/10 flex items-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold text-[11px] transition-all disabled:opacity-50">
                             <XCircle className="w-3.5 h-3.5" /> Reject
                           </button>
                        </div>
                      )}
                      {a.status === "rejected" && a.adminResponse && (
                         <div className="text-[10px] text-gray-500 text-left bg-gray-50 dark:bg-black/20 p-2 rounded-lg border border-gray-200 dark:border-white/5">
                            <span className="font-black uppercase tracking-widest text-red-500 block mb-0.5">Admin Note</span>
                            <p className="truncate">"{a.adminResponse}"</p>
                         </div>
                      )}
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
    </div>
  );
}
