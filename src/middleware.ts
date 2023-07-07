import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "./lib/rate-limiter";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

import { authOptions } from "./app/api/auth/[...nextauth]/route";

// export { default } from "next-auth/middleware";

// Directs middleware to check url path for these routes
export const config = {
  matcher: [
    "/",
    "/api/:path*",
    "/api/message/:path*",
    "/breweries/:path*",
    "/beers/:path*",
    "/admin/:path*",
  ],
};

export default withAuth(
  async function middleware(req: NextRequest) {
    const pathname = req.nextUrl.pathname; // relative path

    if (pathname.startsWith("/api")) {
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

    const isAuthPage = pathname.startsWith("/api/auth/signin");

    const sensitiveRoutes = ["/"];

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
    }

    if (
      !isAuth &&
      sensitiveRoutes.some((route) => pathname.startsWith(route))
    ) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
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
