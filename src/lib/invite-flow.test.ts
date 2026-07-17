// @ts-nocheck
import assert from "node:assert/strict";
import test from "node:test";

import {
  buildInviteAcceptAttemptKey,
  buildInviteAcceptUpstreamRequest,
  buildLegacyInviteRelayRedirect,
  buildInviteRouteRedirect,
  classifyInviteAcceptError,
  encodeInviteStateCookieValue,
  extractInviteAcceptanceOutcome,
  getOrCreateInviteAcceptRequest,
  getInviteStateCookieName,
  isValidCurrentInviteToken,
  isValidLegacyInviteToken,
  isValidInviteState,
  isValidInviteToken,
  mergeUniqueStrings,
  mergeRefreshedMembershipTokenFields,
  parseInviteStateCookie,
  readInviteStateCookie,
  resolvePreferredBreweryId,
  sanitizeNextPath,
  toUniqueStringArray,
  validateInviteRecipients,
} from "./invite-flow.ts";

test("sanitizeNextPath keeps internal invite paths and rejects open redirects", () => {
  assert.equal(
    sanitizeNextPath("/accept-invite?state=0123456789abcdef0123456789abcdef"),
    "/accept-invite?state=0123456789abcdef0123456789abcdef"
  );
  assert.equal(
    sanitizeNextPath(
      "https://beerflow.example/accept-invite?state=0123456789abcdef0123456789abcdef",
      "/fallback",
      "https://beerflow.example"
    ),
    "/accept-invite?state=0123456789abcdef0123456789abcdef"
  );
  assert.equal(
    sanitizeNextPath(
      "https://evil.example/phish",
      "/fallback",
      "https://beerflow.example"
    ),
    "/fallback"
  );
  assert.equal(sanitizeNextPath("//evil.example/phish", "/fallback"), "/fallback");
  assert.equal(sanitizeNextPath("\\\\evil.example\\phish", "/fallback"), "/fallback");
});

test("validateInviteRecipients flags case-insensitive duplicates per row", () => {
  const result = validateInviteRecipients([
    { id: "1", email: "Test@Example.com" },
    { id: "2", email: " test@example.com " },
    { id: "3", email: "other@example.com" },
  ]);

  assert.equal(result.isValid, false);
  assert.equal(result.rows[0].error, "Duplicate email address in this submission.");
  assert.equal(result.rows[1].error, "Duplicate email address in this submission.");
  assert.equal(result.rows[2].error, "");
});

test("buildInviteRouteRedirect creates independent state cookies and prunes overflow", () => {
  const token = "a".repeat(64);
  const stateA = "0123456789abcdef0123456789abcdef";
  const stateB = "fedcba9876543210fedcba9876543210";
  const overflowState = "11111111111111111111111111111111";
  const baseTime = 1700000000000;
  const redirect = buildInviteRouteRedirect(
    token,
    [
      {
        name: getInviteStateCookieName(stateA),
        value: encodeInviteStateCookieValue("b".repeat(64), baseTime + 10),
      },
      {
        name: getInviteStateCookieName(stateB),
        value: encodeInviteStateCookieValue("c".repeat(64), baseTime + 20),
      },
      {
        name: getInviteStateCookieName("22222222222222222222222222222222"),
        value: encodeInviteStateCookieValue("d".repeat(64), baseTime + 30),
      },
      {
        name: getInviteStateCookieName("33333333333333333333333333333333"),
        value: encodeInviteStateCookieValue("e".repeat(64), baseTime + 40),
      },
      {
        name: getInviteStateCookieName("44444444444444444444444444444444"),
        value: encodeInviteStateCookieValue("f".repeat(64), baseTime + 50),
      },
      {
        name: getInviteStateCookieName(overflowState),
        value: encodeInviteStateCookieValue("1".repeat(64), baseTime + 5),
      },
      {
        name: "beer_flow_invite_state_badbadbadbadbadbadbadbadbadbad",
        value: "not-a-token",
      },
    ],
    {
      now: baseTime + 60,
      state: "abcdefabcdefabcdefabcdefabcdefab",
    }
  );

  assert.equal(redirect.redirectTo, "/accept-invite?state=abcdefabcdefabcdefabcdefabcdefab");
  assert.deepEqual(redirect.cookieToSet, {
    name: "beer_flow_invite_state_abcdefabcdefabcdefabcdefabcdefab",
    value: `${token}.${baseTime + 60}`,
  });
  assert.deepEqual(redirect.cookieNamesToClear.sort(), [
    "beer_flow_invite_state_0123456789abcdef0123456789abcdef",
    "beer_flow_invite_state_11111111111111111111111111111111",
    "beer_flow_invite_state_badbadbadbadbadbadbadbadbadbad",
  ]);
});

test("readInviteStateCookie validates state strictly and isolates cookie lookup", () => {
  const stateA = "0123456789abcdef0123456789abcdef";
  const stateB = "fedcba9876543210fedcba9876543210";
  const cookieNameA = getInviteStateCookieName(stateA);
  const cookieNameB = getInviteStateCookieName(stateB);
  const tokenA = "a".repeat(64);
  const tokenB = "b".repeat(64);

  assert.equal(isValidInviteState(stateA), true);
  assert.equal(isValidInviteState("bad-state"), false);

  assert.deepEqual(
    readInviteStateCookie(
      [
        {
          name: cookieNameA,
          value: encodeInviteStateCookieValue(tokenA, 1700000000001),
        },
        {
          name: cookieNameB,
          value: encodeInviteStateCookieValue(tokenB, 1700000000002),
        },
      ],
      stateB
    ),
    {
      status: "ok",
      token: tokenB,
      cookieName: cookieNameB,
      cookieNamesToClear: [],
    }
  );
  assert.equal(readInviteStateCookie([], null).status, "invalid_state");
  assert.equal(readInviteStateCookie([], "bad-state").status, "invalid_state");
  assert.deepEqual(
    readInviteStateCookie([{ name: cookieNameA, value: "broken" }], stateA),
    {
      status: "invalid_cookie",
      token: null,
      cookieName: cookieNameA,
      cookieNamesToClear: [cookieNameA],
    }
  );
});

test("buildInviteRouteRedirect only accepts 64-char hex invite tokens", () => {
  const validToken = "a".repeat(64);
  const legacyToken = "b".repeat(32);
  const mixedCaseToken = "Ab".repeat(32);

  assert.equal(isValidInviteToken(validToken), true);
  assert.equal(isValidCurrentInviteToken(validToken), true);
  assert.equal(isValidLegacyInviteToken(legacyToken), true);
  assert.equal(isValidInviteToken(legacyToken), true);
  assert.equal(isValidInviteToken(mixedCaseToken), true);
  assert.equal(
    buildInviteRouteRedirect(validToken, [], {
      state: "0123456789abcdef0123456789abcdef",
    }).redirectTo,
    "/accept-invite?state=0123456789abcdef0123456789abcdef"
  );
  assert.deepEqual(buildInviteRouteRedirect(legacyToken), {
    redirectTo: "/accept-invite?error=invalid",
    state: null,
    cookieToSet: null,
    cookieNamesToClear: [],
  });
  assert.deepEqual(buildInviteRouteRedirect("short-token"), {
    redirectTo: "/accept-invite?error=invalid",
    state: null,
    cookieToSet: null,
    cookieNamesToClear: [],
  });
});

test("classifyInviteAcceptError clears invite cookies only for terminal token failures", () => {
  assert.deepEqual(classifyInviteAcceptError(410, "Invite expired"), {
    status: "expired",
    httpStatus: 410,
    message: "This invitation has expired.",
    retryable: false,
    clearCookie: true,
  });
  assert.deepEqual(classifyInviteAcceptError(403, "wrong account"), {
    status: "email_mismatch",
    httpStatus: 403,
    message: "Sign in with the email address that received this invitation.",
    retryable: false,
    clearCookie: false,
  });
  assert.deepEqual(classifyInviteAcceptError(502, "upstream down"), {
    status: "error",
    httpStatus: 502,
    message: "Unable to accept the invitation right now. Please try again.",
    retryable: true,
    clearCookie: false,
  });
});

test("classifyInviteAcceptError uses resend wording for secure cutover 410 responses", () => {
  assert.deepEqual(
    classifyInviteAcceptError(
      410,
      "Legacy invite revoked after security upgrade. Brewery manager must resend."
    ),
    {
      status: "expired",
      httpStatus: 410,
      message:
        "This invitation link is no longer usable after the security upgrade. Ask your brewery manager to resend the invitation.",
      retryable: false,
      clearCookie: true,
    }
  );
});

test("buildLegacyInviteRelayRedirect only accepts 32-char hex invite tokens", () => {
  const legacyToken = "a".repeat(32);

  assert.equal(
    buildLegacyInviteRelayRedirect(legacyToken, [], {
      state: "0123456789abcdef0123456789abcdef",
    }).redirectTo,
    "/accept-invite?state=0123456789abcdef0123456789abcdef"
  );
  assert.deepEqual(buildLegacyInviteRelayRedirect("b".repeat(64)), {
    redirectTo: "/accept-invite?error=invalid",
    state: null,
    cookieToSet: null,
    cookieNamesToClear: [],
  });
});

test("parseInviteStateCookie supports legacy and current token lengths", () => {
  assert.equal(
    parseInviteStateCookie({
      name: getInviteStateCookieName("0123456789abcdef0123456789abcdef"),
      value: encodeInviteStateCookieValue("a".repeat(32), 1700000000000),
    })?.token,
    "a".repeat(32)
  );
  assert.equal(
    parseInviteStateCookie({
      name: getInviteStateCookieName("fedcba9876543210fedcba9876543210"),
      value: encodeInviteStateCookieValue("b".repeat(64), 1700000000001),
    })?.token,
    "b".repeat(64)
  );
});

test("buildInviteAcceptUpstreamRequest dispatches legacy and current tokens correctly", async () => {
  assert.deepEqual(
    buildInviteAcceptUpstreamRequest("a".repeat(32), "access-token"),
    {
      url: `/accept-invite?token=${"a".repeat(32)}`,
      init: {
        method: "GET",
        headers: {
          Authorization: "Bearer access-token",
        },
        cache: "no-store",
      },
    }
  );

  const currentRequest = buildInviteAcceptUpstreamRequest(
    "b".repeat(64),
    "access-token"
  );

  assert.equal(currentRequest.url, "/accept-invite");
  assert.equal(currentRequest.init.method, "POST");
  assert.deepEqual(currentRequest.init.headers, {
    "Content-Type": "application/json",
    Authorization: "Bearer access-token",
  });
  assert.equal(currentRequest.init.cache, "no-store");
  assert.equal(
    currentRequest.init.body,
    JSON.stringify({ token: "b".repeat(64) })
  );

  await assert.rejects(
    async () => buildInviteAcceptUpstreamRequest("invalid", "access-token"),
    /Invite token is invalid/
  );
});

test("extractInviteAcceptanceOutcome handles synced and unsynced 2xx responses", () => {
  assert.deepEqual(
    extractInviteAcceptanceOutcome({
      message: "Invitation accepted.",
      brewery: {
        _id: "brewery-1",
        companyName: "Beer Flow",
      },
    }),
    {
      status: "success",
      message: "Invitation accepted.",
      brewery: {
        _id: "brewery-1",
        companyName: "Beer Flow",
      },
    }
  );
  assert.deepEqual(
    extractInviteAcceptanceOutcome({
      message: "Invitation accepted.",
    }),
    {
      status: "completed",
      message: "Invitation accepted.",
    }
  );
  assert.deepEqual(
    extractInviteAcceptanceOutcome({
      brewery: {
        _id: "brewery-1",
      },
    }),
    {
      status: "completed",
      message:
        "Invitation accepted. Your brewery membership is syncing. Redirecting to dashboard.",
    }
  );
});

test("getOrCreateInviteAcceptRequest deduplicates strict-mode repeats by state and attempt only", async () => {
  const requests = new Map();
  let runs = 0;

  const sameAttemptA = getOrCreateInviteAcceptRequest(
    requests,
    buildInviteAcceptAttemptKey("state-a", 0),
    async () => {
      runs += 1;
      return "first";
    }
  );
  const sameAttemptB = getOrCreateInviteAcceptRequest(
    requests,
    buildInviteAcceptAttemptKey("state-a", 0),
    async () => {
      runs += 1;
      return "second";
    }
  );
  const differentState = getOrCreateInviteAcceptRequest(
    requests,
    buildInviteAcceptAttemptKey("state-b", 0),
    async () => {
      runs += 1;
      return "third";
    }
  );

  assert.equal(await sameAttemptA, "first");
  assert.equal(await sameAttemptB, "first");
  assert.equal(await differentState, "third");
  assert.equal(runs, 2);

  const retryAttempt = await getOrCreateInviteAcceptRequest(
    requests,
    buildInviteAcceptAttemptKey("state-a", 1),
    async () => {
      runs += 1;
      return "retry";
    }
  );

  assert.equal(retryAttempt, "retry");
  assert.equal(runs, 3);
});

test("mergeUniqueStrings and toUniqueStringArray avoid duplicate breweries", () => {
  assert.deepEqual(mergeUniqueStrings(["a", "b"], "b"), ["a", "b"]);
  assert.deepEqual(mergeUniqueStrings(["a", null, undefined], "c"), ["a", "c"]);
  assert.deepEqual(toUniqueStringArray(["a", "b", "a", null]), ["a", "b"]);
});

test("mergeRefreshedMembershipTokenFields refreshes canonical membership and safe fields", () => {
  assert.deepEqual(
    mergeRefreshedMembershipTokenFields(
      {
        id: "user-1",
        name: "Old Name",
        fullName: "Old Name",
        email: "old@example.com",
        breweries: ["brewery-1"],
        notifications: { allow: false },
        selectedBreweryId: "brewery-9",
        picture: "old-picture",
        image: "old-image",
      },
      {
        _id: "user-2",
        fullName: "New Name",
        email: "new@example.com",
        breweries: [
          { _id: "brewery-2", companyName: "Beer Flow" },
          "brewery-3",
          { id: "brewery-2" },
        ],
        notifications: { allow: true },
        image: "new-image",
      }
    ),
    {
      id: "user-2",
      name: "New Name",
      fullName: "New Name",
      email: "new@example.com",
      breweries: ["brewery-2", "brewery-3"],
      notifications: { allow: true },
      selectedBreweryId: "brewery-2",
      picture: "new-image",
      image: "new-image",
    }
  );
});

test("mergeRefreshedMembershipTokenFields rejects unusable refresh payloads", () => {
  assert.equal(
    mergeRefreshedMembershipTokenFields(
      {
        id: "user-1",
        email: "old@example.com",
        breweries: ["brewery-1"],
        selectedBreweryId: "brewery-1",
      },
      {
        _id: "user-1",
        email: "new@example.com",
        breweries: [],
      }
    ),
    null
  );
});

test("resolvePreferredBreweryId accepts only valid preferences in priority order", () => {
  assert.equal(
    resolvePreferredBreweryId(["brewery-1", "brewery-2"], "deleted", "brewery-2"),
    "brewery-2"
  );
  assert.equal(resolvePreferredBreweryId(["brewery-1"], "deleted"), "brewery-1");
  assert.equal(resolvePreferredBreweryId([], "brewery-1"), null);
  assert.equal(
    resolvePreferredBreweryId(["brewery-2", "brewery-1", "brewery-2"]),
    "brewery-2"
  );
  assert.equal(
    resolvePreferredBreweryId(["brewery-1", "brewery-2"], null, "brewery-2"),
    "brewery-2"
  );
});
