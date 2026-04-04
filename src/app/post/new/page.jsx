import PostEditor from "@/components/posts/PostEditor";

export const metadata = { title: "Create Post – InkVerse" };

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-0 py-4">
      <PostEditor />
    </div>
  );
}
