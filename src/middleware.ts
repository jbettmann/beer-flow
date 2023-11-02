import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/rate-limiter";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

import { authOptions } from "./app/api/auth/[...nextauth]/route";

// export { default } from "next-auth/middleware";

// Directs middleware to check url path for these routes
export const config = {
  matcher: [
    "/api/:path*",
    "/api/message/:path*",
    "/accept-invite/:path*",
    "/accept-invite",
    "/breweries",
    "/breweries/:path*",
    "/beers/",
    "/beers/:path*",
    "/settings/",
    "/settings/:path*",
  ],
};

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname; // relative path

    if (pathname.startsWith("/api/message")) {
      const ip = req.ip ?? "127.0.0.1";

      try {
        const { success } = await rateLimiter.limit(ip);

        if (!success)
          return new NextResponse("You are writing messages too fast.");
        return NextResponse.next();
      } catch (error) {
        return new NextResponse(
          "Sorry, something went wrong processing your message. Please try again later."
        );
      }
    }

    // Manage route protection

    const token = await getToken({ req });

    const isAuth = !!token;

    const isAuthPage = pathname.startsWith("/auth/login");

    const acceptInvite = pathname.startsWith("/accept-invite");

    const sensitiveRoutes = ["/"];

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/breweries", req.url));
      }
      return null;
    }

    if (!isAuth && config.matcher.some((route) => pathname.startsWith(route))) {
      // Redirect unauthenticated users trying to access the accept-invite URL to the login page
      if (acceptInvite) {
        console.log({ acceptInvite });
        const loginUrl = new URL("/auth/login", req.url);
        loginUrl.searchParams.set("next", req.url); // store the original URL
        console.log(
          "We are in conditional acceptInvite true",
          loginUrl,
          req.url
        );
        return NextResponse.redirect(loginUrl);
      }

      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);
