// lib/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 100 * 60,
  },
  pages: {
    error: "/",
    signIn: "/",
    signOut: "/",
  },
  callbacks: {
    authorized({ auth }) {
      const isAuthenticated = !!auth?.user;
      return isAuthenticated;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role; // Pastikan role dimasukkan ke token
      }
      return token;
    },
    // lib/auth.config.ts
    async session({ session, token }) {
      if (
        session.user &&
        token.role &&
        (token.role === "ADMIN" || token.role === "USER")
      ) {
        session.user.role = token.role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
