import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

export default async function sitemap() {
  const baseUrl = "https://inkverse.murtuja.in";

  try {
    await connectDB();

    // Fetch all users and posts for dynamic URLs
    const users = await User.find({}, "username updatedAt").lean();
    const posts = await Post.find({}, "updatedAt").lean();

    const userUrls = users.map((user) => ({
      url: `${baseUrl}/profile/${user.username}`,
      lastModified: user.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const postUrls = posts.map((post) => ({
      url: `${baseUrl}/post/${post._id}`,
      lastModified: post.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }));

    const staticUrls = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 1,
      },
      {
        url: `${baseUrl}/feed`,
        lastModified: new Date(),
        changeFrequency: "always",
        priority: 0.9,
      },
      {
        url: `${baseUrl}/signup`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.3,
      },
    ];

    return [...staticUrls, ...userUrls, ...postUrls];
  } catch (error) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "hourly",
        priority: 1,
      },
    ];
  }
}
