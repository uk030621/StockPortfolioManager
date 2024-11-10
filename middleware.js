import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // If no token exists, redirect protected routes to login
  if (!token) {
    // Redirect to login if the user is not authenticated and trying to access protected pages
    if (
      pathname.startsWith("/ukstock") ||
      pathname.startsWith("/usstock") ||
      pathname.startsWith("/eustock") ||
      pathname.startsWith("/asiastock")
    ) {
      return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
    }
  } else {
    // If the user is authenticated, prevent access to signup or login pages
    if (pathname === "/signup" || pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin)); // Redirect to homepage or any other protected route
    }
  }

  return NextResponse.next();
}

// Apply the middleware to routes
export const config = {
  matcher: [
    "/ukstock/:path*",
    "/usstock/:path*",
    "/eustock/:path*",
    "/asiastock/:path*",
    "/signup",
    "/login",
  ],
};
