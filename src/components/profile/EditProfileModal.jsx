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
      <div className="space-y-3">
        
        {/* Profile Details Edit */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <User className="w-3.5 h-3.5" /> Attributes
          </h2>
          <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Avatar block */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-lg font-bold overflow-hidden shadow-sm">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    session.user.name?.[0]?.toUpperCase()
                  )}
                </div>
                <button type="button" className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors">
                  <Camera className="w-2.5 h-2.5" />
                </button>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 font-medium">Public Avatar</p>
                <p className="text-[11px] text-gray-500 max-w-[150px]">Upload a square image to refresh your brand!</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-0.5">Display Name</label>
              <input
                {...register("name")}
                className="w-full px-3.5 py-2 h-10 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-0.5">Biography</label>
              <textarea
                {...register("bio")}
                rows={2}
                placeholder="Tell us about yourself..."
                className="w-full px-3.5 py-2 rounded-xl bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all resize-none font-medium"
              />
            </div>
          </form>
        </div>

        <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-1"></div>

        {/* Theme */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Palette className="w-3.5 h-3.5" /> Appearance
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 active:opacity-70 group",
                  theme === t.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20"
                )}
              >
                <t.icon className={cn("w-4 h-4 transition-colors", theme === t.value ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-[11px] font-medium", theme === t.value ? "text-blue-600 dark:text-blue-400" : "text-gray-500")}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-2 h-9 rounded-xl font-medium text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              form="edit-profile-form"
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 h-9 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all active:opacity-80"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Updating..." : "Save"}
            </button>
        </div>

      </div>
    </Modal>
  );
}
