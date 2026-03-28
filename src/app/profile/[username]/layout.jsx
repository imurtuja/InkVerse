import connectDB from "@/lib/db";
import User from "@/models/User";

export async function generateMetadata({ params }) {
  const { username } = await params;
  await connectDB();
  const user = await User.findOne({ username }).select("name username bio image").lean();

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio || `Check out ${user.name}'s profile on InkVerse by Murtuja. Browse their code snippets, poetry, and quotes.`,
    openGraph: {
      title: `${user.name} | InkVerse by Murtuja`,
      description: user.bio,
      images: [user.image || "/og-image.png"],
    },
  };
}

export default function ProfileLayout({ children }) {
  return children;
}
