// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "USER";
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "ADMIN" | "USER";
    };
  }

  interface JWT {
    role?: "ADMIN" | "USER";
    email: string;
  }
}
