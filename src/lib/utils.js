import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const POST_CATEGORIES = [
  { value: "code", label: "Code", icon: "Code2" },
  { value: "poetry", label: "Poetry", icon: "Feather" },
  { value: "quote", label: "Quote", icon: "Quote" },
  { value: "shayri", label: "Shayri", icon: "Book" },
  { value: "song", label: "Song", icon: "Music" },
  { value: "note", label: "Note", icon: "StickyNote" },
  { value: "general", label: "General", icon: "Globe" },
];

export const CATEGORY_COLORS = {
  code: "from-blue-500 to-cyan-500",
  poetry: "from-purple-500 to-pink-500",
  quote: "from-amber-500 to-orange-500",
  shayri: "from-rose-500 to-pink-600",
  song: "from-emerald-500 to-teal-500",
  note: "from-indigo-500 to-violet-500",
  general: "from-slate-500 to-gray-600",
};

export function formatDate(date, full = false) {
  const d = new Date(date);
  
  if (full) {
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr} at ${timeStr}`;
  }

  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: days > 365 ? "numeric" : undefined,
  });
}
