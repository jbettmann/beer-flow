import {
  buildInviteRouteRedirect,
  INVITE_STATE_MAX_AGE_SECONDS,
} from "@/lib/invite-flow";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function applyInviteCookieMutation(response: NextResponse, name: string, value: string) {
  response.cookies.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: INVITE_STATE_MAX_AGE_SECONDS,
  });
}

function clearInviteCookie(response: NextResponse, cookieName: string) {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      token: string;
    }>;
  }
) {
  const { token } = await context.params;
  const cookieStore = await cookies();
  const inviteResult = buildInviteRouteRedirect(
    token,
    cookieStore.getAll().map(({ name, value }) => ({ name, value }))
  );
  const response = NextResponse.redirect(
    new URL(inviteResult.redirectTo, request.url)
  );

  for (const cookieName of inviteResult.cookieNamesToClear) {
    clearInviteCookie(response, cookieName);
  }

  if (inviteResult.cookieToSet) {
    applyInviteCookieMutation(
      response,
      inviteResult.cookieToSet.name,
      inviteResult.cookieToSet.value
    );
  }

  return response;
}
