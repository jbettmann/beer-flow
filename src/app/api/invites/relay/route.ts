import {
  buildLegacyInviteRelayRedirect,
  INVITE_STATE_MAX_AGE_SECONDS,
} from "@/lib/invite-flow";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

type InviteRelayResponse = {
  redirectTo: string;
};

function jsonResponse(body: InviteRelayResponse, status: number) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
  });
}

function setInviteCookie(response: NextResponse, name: string, value: string) {
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

async function parseRequestToken(request: NextRequest) {
  try {
    const payload = (await request.json()) as { token?: unknown };
    return typeof payload?.token === "string" ? payload.token : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const token = await parseRequestToken(request);
  const cookieStore = await cookies();
  const inviteResult = buildLegacyInviteRelayRedirect(
    token ?? undefined,
    cookieStore.getAll().map(({ name, value }) => ({ name, value }))
  );
  const status = inviteResult.cookieToSet ? 200 : 400;
  const response = jsonResponse(
    {
      redirectTo: inviteResult.redirectTo,
    },
    status
  );

  for (const cookieName of inviteResult.cookieNamesToClear) {
    clearInviteCookie(response, cookieName);
  }

  if (inviteResult.cookieToSet) {
    setInviteCookie(
      response,
      inviteResult.cookieToSet.name,
      inviteResult.cookieToSet.value
    );
  }

  return response;
}
