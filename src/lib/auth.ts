// auth.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        const admin = await prisma.admin.findUnique({
          where: { username },
        });

        if (!admin || admin.password !== password) return null;

        return {
          id: String(admin.id),
          name: admin.username,
          email: `${admin.username}@admin.local`, // dummy email agar valid
          role: "ADMIN",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) {
      // Saat login pertama kali
      if (account && user) {
        if (account.provider === "google") {
          token.role = "USER";
        } else if ((user as any).role === "ADMIN") {
          token.role = "ADMIN";
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role as "ADMIN" | "USER";
      session.user.email = token.email as string;
      return session;
    },
  },
});
