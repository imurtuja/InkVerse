"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";



/**
 * Reusable avatar component with robust fallback handling.
 *
 * @param {string}  src       - Image URL (can be null/undefined/broken)
 * @param {string}  name      - User display name (used for initial fallback)
 * @param {"xs"|"sm"|"md"|"lg"} size - Avatar size preset
 * @param {string}  className - Additional classes
 * @param {boolean} ring      - Show hover ring effect
 */

const sizeMap = {
  xs: "w-6 h-6 text-[9px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[12px]",
  lg: "w-16 h-16 text-xl",
};

export default function UserAvatar({ src, name, size = "sm", className, ring = false }) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const initial = name?.[0]?.toUpperCase() || "?";
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        "relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100 dark:bg-[#1e293b]",
        sizeMap[size],
        ring && "ring-1 ring-white/10 hover:ring-2 hover:ring-primary-500/50 transition-all duration-200",
        className
      )}
    >
      {/* BASE LAYER: Default Avatar (Always visible, instantly loads) */}
      <img
        src="/default-avatar.webp"
        alt="Default"
        className="absolute inset-0 w-full h-full object-cover z-0"
        fetchPriority="high"
        draggable={false}
      />

      {/* TOP LAYER: Real User Avatar (Lazy loaded, fades in) */}
      {src && !imgError && (
        <img
          src={src}
          alt={name || "User Avatar"}
          className={cn(
            "absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 ease-in-out",
            imgLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      )}
    </div>
  );
}
