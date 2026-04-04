import { Feather, Code2 } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn more about InkVerse by Murtuja — where code meets poetry in a professional social ecosystem.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
          Where Code Meets <span className="text-primary-500">Poetry</span>
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-normal">
          InkVerse is a professional social ecosystem designed by Murtuja for creators who speak
          in both rhythmic verses and complex algorithms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
            <Code2 className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold leading-tight mb-3">Syntax & Soul</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-normal font-medium text-sm">
            Sharing code shouldn't feel like a chore. Our platform treats code snippets with the
            same elegance as fine literature, featuring professional syntax highlighting.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#0b101a] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
            <Feather className="w-5 h-5 text-purple-500" />
          </div>
          <h2 className="text-xl font-bold leading-tight mb-3">Rhythmic Verses</h2>
          <p className="text-gray-500 dark:text-gray-400 leading-normal font-medium text-sm">
            Preserving the formatting of poetry is our core mission. Every line break, Every indent
            is maintained to ensure your poems read exactly as intended.
          </p>
        </div>
      </div>

      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-500/5 border border-primary-500/10 text-primary-600 font-semibold uppercase tracking-wider text-xs">
          Created by Murtuja
        </div>
      </div>
    </div>
  );
}
