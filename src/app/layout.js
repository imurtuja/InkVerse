import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata = {
  metadataBase: new URL("https://inkverse.murtuja.in"),
  title: {
    default: "InkVerse – Share Your Words, Code & Soul",
    template: "%s | InkVerse by Murtuja",
  },
  description: "A professional social ecosystem for developers and poets. Share code snippets with syntax highlighting, elegant poetry, and meaningful quotes.",
  keywords: ["InkVerse", "Murtuja", "Code Sharing", "Poetry Platform", "Shayri", "Developer Social Network", "Text Sharing"],
  authors: [{ name: "Murtuja", url: "https://www.murtuja.in" }],
  creator: "Murtuja",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inkverse.murtuja.in",
    siteName: "InkVerse",
    title: "InkVerse – The New Way to Share Words",
    description: "Where Code Meets Poetry. A premium platform for developers, poets, and creators to share their soul.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "InkVerse by Murtuja" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "InkVerse – Share Your Words, Code & Soul",
    description: "Where Code Meets Poetry. A premium platform for creators by Murtuja.",
    creator: "@imurtuja",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} font-sans antialiased`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Navbar />
            <main className="min-h-screen pt-16 pb-20 md:pb-0">
              {children}
            </main>
            <MobileNav />
            <Toaster
              position="top-center"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  color: "hsl(var(--foreground))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "0.875rem",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
