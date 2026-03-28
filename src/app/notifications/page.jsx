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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-500" />
          Notifications
          {unreadCount > 0 && (
            <span className="text-sm bg-primary-500 text-white px-2.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-primary-500 hover:underline font-medium">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4 h-16 skeleton" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">When someone interacts with your posts, you&apos;ll see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type] || typeConfig.like;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={notif.post ? `/post/${notif.post._id || notif.post}` : `/profile/${notif.sender?.username}`}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.01]",
                    notif.read ? "glass-card opacity-70" : "glass-card border-l-4 border-primary-500"
                  )}
                >
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", config.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{notif.sender?.name}</span>{" "}
                      <span className="text-gray-500">{config.label}</span>
                    </p>
                    {notif.post?.content && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">{notif.post.content.substring(0, 60)}...</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(notif.createdAt)}</span>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
