"use client";

import { useState, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Minimal code block renderer for ReactMarkdown.
 * Black bg, hover-reveal copy button, JetBrains Mono.
 *
 * Usage: <ReactMarkdown components={{ pre: CodeBlock }} />
 */
export default function CodeBlock({ children, ...props }) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef(null);

  // Deeply extract text to check if it's single-line
  const getCodeTextContext = (node) => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getCodeTextContext).join("");
    if (node?.props?.children) return getCodeTextContext(node.props.children);
    return "";
  };

  const codeText = getCodeTextContext(children);
  // It's single line if there are no newlines (or only trailing newlines)
  const isSingleLine = codeText.trim().split("\n").length === 1;

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const text = preRef.current?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className={cn(
        "group/code relative my-3 overflow-hidden border border-white/[0.08] bg-[#000] shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] transition-all flex flex-col",
        isSingleLine ? "rounded-lg px-3.5 py-2.5 sm:px-4 sm:py-3" : "rounded-xl px-4 py-3.5 md:px-[18px] md:py-[16px]"
      )}
      onClick={(e) => {
        // PREVENT NAVIGATION ON CLICKING INSIDE CODE BLOCK
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Copy button — hidden by default, visible on hover/tap */}
      <button
        onClick={handleCopy}
        className={cn(
          "absolute z-10 flex items-center justify-center rounded-md transition-all duration-200",
          isSingleLine ? "top-1/2 right-2 -translate-y-1/2 p-1" : "top-2.5 right-2.5 md:top-3 md:right-3 p-1.5",
          "opacity-0 group-hover/code:opacity-30 hover:!opacity-100 focus:opacity-100",
          copied
            ? "text-emerald-400 opacity-100"
            : "text-white/40 hover:text-white hover:bg-white/10"
        )}
        title="Copy code"
        aria-label="Copy code"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      </button>

      {/* Code content — no header, just code */}
      <pre
        ref={preRef}
        className={cn(
          "overflow-x-auto font-mono !bg-transparent !m-0 scrollbar-hide text-white/90 text-[13px] md:text-[14px]",
          isSingleLine ? "leading-normal pr-6" : "leading-[1.75] pr-8"
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
