import PostEditor from "@/components/posts/PostEditor";

export const metadata = { title: "Create Post – InkVerse" };

export default function NewPostPage() {
  return (
    <div className="w-full">
      <PostEditor />
    </div>
  );
}
