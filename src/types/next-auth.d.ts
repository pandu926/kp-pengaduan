// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "USER";
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "ADMIN" | "USER";
    };
  }

  interface JWT {
    id: string;
    role?: "ADMIN" | "USER";
    email: string;
  }
}
