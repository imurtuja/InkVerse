import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import connectDB from "./db";
import User from "../models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  basePath: "/api/auth",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const email = credentials.email.trim().toLowerCase();

        await connectDB();

        const user = await User.findOne({ email }).select("+password");

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
          role: user.role,
          isBanned: user.isBanned,
          banReason: user.banReason,
          banExpiresAt: user.banExpiresAt,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
 
        if (!existingUser) {
          // Generate a candidate username from email or name
          const base = (user.email?.split("@")[0] || user.name?.replace(/\s+/g, "").toLowerCase() || "user");
          const username = base.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();
          
          let uniqueUsername = username;
          let counter = 1;
          while (await User.findOne({ username: uniqueUsername })) {
            uniqueUsername = `${username}${counter}`;
            counter++;
          }
 
          const newUser = await User.create({
            name: user.name || uniqueUsername,
            email: user.email,
            image: user.image,
            username: uniqueUsername,
            provider: account.provider,
          });

          // Send Welcome Email
          const { sendWelcomeEmail } = await import("./mail");
          await sendWelcomeEmail(newUser.email, newUser.name);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.image = user.image;
        token.isBanned = user.isBanned;
        token.banReason = user.banReason;
        token.banExpiresAt = user.banExpiresAt;
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString();
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.image = dbUser.image;
          token.isBanned = dbUser.isBanned;
          token.banReason = dbUser.banReason;
          token.banExpiresAt = dbUser.banExpiresAt;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.image = token.image;
        session.user.isBanned = token.isBanned;
        session.user.banReason = token.banReason;
        session.user.banExpiresAt = token.banExpiresAt;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
});
