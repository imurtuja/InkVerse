"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, FileText, AlertTriangle, ShieldAlert, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState({ metrics: null, chartData: [], suspiciousUsers: [] });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch { 
      toast.error("Could not load analytics"); 
    }
    finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key="overview" 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0 }} 
        className="space-y-6 pb-28 md:pb-6"
      >
        {/* Metric Cards Top Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Users", value: data.metrics?.totalUsers ?? 0, icon: Users, color: "text-blue-400 bg-blue-500/10 shadow-blue-500/5" },
            { label: "Daily Posts", value: data.metrics?.dailyPosts ?? 0, icon: Activity, color: "text-indigo-400 bg-indigo-500/10 shadow-indigo-500/5" },
            { label: "Total Posts", value: data.metrics?.totalPosts ?? 0, icon: FileText, color: "text-emerald-400 bg-emerald-500/10 shadow-emerald-500/5" },
            { label: "Bans", value: data.metrics?.activeBans ?? 0, icon: ShieldAlert, color: "text-red-400 bg-red-500/10 shadow-red-500/5" },
            { label: "Pending Flags", value: data.metrics?.pendingReports ?? 0, icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10 shadow-amber-500/5", colSpan: "col-span-2 md:col-span-1" },
          ].map((s) => (
            <div key={s.label} className={cn("p-5 rounded-2xl bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 hover:border-gray-300 dark:hover:bg-[#1B1A55]/80 transition-all shadow-sm flex flex-col justify-between h-36 backdrop-blur-xl", s.colSpan)}>
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3 shadow-inner", s.color)}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tight">{loading ? "…" : s.value}</p>
                <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           <div className="bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
             <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-6">Engagement Trends</h3>
             <div className="h-64 w-full">
               {loading ? (
                 <div className="w-full h-full bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={data.chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" vertical={false} />
                     <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                     <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{ backgroundColor: 'var(--tw-prose-body)', border: '1px solid rgba(156,163,175,0.2)', borderRadius: '12px' }} />
                     <Line type="monotone" dataKey="posts" name="Posts" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                     <Line type="monotone" dataKey="users" name="New Signups" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
                   </LineChart>
                 </ResponsiveContainer>
               )}
             </div>
           </div>

           <div className="bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-6 shadow-sm backdrop-blur-xl">
             <h3 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-6">Moderation Load</h3>
             <div className="h-64 w-full">
               {loading ? (
                 <div className="w-full h-full bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />
               ) : (
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={data.chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.2)" vertical={false} />
                     <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                     <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} />
                     <Tooltip contentStyle={{ backgroundColor: 'var(--tw-prose-body)', border: '1px solid rgba(156,163,175,0.2)', borderRadius: '12px' }} />
                     <Bar dataKey="reports" name="Reports Filed" fill="#ef4444" radius={[4, 4, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               )}
             </div>
           </div>
        </div>

        {/* Suspicious Activity Panel */}
        <div className="bg-white dark:bg-[#1B1A55]/60 border border-gray-200 dark:border-[#535C91]/30 rounded-2xl p-5 shadow-sm backdrop-blur-xl">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">High Risk Users</h3>
              <Link href="/admin/users" className="h-9 px-4 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-black/20 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Manage Users</Link>
           </div>
           
           <div className="space-y-3">
             {loading ? (
               Array(3).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse" />)
             ) : data.suspiciousUsers.length === 0 ? (
               <div className="text-center py-6 text-gray-500 font-bold text-xs uppercase tracking-widest">No Suspicious Threat Activity</div>
             ) : (
               data.suspiciousUsers.map(u => (
                 <div key={u._id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center font-black text-xs text-white">
                        {u.name?.[0]?.toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</p>
                       <p className="text-xs text-gray-500">@{u.username}</p>
                     </div>
                   </div>
                   <div className="px-3 py-1 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/30 text-[10px] font-black tracking-widest">
                     RISK {u.riskScore}
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
