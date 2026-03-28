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
import { cn, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProfilePage({ params }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
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
      <div className="max-w-3xl mx-auto px-4 py-8">
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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">User not found</h2>
        <Link href="/feed" className="text-blue-500 hover:underline flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-12 text-gray-900 dark:text-gray-100">
      {/* Minimalist Premium Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#0b101a] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20"
      >
        {/* Subtle Banner Strip */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 relative">
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <div className="px-6 sm:px-10 pb-10 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8 group">
            {/* Minimalist Circular Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 dark:bg-white/5 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-8 ring-white dark:ring-[#0b101a] shadow-lg transition-transform hover:scale-[1.03] duration-500">
              {profile.image ? (
                <img src={profile.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-600 font-black">
                   {profile.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                  {profile.name}
                </h1>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">@{profile.username}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
              </div>
            </div>

            {/* Repositioned Action Button to Clear Right */}
            <div className="pt-2 sm:pt-0">
              {isOwn ? (
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white border border-transparent hover:bg-gray-200 dark:hover:bg-white/10 transition-all active:scale-95"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </Link>
              ) : (
                <button
                  onClick={handleFollow}
                  className={cn(
                    "flex items-center gap-2 px-8 py-2.5 rounded-2xl text-sm font-black transition-all active:scale-95",
                    isFollowing
                      ? "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300"
                      : "bg-primary-600 text-white shadow-lg shadow-primary-500/20 hover:bg-primary-700"
                  )}
                >
                  {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mb-10 max-w-2xl px-1">
               <p className="text-lg text-gray-600 dark:text-gray-400 font-medium leading-relaxed italic border-l-4 border-primary-500/20 pl-4 py-1">
                 "{profile.bio}"
               </p>
            </div>
          )}

          {/* Clean Horizontal Stats List */}
          <div className="flex items-center gap-8 sm:gap-12 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900 dark:text-white">{posts.length}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Posts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900 dark:text-white">{followersCount}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-gray-900 dark:text-white">{profile.following?.length || 0}</span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Following</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Posts Section */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black tracking-tighter flex items-center gap-3 px-1 text-gray-950 dark:text-white">
          <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center">
            <Grid className="w-4 h-4 text-primary-500" />
          </div>
          Recent Inks
        </h2>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-3xl">
            <p className="text-gray-400 font-bold">No posts shared yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
