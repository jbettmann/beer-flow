export const config = {
  // api, _next/static, _next/image, favicon.ico, and static assets are intentionally not included in the explicit matcher list.
  matcher: [
    "/",
    "/help/:path*",
    "/privacy-policy",
    "/auth/login",
    "/auth/signup",
    "/auth/create/account",
    "/accept-invite",
    "/dashboard/:path*",
    "/settings/:path*",
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
