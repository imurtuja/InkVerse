"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import Button from "@/components/ui/Button";
import {
  ChevronLeft,
  Send,
  Code2,
  Feather,
  Quote,
  Music,
  StickyNote,
  Globe,
  Book,
  ChevronDown,
  Bold,
  Italic,
  Link2,
  List,
  Code,
  Type,
  Eye,
  Edit3
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
  const [isPreview, setIsPreview] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);
  const [tagInput, setTagInput] = useState("");

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
  const title = watch("title");
  const category = watch("category");
  const tags = watch("tags") ? watch("tags").split(",").map(t => t.trim()).filter(Boolean) : [];

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const insertMarkdown = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = `${before}${prefix}${selectedText}${suffix}${after}`;
    setValue("content", newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      if (newTag && !tags.includes(newTag)) {
        const updatedTags = [...tags, newTag].join(", ");
        setValue("tags", updatedTags);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      const updatedTags = tags.slice(0, -1).join(", ");
      setValue("tags", updatedTags);
    }
  };

  const removeTag = (tagToRemove) => {
    const updatedTags = tags.filter(t => t !== tagToRemove).join(", ");
    setValue("tags", updatedTags);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const tagsArray = data.tags ? data.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [];
      const payload = {
        title: data.title,
        content: data.content,
        category: data.category,
        language: data.category === "code" ? data.lang : "",
        tags: tagsArray
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
    <div className="min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Top Header - Surface Floating UI */}
        <div className="flex items-center justify-between sticky top-14 z-30 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-xl py-3 -mx-3 px-3 border-b border-gray-200/50 dark:border-white/5">
          <div className="flex items-center gap-0 sm:gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="hidden sm:flex p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-white/10 text-[13px] font-bold tracking-tight hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-700 dark:text-gray-300 active:scale-95"
              >
                {(() => {
                  const CategoryIcon = categoryIcons[category] || categoryIcons.general;
                  return <CategoryIcon className="w-4 h-4 text-primary-500" />;
                })()}
                <span>{selectedCategoryObj.label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-50" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#030712]/95 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-xl">
                  <div className="p-2 space-y-1">
                    {POST_CATEGORIES.map((cat) => {
                      const CatIcon = categoryIcons[cat.value] || categoryIcons.general;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setValue("category", cat.value);
                            setShowCategoryDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2.5 text-[13px] font-medium rounded-xl transition-all flex items-center gap-2.5",
                            category === cat.value ? "bg-primary-50/50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                          )}
                        >
                          <CatIcon className="w-4 h-4" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-gray-100/80 dark:bg-[#0B1120] border border-gray-200 dark:border-white/10 rounded-xl h-10">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all",
                  !isPreview ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Edit3 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={cn(
                  "flex items-center justify-center gap-1.5 px-3 h-full rounded-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-all",
                  isPreview ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Eye className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Preview</span>
              </button>
            </div>

            <div className="w-[120px]">
              <Button
                type="submit"
                disabled={submitting}
                onClick={handleSubmit(onSubmit)}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-primary-100 dark:border-white/30 border-t-primary-600 dark:border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isEdit ? "Update" : "Publish"}</span>
                <span className="sm:hidden">{isEdit ? "Upd" : "Post"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Editor Surface */}
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/10 shadow-lg dark:shadow-2xl dark:shadow-black/40 rounded-2xl overflow-hidden transition-all duration-300">
          
          {!isPreview ? (
            <div className="flex flex-col h-full min-h-[600px] md:min-h-[700px]">
              {/* Integrated Toolbar */}
              <div className="flex items-center gap-1 p-1 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] overflow-x-auto whitespace-nowrap scrollbar-hide">
                {[
                  { icon: Bold, action: () => insertMarkdown("**", "**"), label: "Bold" },
                  { icon: Italic, action: () => insertMarkdown("*", "*"), label: "Italic" },
                  { icon: Code, action: () => insertMarkdown("`", "`"), label: "Code" },
                  { icon: Quote, action: () => insertMarkdown("> "), label: "Quote" },
                  { icon: List, action: () => insertMarkdown("- "), label: "List" },
                  { icon: Link2, action: () => insertMarkdown("[", "](url)"), label: "Link" },
                  { icon: Type, action: () => insertMarkdown("### "), label: "Heading" },
                ].map((tool, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={tool.action}
                    className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white transition-all"
                    title={tool.label}
                  >
                    <tool.icon className="w-4 h-4" />
                  </button>
                ))}
              </div>

              {/* Writing Surface */}
              <div className="p-4 sm:p-5 md:p-8 space-y-6 flex-1 flex flex-col">
                <input
                  {...register("title")}
                  placeholder="New zikr title here..."
                  autoFocus
                  className="w-full bg-transparent border-none text-xl md:text-2xl font-semibold focus:outline-none placeholder:text-gray-300 dark:placeholder:text-white/10 text-gray-900 dark:text-white p-0 leading-tight tracking-tight selection:bg-primary-500/20"
                />

                <div className="flex flex-wrap gap-2 items-center">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-500/10 border border-primary-500/20 rounded-lg text-[10px] font-bold text-primary-400 group">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100">×</button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? "Add tags..." : "Add more tags"}
                    className="flex-1 bg-transparent border-none text-[13px] font-semibold focus:outline-none min-w-[120px] placeholder:text-gray-300 dark:placeholder:text-white/10 text-primary-600 dark:text-primary-500/60"
                  />
                </div>

                {category === "code" && (
                  <input
                    {...register("lang")}
                    placeholder="Programming language (e.g. javascript)..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-[11px] font-bold text-primary-500 focus:outline-none tracking-widest placeholder:normal-case placeholder:text-gray-700 mt-2"
                  />
                )}

                <div className="relative flex-1 pt-2">
                  <textarea
                    {...register("content")}
                    ref={(e) => {
                      register("content").ref(e);
                      textareaRef.current = e;
                    }}
                    placeholder="Tell your story... Markdown is fully supported."
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-[15px] leading-relaxed text-gray-700 dark:text-white/80 placeholder:text-gray-300 dark:placeholder:text-white/10 min-h-[400px] md:min-h-[500px] py-2 selection:bg-primary-500/20"
                  />
                  {errors.content && (
                    <p className="text-[11px] font-bold text-red-500 mt-2">× {errors.content.message}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 md:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[600px]">
              {/* Preview Mode Rendering - EXACT MATCH WITH POST PAGE */}
              <div className="space-y-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight tracking-tight">
                  {title || "Untitled Zikr"}
                </h1>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 pb-1">
                    {tags.map((tag) => (
                      <span key={tag} className="text-[11px] font-medium text-primary-500/80">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className={cn(
                "text-sm text-white/90 leading-relaxed prose prose-sm prose-invert max-w-none break-words",
                "prose-pre:bg-black/20 prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-a:text-primary-500 prose-blockquote:border-l-primary-500 prose-blockquote:bg-white/5 prose-blockquote:py-1 prose-blockquote:px-3",
                "prose-headings:text-white prose-headings:font-semibold prose-headings:tracking-tight",
                `post-${category}`
              )}>
                {content ? (
                  <ReactMarkdown rehypePlugins={[rehypeHighlight]} remarkPlugins={[remarkGfm]}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-700 italic text-[13px] tracking-wide">No content to preview yet. Start writing something beautiful.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
