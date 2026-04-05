"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Search, Eye, Trash2, ShieldX, Check } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReports(data.reports); 
      setPagination(data.pagination);
    } catch { 
      toast.error("Could not load reports"); 
    }
    finally { 
      setLoading(false); 
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const processReport = async (reportId, newStatus, action) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminAction: action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(data.message);
      fetchReports(); // Refresh cleanly
    } catch (e) {
      toast.error(e.message || "Failed to process report.");
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
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="all">All Reports</option>
        </select>
        <button onClick={fetchReports} className="px-6 h-10 w-full sm:w-auto rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm hover:bg-primary-700 transition-all active:scale-95">Refresh List</button>
      </div>

      {/* MOBILE Layout (Cards) */}
      <div className="block lg:hidden space-y-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-40 bg-white dark:bg-[#1B1A55]/60 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 animate-pulse" />
        )) : reports.length === 0 ? (
          <div className="py-10 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">No reports found</div>
        ) : reports.map(rpt => (
          <div key={rpt._id} className="bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-5 shadow-sm flex flex-col gap-3 backdrop-blur-xl">
             <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                   <p className="text-sm text-gray-900 dark:text-white font-bold">Reported by @{rpt.reporter?.username}</p>
                   <p className="text-[10px] text-gray-500 uppercase tracking-widest">{formatDate(rpt.createdAt, true)}</p>
                </div>
                <div className="flex flex-col gap-1 items-end">
                   <span className={cn(
                      "px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-tight", 
                      rpt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20" : 
                      rpt.status === 'resolved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20" : 
                      "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    )}>
                      {rpt.status}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-tight border", rpt.isAuto ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" : "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700")}>
                      {rpt.isAuto ? "System" : "Manual"}
                    </span>
                </div>
             </div>
             
             <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-3 border border-gray-100 dark:border-white/5">
                <span className="px-2 py-0.5 rounded-lg text-[9px] bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-tight mr-2">{rpt.itemType}</span>
                {rpt.itemType === 'Post' ? (
                  <p className="truncate text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium italic">"{(rpt.itemId?.title || rpt.itemId?.content || "Deleted Content").substring(0, 80)}"</p>
                ) : (
                  <p className="truncate text-xs text-gray-600 dark:text-gray-400 mt-2 font-medium">@{rpt.itemId?.username || "Deleted User"}</p>
                )}
             </div>

             <div className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest pl-1 mt-1">
               {rpt.severity === 'high' && '🔥 '} {rpt.reason}
             </div>

             <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-gray-100 dark:border-white/5">
                {rpt.itemType === "Post" && rpt.itemId && (
                  <Link href={`/post/${rpt.itemId._id}`} target="_blank" className="h-10 border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all w-full">
                    <Eye className="w-3.5 h-3.5"/> View
                  </Link>
                )}
                {rpt.status === "pending" && (
                  <>
                    <button onClick={() => processReport(rpt._id, "resolved", "ignore")} className="h-10 border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 active:scale-95 transition-all w-full">
                      <Check className="w-3.5 h-3.5"/> Ignore
                    </button>
                    <button onClick={() => processReport(rpt._id, "reviewed", "delete")} className="h-10 border border-red-500/30 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 active:scale-95 transition-all w-full">
                      <Trash2 className="w-3.5 h-3.5"/> Delete
                    </button>
                    <button onClick={() => processReport(rpt._id, "reviewed", "ban")} className="col-span-2 h-10 border border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-orange-600 dark:text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-500/20 active:scale-95 transition-all w-full">
                      <ShieldX className="w-3.5 h-3.5"/> Ban User
                    </button>
                  </>
                )}
             </div>
          </div>
        ))}
      </div>

      {/* DESKTOP Layout (Tables) */}
      <div className="hidden lg:block rounded-2xl bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 overflow-hidden shadow-sm backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="text-left text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/10">
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Target Details</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#535C91]/10">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-gray-100 dark:bg-white/5 rounded-lg w-full"></div></td>
                </tr>
              )) : reports.map((rpt) => (
                <tr key={rpt._id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="max-w-[120px]">
                      <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{rpt.reporter?.name}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">@{rpt.reporter?.username}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                     <span className="px-2 py-0.5 rounded-lg text-[9px] bg-gray-100 dark:bg-black/30 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-tight mr-2 border border-gray-200 dark:border-white/10">{rpt.itemType}</span>
                     {rpt.itemType === 'Post' ? (
                        <p className="truncate text-xs text-gray-600 dark:text-gray-400 mt-1.5 italic">"{(rpt.itemId?.title || rpt.itemId?.content || "Deleted Content").substring(0, 60)}"</p>
                     ) : (
                        <p className="truncate text-xs text-gray-600 dark:text-gray-400 mt-1.5 font-medium">@{rpt.itemId?.username || "Deleted User"}</p>
                     )}
                  </td>
                  <td className="px-6 py-4 max-w-[250px]">
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block truncate">
                       {rpt.severity === 'high' && '🔥 '} {rpt.reason}
                    </span>
                    <span className={cn("px-2 py-0.5 mt-2 inline-block rounded-lg text-[9px] font-bold uppercase tracking-tight border", rpt.isAuto ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" : "bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700")}>
                      {rpt.isAuto ? "System Engine" : "User Report"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight inline-block", 
                      rpt.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-500/20" : 
                      rpt.status === 'resolved' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-200 dark:border-emerald-500/20" : 
                      "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                    )}>
                      {rpt.status}
                    </span>
                    {rpt.adminAction !== 'none' && <p className="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mt-1.5 tracking-widest leading-none block">{rpt.adminAction}</p>}
                  </td>
                  <td className="px-6 py-4 text-[11px] font-bold text-gray-500 dark:text-gray-400 tabular-nums uppercase tracking-widest">{formatDate(rpt.createdAt, true)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      {rpt.itemType === "Post" && rpt.itemId && (
                        <Link href={`/post/${rpt.itemId._id}`} target="_blank" className="h-9 px-3 rounded-lg border border-gray-200 dark:border-[#535C91]/30 bg-gray-50 dark:bg-black/20 flex items-center gap-1.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-[11px] transition-all" title="View Target"><Eye className="w-3.5 h-3.5" /> View </Link>
                      )}
                      
                      {rpt.status === "pending" && (
                        <>
                          <button onClick={() => processReport(rpt._id, "resolved", "ignore")} className="h-9 px-3 rounded-lg border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 flex items-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 font-bold text-[11px] transition-all" title="Ignore/Resolve Safely">
                            <Check className="w-3.5 h-3.5" /> Ignore
                          </button>
                          <button onClick={() => processReport(rpt._id, "reviewed", "delete")} className="h-9 px-3 rounded-lg border border-red-500/30 bg-red-50 dark:bg-red-500/10 flex items-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 font-bold text-[11px] transition-all" title="Mark for Deletion">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                          <button onClick={() => processReport(rpt._id, "reviewed", "ban")} className="h-9 px-3 rounded-lg border border-orange-500/30 bg-orange-50 dark:bg-orange-500/10 flex items-center gap-1.5 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-orange-600 dark:text-orange-500 font-bold text-[11px] transition-all" title="Mark for Ban">
                            <ShieldX className="w-3.5 h-3.5" /> Ban
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
    </div>
  );
}
