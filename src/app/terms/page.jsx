export const metadata = {
  title: "Terms of Service",
  description: "Review the Terms of Service for using InkVerse by Murtuja.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">Terms of Service</h1>
        <p className="text-gray-500 font-medium">Last Updated: March 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tighter border-l-4 border-primary-500 pl-4 py-1">1. Acceptable Use</h2>
          <p className="text-gray-600 dark:text-gray-400">
            By using InkVerse, you agree not to submit offensive, illegal, or harassing content. 
            We reserve the right to remove any content that violates these terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tighter border-l-4 border-primary-500 pl-4 py-1">2. User Content Ownership</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You retain full ownership of the text, code, and poetry you share on our platform. 
            However, by posting, you grant us a non-exclusive license to display this content 
            to other users on the platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black tracking-tighter border-l-4 border-primary-500 pl-4 py-1">3. Privacy</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Your use of the services is also governed by our Privacy Policy.
          </p>
        </section>
      </div>
    </div>
  );
}
