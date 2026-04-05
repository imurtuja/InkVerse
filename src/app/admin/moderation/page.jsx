"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Check, ShieldAlert, Trash2, Ban, Eye, Search } from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";

export default function ModerationQueuePage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("high-risk"); // high-risk | auto-flagged | all
  const [q, setQ] = useState("");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "25", status: "pending" });
      const res = await fetch(`/api/admin/reports?${params}`);
      if (!res.ok) throw new Error();
      let data = await res.json();
      
      let filtered = data.reports.filter(r => r.isAuto || r.severity === "high");
      if (activeTab === "high-risk") {
        filtered = filtered.filter(r => r.severity === "high");
      } else if (activeTab === "auto-flagged") {
        filtered = filtered.filter(r => r.isAuto);
      }
      
      if (q.trim()) {
        filtered = filtered.filter(r => 
          r.reason.toLowerCase().includes(q.toLowerCase()) || 
          r.reporter?.name?.toLowerCase().includes(q.toLowerCase())
        );
      }

      setReports(filtered);
    } catch { 
      toast.error("Failed to load queue"); 
    } finally { 
      setLoading(false); 
    }
  }, [activeTab, q]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const onSearch = (e) => {
    e.preventDefault();
    fetchQueue();
  };

  const processInline = async (reportId, newStatus, action) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminAction: action })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success(`Action applied: ${action.toUpperCase()}`);
      
      // Inline remove logic allowing massive queue clear speed 
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (e) {
      toast.error(e.message || "Failed to process item.");
    }
  };

  return (
    <div className="space-y-4 pb-28 px-4 lg:px-0">
      {/* Filters / Engine Switcher */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-white dark:bg-[#1B1A55]/60 p-3 lg:p-4 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 shadow-sm backdrop-blur-xl">
        <div className="flex gap-2 p-1 bg-gray-50 dark:bg-black/20 rounded-xl w-max border border-gray-200 dark:border-white/5">
          {[
            { id: "all", label: "All Alerts" },
            { id: "high-risk", label: "High Risk Flags" },
            { id: "auto-flagged", label: "Auto-System" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs lg:text-[13px] font-bold transition-all tabular-nums",
                activeTab === tab.id 
                  ? "bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-500/20 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-white/5 border border-transparent"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={onSearch} className="flex-1 w-full max-w-sm relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
            placeholder="Search reasons or reporters..."
            className="w-full pl-11 pr-4 h-10 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary-500/40 transition-all font-medium" 
          />
        </form>
      </div>

      {/* Queue Card Grid */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
             <div key={i} className="h-40 bg-white dark:bg-[#1B1A55]/60 rounded-2xl border border-gray-200 dark:border-[#535C91]/30 animate-pulse" />
          ))
        ) : reports.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center bg-white dark:bg-[#1B1A55]/60 hover:bg-gray-50 dark:hover:bg-[#1B1A55]/80 transition-colors border border-gray-200 dark:border-[#535C91]/30 rounded-2xl shadow-sm border-dashed">
            <span className="text-4xl mb-3">🎉</span>
            <p className="text-gray-500 dark:text-gray-400 font-bold tracking-widest text-xs uppercase">No flagged content 🎉</p>
          </div>
        ) : reports.map(r => (
          <div key={r._id} className="group flex flex-col lg:flex-row gap-4 bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-4 lg:p-6 shadow-sm hover:border-gray-300 dark:hover:border-gray-700 transition-colors backdrop-blur-xl">
            
            {/* Intel Side */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5",
                    r.isAuto ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500" : "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400"
                  )}>
                    {r.isAuto ? "🤖 AUTO EXECUTED" : "👤 MANUAL FLAG"}
                  </span>
                  {r.severity === "high" && (
                     <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500">
                       🔥 HIGH RISK
                     </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest tabular-nums leading-none">
                  {formatDate(r.createdAt, true)}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
                  <span className="text-gray-500 dark:text-gray-400 font-medium text-xs lg:text-sm block mb-1">Trigger Reason</span>
                  {r.reason}
                </p>
              </div>

              {/* Target Data */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                    Target {r.itemType} {r.itemType === 'Post' ? `· ID: ${r.itemId?._id?.substring(0, 8)}` : ''}
                  </p>
                </div>
                {r.itemType === "Post" && r.itemId && (
                  <div className="mt-2 text-gray-700 dark:text-gray-300 text-sm italic font-medium">"{r.itemId.content?.substring(0, 150)}{r.itemId.content?.length > 150 ? '...' : ''}"</div>
                )}
                <div className="flex gap-3 text-xs font-bold mt-2 pt-2 border-t border-gray-200 dark:border-white/5 mx-auto w-full">
                   <p className="text-blue-600 dark:text-blue-400">Reporter: {r.isAuto ? "SYSTEM" : `@${r.reporter?.username}`}</p>
                   {r.itemType === "Post" && <p className="text-pink-600 dark:text-pink-400 border-l border-gray-300 dark:border-white/10 pl-3">Author: @{r.itemId?.author?.username || 'Unknown'}</p>}
                </div>
              </div>
            </div>

            {/* Fast Action Board */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-[#535C91]/30 pt-4 lg:pt-0 lg:pl-6 mt-4 lg:mt-0 w-full lg:w-48">
               <button 
                onClick={() => processInline(r._id, "resolved", "ignore")}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition w-full"
               >
                 <Check className="w-3.5 h-3.5" /> Approve
               </button>
               {r.itemType === "Post" && (
                 <button 
                  onClick={() => processInline(r._id, "reviewed", "delete")}
                  className="flex-1 flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-500 font-bold text-xs hover:bg-red-100 dark:hover:bg-red-500/20 transition w-full"
                 >
                   <Trash2 className="w-3.5 h-3.5" /> Delete Post
                 </button>
               )}
               <button 
                onClick={() => processInline(r._id, "reviewed", "ban")}
                className="flex-1 flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-500 font-bold text-xs hover:bg-orange-100 dark:hover:bg-orange-500/20 transition w-full"
               >
                 <Ban className="w-3.5 h-3.5" /> Ban Writer
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
