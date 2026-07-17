import { auth } from "@/auth";
import { buildApiUrl } from "@/lib/api/base";
import {
  buildInviteAcceptUpstreamRequest,
  classifyInviteAcceptError,
  extractInviteAcceptanceOutcome,
  getInviteErrorMessage,
  InviteAcceptRoutePayload,
  readInviteStateCookie,
} from "@/lib/invite-flow";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  Expires: "0",
};

function jsonResponse(body: InviteAcceptRoutePayload, status: number) {
  return NextResponse.json(body, {
    status,
    headers: NO_STORE_HEADERS,
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

async function parseUpstreamPayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

async function parseRequestState(request: NextRequest) {
  try {
    const payload = (await request.json()) as { state?: unknown };
    return typeof payload?.state === "string" ? payload.state : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const requestedState = await parseRequestState(request);
  const cookieStore = await cookies();
  const inviteCookie = readInviteStateCookie(
    cookieStore.getAll().map(({ name, value }) => ({ name, value })),
    requestedState
  );

  if (inviteCookie.status === "invalid_state" || inviteCookie.status === "missing") {
    return jsonResponse(
      {
        status: "invalid",
        message: "This invitation link is invalid.",
        retryable: false,
      },
      400
    );
  }

  if (inviteCookie.status === "invalid_cookie" || !inviteCookie.token || !inviteCookie.cookieName) {
    const response = jsonResponse(
      {
        status: "invalid",
        message: "This invitation link is invalid.",
        retryable: false,
      },
      400
    );

    for (const cookieName of inviteCookie.cookieNamesToClear) {
      clearInviteCookie(response, cookieName);
    }

    return response;
  }

  const session = await auth();

  if (!session?.user?.accessToken) {
    return jsonResponse(
      {
        status: "auth_required",
        message: "Sign in to accept this invitation.",
        retryable: true,
      },
      401
    );
  }

  try {
    const upstreamRequest = buildInviteAcceptUpstreamRequest(
      inviteCookie.token,
      session.user.accessToken
    );
    const upstreamResponse = await fetch(
      buildApiUrl(upstreamRequest.url),
      upstreamRequest.init
    );
    const payload = await parseUpstreamPayload(upstreamResponse);

    if (!upstreamResponse.ok) {
      const classified = classifyInviteAcceptError(
        upstreamResponse.status,
        getInviteErrorMessage(payload)
      );
      const response = jsonResponse(
        {
          status: classified.status,
          message: classified.message,
          retryable: classified.retryable,
        },
        classified.httpStatus
      );

      if (classified.clearCookie) {
        clearInviteCookie(response, inviteCookie.cookieName);
      }

      return response;
    }

    const acceptedInvitation = extractInviteAcceptanceOutcome(payload);
    const response = jsonResponse(
      acceptedInvitation.status === "success"
        ? {
            status: "success",
            message: acceptedInvitation.message,
            retryable: false,
            brewery: acceptedInvitation.brewery,
          }
        : {
            status: "completed",
            message: acceptedInvitation.message,
            retryable: false,
          },
      200
    );

    clearInviteCookie(response, inviteCookie.cookieName);
    return response;
  } catch {
    return jsonResponse(
      {
        status: "error",
        message: "Unable to accept the invitation right now. Please try again.",
        retryable: true,
      },
      502
    );
  }
}
