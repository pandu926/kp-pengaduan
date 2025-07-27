// app/admin/layout.tsx
import { SessionProvider } from "next-auth/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administration panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
