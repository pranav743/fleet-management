import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { UserRole } from "@/types/auth";

export default withAuth(
  function middleware(req) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    console.log("Middleware accessed for path:", pathname);
    if (pathname === "/") {
      return NextResponse.next();
    }
    if (pathname === "/login" || pathname === "/register") {
      if (token) {
        console.log("User already authenticated, redirecting to dashboard");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/owner") && token?.role !== UserRole.OWNER) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/driver") && token?.role !== UserRole.DRIVER) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (pathname.startsWith("/customer") && token?.role !== UserRole.CUSTOMER) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow unauthenticated access to home, login, and register pages
        if (pathname === "/" || pathname === "/login" || pathname === "/register") {
          return true;
        }
        
        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/owner/:path*", "/driver/:path*", "/customer/:path*", "/dashboard"],
};
