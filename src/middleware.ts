import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: [
    "/api/:path*",
    "/api/message/:path*",
    "/accept-invite/:path*",
    "/accept-invite",
    "/dashboard/breweries",
    "/dashboard/breweries/:path*",
    "/dashboard/breweries/beers/",
    "/dashboard/breweries/beers/:path*",
    "/settings/",
    "/settings/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const session = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Rate limiting for message endpoint
  // if (pathname.startsWith("/api/message")) {
  //   const ip = req.ip ?? "127.0.0.1";

  //   try {
  //     const { success } = await rateLimiter.limit(ip);
  //     if (!success)
  //       return new NextResponse("You are writing messages too fast.");
  //     return NextResponse.next();
  //   } catch (error) {
  //     return new NextResponse(
  //       "Sorry, something went wrong processing your message. Please try again later."
  //     );
  //   }
  // }

  // Authentication checks
  const isAuth = !!session?.accessToken;
  const isAuthPage = pathname.startsWith("/auth/login");
  const acceptInvite = pathname.startsWith("/accept-invite");

  // Redirect authenticated users away from login page to /dashboard/overview
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard/overview", req.url));
  }

  // Redirect unauthenticated users trying to access protected pages
  if (!isAuth && config.matcher.some((route) => pathname.startsWith(route))) {
    if (acceptInvite) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("next", req.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}
