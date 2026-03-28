import { motion } from "framer-motion";
import { Feather, Code2, Globe, Shield } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn more about InkVerse by Murtuja — where code meets poetry in a professional social ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter">
          Where Code Meets <span className="text-primary-500">Poetry</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
          InkVerse is a professional social ecosystem designed by Murtuja for creators who speak 
          in both rhythmic verses and complex algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
            <Code2 className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-black mb-4">Syntax & Soul</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Sharing code shouldn't feel like a chore. Our platform treats code snippets with the 
            same elegance as fine literature, featuring professional syntax highlighting.
          </p>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
            <Feather className="w-6 h-6 text-purple-500" />
          </div>
          <h2 className="text-2xl font-black mb-4">Rhythmic Verses</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
            Preserving the formatting of poetry is our core mission. Every line break, Every indent 
            is maintained to ensure your poems read exactly as intended.
          </p>
        </div>
      </div>

      <div className="text-center py-10">
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary-500/5 border border-primary-500/10 text-primary-600 font-black uppercase tracking-widest text-xs">
          Created by Murtuja
        </div>
      </div>
    </div>
  );
}
