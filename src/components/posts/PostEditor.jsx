"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  ChevronLeft,
  Send,
  Eye,
  PenTool,
  Code2,
  Feather,
  Quote,
  Music,
  StickyNote,
  Globe,
  Book,
  ChevronDown
} from "lucide-react";
import { cn, POST_CATEGORIES } from "@/lib/utils";
import toast from "react-hot-toast";

const postSchema = z.object({
  title: z.string().max(100, "Title too long").optional(),
  lang: z.string().optional(),
  content: z.string().min(1, "Content is required").max(10000, "Content too long"),
  category: z.string().default("general"),
  tags: z.string().optional(),
});

const categoryIcons = { code: Code2, poetry: Feather, quote: Quote, shayri: Book, song: Music, note: StickyNote, general: Globe };

export default function PostEditor({ initialData, isEdit = false }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialData?.title || "",
      lang: initialData?.lang || "",
      content: initialData?.content || "",
      category: initialData?.category || "general",
      tags: initialData?.tags?.join(", ") || "",
    },
  });

  const content = watch("content");
  const category = watch("category");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const tags = data.tags ? data.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [];
      const payload = {
        title: data.title,
        content: data.content,
        category: data.category,
        language: data.category === "code" ? data.lang : "",
        tags
      };

      const url = isEdit ? `/api/posts/${initialData._id}` : "/api/posts";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();
      const result = await res.json();
      toast.success(isEdit ? "Post updated!" : "Post published!");
      router.push(`/post/${result.post._id}`);
      router.refresh();
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = POST_CATEGORIES.find((c) => c.value === category) || POST_CATEGORIES[6];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 min-h-screen flex flex-col">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
        {/* Header Options */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-lg font-bold hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {isEdit ? "Edit Post" : "Create Post"}
          </button>
          
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Publishing..." : "Publish"}
          </button>
        </div>

        {/* Row 1: Title & Category */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            {...register("title")}
            placeholder="Post title (optional)"
            className="flex-1 bg-white/70 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
          />
          
          <div className="relative sm:w-64" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between bg-white/70 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-teal-500/50 transition-colors"
            >
              <span>{selectedCategoryObj.label}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl overflow-hidden shadow-xl z-20">
                {POST_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      setValue("category", cat.value);
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Tags & Language */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            {...register("tags")}
            placeholder="Tags (comma separated): javascript, motivation, love"
            className="flex-1 bg-white/70 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
          />
          {category === "code" && (
            <input
              {...register("lang")}
              placeholder="Language: javascript, python, bash..."
              className="flex-1 sm:flex-none sm:w-1/2 bg-white/70 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          )}
        </div>

        {/* Editor & Preview Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-[500px] mt-4">
          {/* Editor Column */}
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">
              <PenTool className="w-3.5 h-3.5" />
              Markdown Editor
            </div>
            <div className="relative flex-1 bg-white/70 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl overflow-hidden focus-within:border-teal-500/50 transition-colors">
              <textarea
                id="post-content"
                {...register("content")}
                placeholder={
                  category === "code"
                    ? "Write your code snippet...\n\n```javascript\nconsole.log(\"Hello InkVerse!\")\n```"
                    : category === "poetry" || category === "song" || category === "shayri"
                    ? "Write your poetry...\n\n*In the garden of words,*\n*each verse a blooming flower,*\n*silence speaks louder*\n*than any spoken hour.*"
                    : "Write your content here...\n\nSupports **bold**, *italic*, `code`, > quotes, and more!"
                }
                className="w-full h-full p-5 bg-transparent resize-none focus:outline-none text-[13px] font-mono leading-relaxed text-gray-900 dark:text-gray-300 placeholder:text-gray-400"
              />
              {errors.content && (
                <p className="absolute bottom-3 left-4 text-xs text-red-500 bg-white dark:bg-[#0b101a] px-2">{errors.content.message}</p>
              )}
            </div>
          </div>

          {/* Preview Column */}
          <div className="flex flex-col h-full hidden lg:flex">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </div>
            <div className="flex-1 bg-white/70 dark:bg-[#0b101a] border border-gray-200 dark:border-[#1e293b] rounded-xl p-5 overflow-auto">

              <div className={cn("prose-content", `post-${category}`)}>
                {content ? (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-500 italic text-[13px] font-mono">Your preview will appear here...</p>
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 px-1">Tip: Use ```language for code blocks, **bold**, *italic*, &gt; for quotes</p>
      </form>
    </div>
  );
}
