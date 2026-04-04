"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent! Murtuja will get back to you soon.");
      setLoading(false);
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">Get in Touch</h1>
        <p className="text-base text-gray-500 max-w-xl mx-auto font-medium">
          Have a question or a feedback? Send a message directly to the creator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold leading-tight">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium text-sm">
                <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary-500" />
                </div>
                <span>hello@murtuja.in</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 font-medium text-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                </div>
                <span>@imurtuja on Twitter</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
             <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1.5">Notice</p>
             <p className="text-gray-600 dark:text-gray-400 font-medium text-sm leading-normal">
               For technical support or feature requests, you can also open an issue on the InkVerse GitHub repository.
             </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-5 rounded-2xl bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Your Name</label>
              <input 
                required
                type="text" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 outline-none transition-all font-medium text-sm h-10"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 outline-none transition-all font-medium text-sm h-10"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Message</label>
              <textarea 
                required
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 outline-none transition-all font-medium text-sm resize-none"
                placeholder="How can I help you?"
              />
            </div>
            <button 
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 transition-all active:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 h-10"
            >
              {loading ? "Sending..." : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
