"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ShortLinkRedirect({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  useEffect(() => {
    // Small delay to show the "Redirecting" UI for a premium feel
    const timer = setTimeout(() => {
      router.replace(`/post/${postId}`);
    }, 800);

    return () => clearTimeout(timer);
  }, [postId, router]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#030712]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
        <div className="relative w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl overflow-hidden">
          <Sparkles className="w-10 h-10 text-white animate-spin-slow" />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-center space-y-2"
      >
        <h1 className="text-xl font-black text-white tracking-tight">Entering the Verse...</h1>
        <p className="text-gray-500 font-medium">Redirecting you to the original zikr</p>
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-blue-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
