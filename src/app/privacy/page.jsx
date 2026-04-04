export const metadata = {
  title: "Privacy Policy",
  description: "Read the InkVerse Privacy Policy to understand how we protect your data and privacy on the platform.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 py-8 space-y-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Privacy Policy</h1>
          <p className="text-gray-500 font-medium text-sm">Last Updated: March 2026</p>
        </div>

        <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:leading-tight">
          <section className="space-y-3">
            <h2 className="text-xl font-bold leading-tight">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-normal text-sm">
              InkVerse by Murtuja collects basic account information, including your email address and username, 
              to provide a personalized social experience. We also collect the content of your posts, comments, 
              and profile information that you choose to share publicly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold leading-tight">2. How We Use Your Data</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-normal text-sm">
              Your data is used solely to maintain your account, personalize your feed, and allow 
              interaction between creators. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold leading-tight">3. Security</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-normal text-sm">
              We implement industry-standard security measures to protect your information, 
              including SSL encryption and secure password hashing.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
