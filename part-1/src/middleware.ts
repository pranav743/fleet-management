import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/auth";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/owner") && token?.role !== UserRole.OWNER) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/driver") && token?.role !== UserRole.DRIVER) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/customer") && token?.role !== UserRole.CUSTOMER) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (pathname === "/" && token) {
      if (token.role === UserRole.OWNER) {
        return NextResponse.redirect(new URL("/owner", req.url));
      }
      if (token.role === UserRole.DRIVER) {
        return NextResponse.redirect(new URL("/driver", req.url));
      }
      if (token.role === UserRole.CUSTOMER) {
        return NextResponse.redirect(new URL("/customer", req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/", "/owner/:path*", "/driver/:path*", "/customer/:path*", "/dashboard"],
};
