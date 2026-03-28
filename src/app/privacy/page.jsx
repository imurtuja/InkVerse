export const metadata = {
  title: "Privacy Policy",
  description: "Read the InkVerse Privacy Policy to understand how we protect your data and privacy on the platform.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Privacy Policy</h1>
        <p className="text-gray-500 font-medium">Last Updated: March 2026</p>
      </div>

      <div className="prose prose-lg dark:prose-invert prose-headings:font-black prose-headings:tracking-tighter">
        <section className="space-y-6">
          <h2 className="text-2xl font-black">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            InkVerse by Murtuja collects basic account information, including your email address and username, 
            to provide a personalized social experience. We also collect the content of your posts, comments, 
            and profile information that you choose to share publicly.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black">2. How We Use Your Data</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your data is used solely to maintain your account, personalize your feed, and allow 
            interaction between creators. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-black">3. Security</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            We implement industry-standard security measures to protect your information, 
            including SSL encryption and secure password hashing.
          </p>
        </section>
      </div>
    </div>
  );
}
