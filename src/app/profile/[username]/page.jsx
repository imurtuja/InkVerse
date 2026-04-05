"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Grid3X3,
  Edit2,
  Users,
  UserPlus,
  UserCheck,
  Settings,
  ChevronLeft,
  Grid,
} from "lucide-react";
import PostCard from "@/components/posts/PostCard";
import UserAvatar from "@/components/ui/UserAvatar";
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import EditProfileModal from "@/components/profile/EditProfileModal";

export default function ProfilePage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isOwn = session?.user?.username === resolvedParams.username;

  useEffect(() => {
    fetchProfile();
  }, [resolvedParams.username]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${resolvedParams.username}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setPosts(data.posts);
        setFollowersCount(data.user.followersCount || 0);
        setIsFollowing(data.user.followers?.includes(session?.user?.id));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session) return toast.error("Please login to follow");
    setIsFollowing(!isFollowing);
    setFollowersCount((c) => (isFollowing ? c - 1 : c + 1));
    try {
      const res = await fetch(`/api/users/${resolvedParams.username}/follow`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setIsFollowing(isFollowing);
      setFollowersCount(profile.followersCount || 0);
      toast.error("Failed to follow");
    }
  };

  const handleDelete = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
        <div className="bg-white/40 dark:bg-[#030712]/10 backdrop-blur-md border border-gray-100 dark:border-[#1e293b]/30 rounded-2xl p-8 space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-200 dark:bg-[#1e293b] animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-[#1e293b] rounded-lg animate-pulse" />
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-[#1e293b] rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="h-20 bg-gray-100/50 dark:bg-[#1e293b]/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-14 text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">User not found</h2>
        <Link href="/feed" className="text-blue-500 hover:underline flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-4 space-y-4 text-gray-900 dark:text-gray-100">
      {/* Minimalist Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#030712]/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm"
      >
        {/* Banner */}
        <div className="h-24 sm:h-32 bg-gradient-to-r from-primary-600 to-accent-600 relative">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
            {isOwn ? (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/20 transition-all uppercase tracking-wider"
              >
                <Settings className="w-3.5 h-3.5" /> Settings
              </button>
            ) : (
              <button
                onClick={handleFollow}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-4 rounded-lg text-[11px] font-bold transition-all border uppercase tracking-wider",
                  isFollowing
                    ? "bg-black/20 hover:bg-black/40 text-white border-white/20"
                    : "bg-white text-primary-600 hover:bg-gray-50 border-transparent shadow-sm"
                )}
              >
                {isFollowing ? <UserCheck className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 sm:px-6 pb-6 -mt-8 sm:-mt-10 relative z-10">
          <div className="flex items-end justify-between gap-4">
              <UserAvatar
                src={profile.image}
                name={profile.name}
                size="lg"
                className="ring-4 ring-white dark:ring-[#030712] shadow-md w-16 h-16 sm:w-20 sm:h-20 rounded-xl"
              />
            </div>
          
          <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                {profile.name}
              </h1>
              <p className="text-sm font-medium text-primary-500 mt-1">@{profile.username}</p>
              
              <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-2.5">
                <Calendar className="w-3 h-3" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{posts.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Posts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{followersCount}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{profile.following?.length || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">Following</span>
              </div>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
               <p className="text-sm text-gray-600 dark:text-gray-400 leading-normal max-w-2xl italic">
                 "{profile.bio}"
               </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <Grid className="w-3.5 h-3.5" />
            User Posts
          </h2>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white/40 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );
}
