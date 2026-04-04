"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, User, MessageSquare, Heart, Bookmark, ArrowRight, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useStore from "@/store/useStore";
import { cn } from "@/lib/utils";

const iconMap = {
  like: { icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
  comment: { icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
  follow: { icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  mention: { icon: User, color: "text-purple-500", bg: "bg-purple-500/10" },
};

export default function NotificationsDropdown({ isOpen, onClose }) {
  const dropdownRef = useRef(null);
  const { notifications, unreadCount, setNotifications, setUnreadCount } = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      fetchNotifications();
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications.slice(0, 5));
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-[#030712]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
        <h3 className="text-sm font-bold">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-[10px] font-bold uppercase tracking-wider text-primary-500 hover:text-primary-600 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-gray-500">Syncing...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-xs text-gray-500 font-medium">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {notifications.map((notif) => {
              const config = iconMap[notif.type] || iconMap.mention;
              const Icon = config.icon;
              return (
                <Link
                  key={notif._id}
                  href={notif.post ? `/post/${notif.post._id || notif.post}` : `/profile/${notif.sender?.username}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-start gap-3 p-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors",
                    !notif.read && "bg-primary-500/[0.02]"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                      {notif.sender?.image ? (
                        <img src={notif.sender.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs">
                          {notif.sender?.name?.[0]}
                        </div>
                      )}
                    </div>
                    <div className={cn("absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full border-2 border-white dark:border-[#030712] flex items-center justify-center", config.bg)}>
                      <Icon className={cn("w-2.5 h-2.5", config.color)} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug">
                      <span className="font-bold">{notif.sender?.name || "Someone"}</span>{" "}
                      <span className="text-gray-500 dark:text-gray-400">
                        {notif.type === "like" && "liked your post"}
                        {notif.type === "comment" && "commented on your post"}
                        {notif.type === "follow" && "started following you"}
                        {notif.type === "mention" && "mentioned you"}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Link
        href="/notifications"
        onClick={onClose}
        className="block p-3 text-center border-t border-gray-100 dark:border-white/5 text-xs font-bold text-gray-500 hover:text-primary-500 transition-colors bg-gray-50/50 dark:bg-white/[0.01]"
      >
        View all notifications
      </Link>
    </div>
  );
}
