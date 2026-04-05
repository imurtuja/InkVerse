import PostEditor from "@/components/posts/PostEditor";

export const metadata = { title: "Create Post – InkVerse" };

export default function NewPostPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 pb-[120px] md:pb-8">
      <PostEditor />
    </div>
  );
}
