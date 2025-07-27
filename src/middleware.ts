// middleware.ts

import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import {
  PUBLIC_ROUTES,
  ADMIN_ROUTES,
  USER_ROUTES,
  DEFAULT_REDIRECT,
} from "./lib/route";

const { auth } = NextAuth(authConfig);

export const middleware = auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const userRole = req.auth?.user?.role;
  console.log(req.auth?.user);

  const pathname = nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isUserRoute = USER_ROUTES.some((route) => pathname.startsWith(route));

  // 🔒 Belum login & buka private route
  if (!isAuthenticated && !isPublicRoute) {
    if (isAdminRoute) {
      return Response.redirect(new URL("/admin", nextUrl));
    }
    if (isUserRoute) {
      return Response.redirect(new URL("/user", nextUrl));
    }
    return Response.redirect(new URL("/user", nextUrl)); // default redirect
  }

  // ✅ Sudah login, ingin akses route sesuai role
  if (isAuthenticated) {
    if (userRole === "ADMIN" && isUserRoute) {
      return Response.redirect(new URL("/admin", nextUrl));
    }
    if (userRole === "USER" && isAdminRoute) {
      return Response.redirect(new URL("/user/dashboard", nextUrl));
    }
  }

  return undefined;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon|public|images|.*\\.(?:ico|png|jpg|jpeg|gif|svg)$).*)",
  ],
};
