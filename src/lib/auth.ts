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
        email: { label: "Email", type: "text" },
        kataSandi: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, kataSandi } = credentials as {
          email: string;
          kataSandi: string;
        };

        const admin = await prisma.admin.findUnique({
          where: { email },
        });
        console.log(admin);

        if (!admin || admin.kataSandi !== kataSandi) return null;

        return {
          id: String(admin.id),
          nama: admin.nama,
          email: `${admin.email}`, // dummy email agar valid
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
      if (account && user) {
        if (account.provider === "google") {
          let pengguna = await prisma.pengguna.findUnique({
            where: { email: user.email as string },
          });

          if (!pengguna) {
            pengguna = await prisma.pengguna.create({
              data: {
                email: user.email as string,
                nama: user.name || "Pengguna Baru",
                googleId: account.providerAccountId,
              },
            });
          }

          token.id = pengguna.id;
          token.role = "USER";
          token.email = pengguna.email;
        } else if ((user as any).role === "ADMIN") {
          token.role = "ADMIN";
          token.email = (user as any).email;
          token.sub = (user as any).id;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.role === "ADMIN") {
        session.user.id = token.sub as string;
      } else if (token.role === "USER") {
        session.user.id = token.id as string;
      }

      session.user.role = token.role as "ADMIN" | "USER";
      session.user.email = token.email as string;

      return session;
    },
  },
});
