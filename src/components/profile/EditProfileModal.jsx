"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  User,
  Palette,
  Moon,
  Sun,
  Monitor,
  Save,
  Camera,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function EditProfileModal({ isOpen, onClose }) {
  const { data: session, update } = useSession();
  const { theme, setTheme } = useTheme();
  const [saving, setSaving] = useState(false);

  const router = useRouter();
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: session?.user?.name || "",
      bio: session?.user?.bio || "",
    },
  });

  useEffect(() => {
    if (isOpen && session?.user) {
      reset({
        name: session.user.name || "",
        bio: session.user.bio || "",
      });
    }
  }, [isOpen, session, reset]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("Profile updated seamlessly!");
        await update({ name: data.name, bio: data.bio });
        onClose();
        router.refresh();
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to update");
      }
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  if (!session) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" position="top-right">
      <div className="space-y-4 sm:space-y-6 max-h-[60vh] md:max-h-[500px] overflow-y-auto pr-1">
        
        {/* Profile Details Edit */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <User className="w-4 h-4" /> Attributes
          </h2>
          <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Avatar block */}
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-sm">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    session.user.name?.[0]?.toUpperCase()
                  )}
                </div>
                <button type="button" className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium tracking-wide">Public Avatar</p>
                <p className="text-xs text-gray-500 max-w-[150px]">Upload a square image to refresh your brand!</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Display Name</label>
              <input
                {...register("name")}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Biography</label>
              <textarea
                {...register("bio")}
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none font-medium"
              />
            </div>
          </form>
        </div>

        <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-2"></div>

        {/* Global Theme Edit */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4" /> Appearance Theme
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 active:scale-95 group",
                  theme === t.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20"
                )}
              >
                <t.icon className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110", theme === t.value ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[11px] sm:text-xs font-bold", theme === t.value ? "text-blue-600 dark:text-blue-400" : "text-gray-500")}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl font-bold text-[13px] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              form="edit-profile-form"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {saving ? "Updating..." : "Save Settings"}
            </button>
        </div>

      </div>
    </Modal>
  );
}
