import connectDB from "@/lib/db";
import Post from "@/models/Post";

export async function generateMetadata({ params }) {
  const { id } = await params;
  
  try {
    await connectDB();
    const post = await Post.findById(id).populate("author", "name username").lean();

    if (!post) {
      return { title: "Post Not Found" };
    }

    const title = post.title || `${post.category.charAt(0).toUpperCase() + post.category.slice(1)} by ${post.author.name}`;
    const description = post.content.length > 160 
      ? post.content.substring(0, 157) + "..." 
      : post.content;

    return {
      title: title,
      description: description,
      openGraph: {
        title: `${title} | InkVerse`,
        description: description,
        type: "article",
        authors: [post.author.username],
        images: post.images?.[0] ? [{ url: post.images[0] }] : ["/og-image.png"],
      },
      twitter: {
        card: "summary_large_image",
        title: title,
        description: description,
      },
    };
  } catch (error) {
    return { title: "Error Loading Post" };
  }
}

export default function PostLayout({ children }) {
  return children;
}
