export const config = {
  matcher: [
    // "/api/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|privacy-policy|auth/login|accept-invite|$).*)",
  ],
};
export { auth as middleware } from "@/auth";
// export default async function middleware(req: NextRequest) {
//   const pathname = req.nextUrl.pathname;
//   const session = await getToken({ req, secret: process.env.AUTH_SECRET });

//   // Rate limiting for message endpoint
//   // if (pathname.startsWith("/api/message")) {
//   //   const ip = req.ip ?? "127.0.0.1";

//   //   try {
//   //     const { success } = await rateLimiter.limit(ip);
//   //     if (!success)
//   //       return new NextResponse("You are writing messages too fast.");
//   //     return NextResponse.next();
//   //   } catch (error) {
//   //     return new NextResponse(
//   //       "Sorry, something went wrong processing your message. Please try again later."
//   //     );
//   //   }
//   // }

//   return NextResponse.next();
// }
