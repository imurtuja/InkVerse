"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Check,
  CheckCheck,
} from "lucide-react";
import useStore from "@/store/useStore";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const typeConfig = {
  like: { icon: Heart, color: "text-red-500 bg-red-50 dark:bg-red-900/20", label: "liked your post" },
  comment: { icon: MessageCircle, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20", label: "commented on your post" },
  follow: { icon: UserPlus, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20", label: "started following you" },
  mention: { icon: AtSign, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20", label: "mentioned you" },
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount, clearUnread } = useStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      clearUnread();
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-0 py-4 space-y-4 text-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary-500" />
          Notifications
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full min-w-[20px] flex items-center justify-center translate-y-[-1px] animate-in zoom-in duration-300">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/40 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl p-3.5 h-[62px] animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-24 bg-white/40 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10">
          <Bell className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">All caught up!</h3>
          <p className="text-[11px] text-gray-500 mt-1 italic">When someone interacts with your posts, you'll see it here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type] || typeConfig.like;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Link
                  href={notif.post ? `/post/${notif.post._id || notif.post}` : `/profile/${notif.sender?.username}`}
                  className={cn(
                    "flex items-start gap-3.5 p-3.5 rounded-xl transition-all duration-200 border",
                    notif.read 
                      ? "bg-white/20 dark:bg-black/20 border-gray-100 dark:border-white/5 opacity-70" 
                      : "bg-white/60 dark:bg-[#030712]/60 border-primary-500/20 dark:border-primary-500/20 shadow-sm"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden shadow-sm">
                      {notif.sender?.image ? (
                        <img src={notif.sender.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-500 text-white font-bold text-sm">
                          {notif.sender?.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className={cn("absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white dark:border-[#030712] flex items-center justify-center", config.color.split(" ").slice(1).join(" "))}>
                      <Icon className={cn("w-2.5 h-2.5", config.color.split(" ")[0])} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[13px] leading-snug">
                      <span className="font-bold">{notif.sender?.name}</span>{" "}
                      <span className="text-gray-500 dark:text-gray-400">{config.label}</span>
                    </p>
                    {notif.post?.content && (
                      <p className="text-xs text-gray-400 truncate mt-1 bg-gray-50/50 dark:bg-white/[0.03] p-1.5 rounded-lg border border-gray-100 dark:border-white/5">
                        &ldquo;{notif.post.content.substring(0, 80)}...&rdquo;
                      </p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1.5 block flex-shrink-0">{formatDate(notif.createdAt)}</span>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
