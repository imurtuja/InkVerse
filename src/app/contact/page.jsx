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
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter">Get in Touch</h1>
        <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium">
          Have a question or a feedback? Send a message directly to the creator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tighter">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-500" />
                </div>
                <span>hello@murtuja.in</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 font-medium">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                </div>
                <span>@imurtuja on Twitter</span>
              </div>
            </div>
          </div>
          
          <div className="p-8 rounded-3xl bg-primary-500/5 border border-primary-500/10">
             <p className="text-sm font-bold text-primary-600 uppercase tracking-widest mb-2">Notice</p>
             <p className="text-gray-600 dark:text-gray-400 font-medium text-sm leading-relaxed">
               For technical support or feature requests, you can also open an issue on the InkVerse GitHub repository.
             </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-10 rounded-[2.5rem] bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/5 shadow-2xl shadow-black/5"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-400">Your Name</label>
              <input 
                required
                type="text" 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 outline-none transition-all font-medium"
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input 
                required
                type="email" 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 outline-none transition-all font-medium"
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-400">Message</label>
              <textarea 
                required
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary-500/50 outline-none transition-all font-medium resize-none"
                placeholder="How can I help you?"
              />
            </div>
            <button 
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-[0.2em] text-sm hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
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
