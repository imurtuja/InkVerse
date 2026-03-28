"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PenTool,
  Code2,
  Feather,
  Quote,
  ArrowRight,
  Star,
  Heart,
  Users,
  Activity,
  BookOpen,
  Music,
  MessageCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const features = [
  { icon: Code2, title: "Code Snippets", desc: "Share code with syntax highlighting for JavaScript, Python, TypeScript, and more.", color: "text-blue-400 bg-blue-500/10" },
  { icon: Feather, title: "Poetry & Shayri", desc: "Post poetry and shayri with preserved line breaks and elegant centered styling.", color: "text-purple-400 bg-purple-500/10" },
  { icon: Quote, title: "Quotes & Wisdom", desc: "Share quotes with beautiful blockquote formatting and proper attribution.", color: "text-amber-400 bg-amber-500/10" },
  { icon: BookOpen, title: "Rich Markdown", desc: "Full Markdown support bold, italic, code blocks, lists, headings, and links.", color: "text-emerald-400 bg-emerald-500/10" },
  { icon: Users, title: "Social Feed", desc: "Follow creators, like and comment on posts, and build your own community.", color: "text-pink-400 bg-pink-500/10" },
  { icon: Activity, title: "Lightning Fast", desc: "Built on Next.js 15 with optimized server rendering and instant navigation.", color: "text-orange-400 bg-orange-500/10" },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden pt-14">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] mb-8 bg-white/5 backdrop-blur-sm">
              <Feather className="w-4 h-4 text-primary-500" />
              The new way to share words
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight"
          >
            Where Code Meets{" "}
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-accent-400 bg-clip-text text-transparent">
              Poetry
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-base sm:text-lg text-[hsl(var(--muted-foreground))] max-w-xl mx-auto mb-10 leading-relaxed"
          >
            Share code snippets with syntax highlighting, poetry with preserved formatting,
            quotes that inspire all in one beautiful, unified space.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              href="/signup"
              className="px-8 py-4 rounded-2xl bg-white dark:bg-white text-black font-bold hover:bg-white/90 transition-all shadow-xl shadow-white/10 flex items-center gap-2 group"
            >
              Get Started for Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/feed"
              className="px-8 py-4 rounded-2xl bg-transparent border border-[hsl(var(--border))] font-bold hover:bg-white/5 transition-all"
            >
              Explore Feed
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="p-8 rounded-3xl glass-card border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Feather className="w-8 h-8 text-primary-600 dark:text-primary-400 group-hover:-translate-y-0.5 transition-all duration-300" />
            <span className="logo-glow logo-shimmer text-xl font-black bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent tracking-tight transition-all duration-300">
              InkVerse
            </span>
          </div>
          <div className="flex gap-8 text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            © 2026 InkVerse Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
