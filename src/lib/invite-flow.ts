const CURRENT_INVITE_TOKEN_REGEX = /^[0-9a-fA-F]{64}$/;
const LEGACY_INVITE_TOKEN_REGEX = /^[0-9a-fA-F]{32}$/;
const INVITE_STATE_REGEX = /^[a-f0-9]{32}$/;
const INVITE_COOKIE_VALUE_REGEX = /^([0-9a-fA-F]{32}|[0-9a-fA-F]{64})\.(\d{13})$/;
const EMAIL_REGEX = /\S+@\S+\.\S+/;

export const INVITE_STATE_COOKIE_PREFIX = "beer_flow_invite_state_";
export const INVITE_STATE_MAX_AGE_SECONDS = 60 * 60 * 24;
export const MAX_INVITE_STATE_COOKIES = 5;

type InviteRecipientLike = {
  id: string;
  email: string;
};

type CookieLike = {
  name: string;
  value: string;
};

export type InviteRecipientValidationResult<T extends InviteRecipientLike> = {
  isValid: boolean;
  rows: Array<
    T & {
      email: string;
      error: string;
    }
  >;
};

export type InviteAcceptStatus =
  | "success"
  | "completed"
  | "invalid"
  | "expired"
  | "auth_required"
  | "email_mismatch"
  | "error";

export type InviteAcceptRoutePayload = {
  status: InviteAcceptStatus;
  message: string;
  retryable: boolean;
  brewery?: {
    _id: string;
    companyName: string;
  };
};

export type InviteStateCookieRecord = {
  name: string;
  state: string;
  token: string;
  issuedAt: number;
};

export type InviteRouteRedirectResult = {
  redirectTo: string;
  state: string | null;
  cookieToSet:
    | {
        name: string;
        value: string;
      }
    | null;
  cookieNamesToClear: string[];
};

type AcceptInviteErrorClassification = {
  status: InviteAcceptStatus;
  httpStatus: number;
  message: string;
  retryable: boolean;
  clearCookie: boolean;
};

export type InviteAcceptUpstreamRequest = {
  url: string;
  init: RequestInit;
};

export type InviteAcceptanceOutcome =
  | {
      status: "success";
      message: string;
      brewery: {
        _id: string;
        companyName: string;
      };
    }
  | {
      status: "completed";
      message: string;
    };

type MembershipTokenFields = {
  id?: string | null;
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
  picture?: string | null;
  image?: string | null;
  breweries?: Array<string | null | undefined>;
  notifications?: Record<string, unknown> | null;
  selectedBreweryId?: string | null;
};

export type RefreshedMembershipTokenFields = {
  id: string;
  name: string | null;
  fullName: string | null;
  email: string;
  picture: string | null;
  image: string | null;
  breweries: string[];
  notifications: Record<string, unknown>;
  selectedBreweryId: string | null;
};

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getStringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function extractBreweryId(value: unknown) {
  if (typeof value === "string" && value) {
    return value;
  }

  if (isObjectRecord(value)) {
    const objectId = getStringValue(value._id);
    if (objectId) {
      return objectId;
    }

    return getStringValue(value.id);
  }

  return null;
}

function buildInviteStateRedirect(
  token: string | undefined,
  existingCookies: CookieLike[] = [],
  options?: {
    now?: number;
    state?: string;
  }
) {
  const now = options?.now ?? Date.now();
  const state = options?.state ?? createInviteState();

  if (!isValidInviteState(state)) {
    throw new Error("Generated invite state is invalid.");
  }

  const { validCookies, invalidCookieNames } = listInviteStateCookies(existingCookies);
  const cookiesToRetain = validCookies
    .sort((left, right) => right.issuedAt - left.issuedAt)
    .slice(0, MAX_INVITE_STATE_COOKIES - 1);
  const retainedCookieNames = new Set(cookiesToRetain.map((cookie) => cookie.name));
  const overflowCookieNames = validCookies
    .filter((cookie) => !retainedCookieNames.has(cookie.name))
    .map((cookie) => cookie.name);

  return {
    redirectTo: `/accept-invite?state=${state}`,
    state,
    cookieToSet: token
      ? {
          name: getInviteStateCookieName(state),
          value: encodeInviteStateCookieValue(token, now),
        }
      : null,
    cookieNamesToClear: [...invalidCookieNames, ...overflowCookieNames],
  };
}

export function isValidCurrentInviteToken(token: string) {
  return CURRENT_INVITE_TOKEN_REGEX.test(token);
}

export function isValidLegacyInviteToken(token: string) {
  return LEGACY_INVITE_TOKEN_REGEX.test(token);
}

export function isValidInviteToken(token: string) {
  return isValidCurrentInviteToken(token) || isValidLegacyInviteToken(token);
}

export function isValidInviteState(state: string) {
  return INVITE_STATE_REGEX.test(state);
}

export function createInviteState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    ""
  );
}

export function getInviteStateCookieName(state: string) {
  return `${INVITE_STATE_COOKIE_PREFIX}${state}`;
}

export function encodeInviteStateCookieValue(
  token: string,
  issuedAt = Date.now()
) {
  return `${token}.${issuedAt}`;
}

export function parseInviteStateCookie(
  cookie: CookieLike
): InviteStateCookieRecord | null {
  if (!cookie.name.startsWith(INVITE_STATE_COOKIE_PREFIX)) {
    return null;
  }

  const state = cookie.name.slice(INVITE_STATE_COOKIE_PREFIX.length);
  if (!isValidInviteState(state)) {
    return null;
  }

  const match = INVITE_COOKIE_VALUE_REGEX.exec(cookie.value);
  if (!match) {
    return null;
  }

  const [, token, issuedAtValue] = match;
  const issuedAt = Number(issuedAtValue);

  if (!isValidInviteToken(token) || !Number.isFinite(issuedAt)) {
    return null;
  }

  return {
    name: cookie.name,
    state,
    token,
    issuedAt,
  };
}

export function listInviteStateCookies(cookies: CookieLike[]) {
  const validCookies: InviteStateCookieRecord[] = [];
  const invalidCookieNames: string[] = [];

  for (const cookie of cookies) {
    if (!cookie.name.startsWith(INVITE_STATE_COOKIE_PREFIX)) {
      continue;
    }

    const parsed = parseInviteStateCookie(cookie);
    if (parsed) {
      validCookies.push(parsed);
      continue;
    }

    invalidCookieNames.push(cookie.name);
  }

  return { validCookies, invalidCookieNames };
}

export function readInviteStateCookie(
  cookies: CookieLike[],
  state: string | null | undefined
) {
  if (!state || !isValidInviteState(state)) {
    return {
      status: "invalid_state" as const,
      token: null,
      cookieName: null,
      cookieNamesToClear: [] as string[],
    };
  }

  const cookieName = getInviteStateCookieName(state);
  const cookie = cookies.find((candidate) => candidate.name === cookieName);

  if (!cookie) {
    return {
      status: "missing" as const,
      token: null,
      cookieName,
      cookieNamesToClear: [] as string[],
    };
  }

  const parsed = parseInviteStateCookie(cookie);
  if (!parsed) {
    return {
      status: "invalid_cookie" as const,
      token: null,
      cookieName,
      cookieNamesToClear: [cookieName],
    };
  }

  return {
    status: "ok" as const,
    token: parsed.token,
    cookieName,
    cookieNamesToClear: [] as string[],
  };
}

export function buildInviteRouteRedirect(
  token: string | undefined,
  existingCookies: CookieLike[] = [],
  options?: {
    now?: number;
    state?: string;
  }
): InviteRouteRedirectResult {
  if (!token || !isValidCurrentInviteToken(token)) {
    return {
      redirectTo: "/accept-invite?error=invalid",
      state: null,
      cookieToSet: null,
      cookieNamesToClear: [],
    };
  }

  return buildInviteStateRedirect(token, existingCookies, options);
}

export function buildLegacyInviteRelayRedirect(
  token: string | undefined,
  existingCookies: CookieLike[] = [],
  options?: {
    now?: number;
    state?: string;
  }
): InviteRouteRedirectResult {
  if (!token || !isValidLegacyInviteToken(token)) {
    return {
      redirectTo: "/accept-invite?error=invalid",
      state: null,
      cookieToSet: null,
      cookieNamesToClear: [],
    };
  }

  return buildInviteStateRedirect(token, existingCookies, options);
}

export function sanitizeNextPath(
  candidate: string | null | undefined,
  fallback = "/dashboard/overview",
  allowedOrigin?: string
) {
  if (!candidate) {
    return fallback;
  }

  const trimmed = candidate.trim();

  if (
    !trimmed ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("\\") ||
    /[\u0000-\u001f]/.test(trimmed)
  ) {
    return fallback;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (!allowedOrigin) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed);
    const origin = new URL(allowedOrigin);

    if (parsed.origin !== origin.origin) {
      return fallback;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}

export function validateInviteRecipients<T extends InviteRecipientLike>(
  rows: T[]
): InviteRecipientValidationResult<T> {
  const normalizedCounts = new Map<string, number>();

  const trimmedRows = rows.map((row) => {
    const email = row.email.trim();
    if (email) {
      const normalizedEmail = email.toLowerCase();
      normalizedCounts.set(
        normalizedEmail,
        (normalizedCounts.get(normalizedEmail) ?? 0) + 1
      );
    }

    return {
      ...row,
      email,
      error: "",
    };
  });

  const validatedRows = trimmedRows.map((row) => {
    if (!row.email) {
      return { ...row, error: "Email address is required." };
    }

    if (!EMAIL_REGEX.test(row.email)) {
      return { ...row, error: "Enter a valid email address." };
    }

    if ((normalizedCounts.get(row.email.toLowerCase()) ?? 0) > 1) {
      return { ...row, error: "Duplicate email address in this submission." };
    }

    return row;
  });

  return {
    isValid: validatedRows.every((row) => !row.error),
    rows: validatedRows,
  };
}

export function mergeUniqueStrings(
  values: Array<string | null | undefined>,
  nextValue: string | null | undefined
) {
  const merged = new Set(
    values.filter((value): value is string => typeof value === "string" && !!value)
  );

  if (nextValue) {
    merged.add(nextValue);
  }

  return Array.from(merged);
}

export function toUniqueStringArray(values: Array<string | null | undefined>) {
  return mergeUniqueStrings(values, null);
}

export function mergeRefreshedMembershipTokenFields(
  current: MembershipTokenFields,
  refreshedUser: unknown
): RefreshedMembershipTokenFields | null {
  if (!isObjectRecord(refreshedUser)) {
    return null;
  }

  const id = getStringValue(refreshedUser._id) ?? getStringValue(refreshedUser.id);
  const email = getStringValue(refreshedUser.email);
  const breweriesValue = refreshedUser.breweries;

  if (!id || !email || !Array.isArray(breweriesValue)) {
    return null;
  }

  const breweries = toUniqueStringArray(breweriesValue.map(extractBreweryId));
  if (!breweries.length) {
    return null;
  }

  const fullName =
    getStringValue(refreshedUser.fullName) ??
    getStringValue(refreshedUser.name) ??
    current.fullName ??
    current.name ??
    null;
  const name =
    getStringValue(refreshedUser.name) ??
    getStringValue(refreshedUser.fullName) ??
    current.name ??
    current.fullName ??
    null;
  const picture =
    getStringValue(refreshedUser.picture) ??
    getStringValue(refreshedUser.image) ??
    current.picture ??
    current.image ??
    null;
  const image =
    getStringValue(refreshedUser.image) ??
    getStringValue(refreshedUser.picture) ??
    current.image ??
    current.picture ??
    null;
  const notifications = isObjectRecord(refreshedUser.notifications)
    ? refreshedUser.notifications
    : isObjectRecord(current.notifications)
      ? current.notifications
      : {};
  const requestedSelectedBreweryId =
    getStringValue(refreshedUser.selectedBreweryId) ?? current.selectedBreweryId ?? null;
  const selectedBreweryId = breweries.includes(requestedSelectedBreweryId ?? "")
    ? requestedSelectedBreweryId
    : breweries[0] ?? null;

  return {
    id,
    name,
    fullName,
    email,
    picture,
    image,
    breweries,
    notifications,
    selectedBreweryId,
  };
}

export function buildInviteAcceptAttemptKey(state: string, attempt: number) {
  return `${state}:${attempt}`;
}

export function getOrCreateInviteAcceptRequest<T>(
  requests: Map<string, Promise<T>>,
  key: string,
  factory: () => Promise<T>
) {
  const existingRequest = requests.get(key);
  if (existingRequest) {
    return existingRequest;
  }

  const request = factory().finally(() => {
    requests.delete(key);
  });

  requests.set(key, request);
  return request;
}

export function extractInviteAcceptanceOutcome(
  payload: unknown
): InviteAcceptanceOutcome {
  if (!payload || typeof payload !== "object") {
    return {
      status: "completed",
      message:
        "Invitation accepted. Your brewery membership is syncing. Redirecting to dashboard.",
    };
  }

  const brewery = (payload as { brewery?: unknown }).brewery;

  if (!brewery || typeof brewery !== "object") {
    return {
      status: "completed",
      message:
        getInviteErrorMessage(payload) ??
        "Invitation accepted. Your brewery membership is syncing. Redirecting to dashboard.",
    };
  }

  const breweryId = (brewery as { _id?: unknown })._id;
  const companyName = (brewery as { companyName?: unknown }).companyName;

  if (typeof breweryId !== "string" || typeof companyName !== "string") {
    return {
      status: "completed",
      message:
        getInviteErrorMessage(payload) ??
        "Invitation accepted. Your brewery membership is syncing. Redirecting to dashboard.",
    };
  }

  return {
    status: "success",
    message:
      getInviteErrorMessage(payload) ?? "Invitation accepted successfully.",
    brewery: {
      _id: breweryId,
      companyName,
    },
  };
}

export function buildInviteAcceptUpstreamRequest(
  token: string,
  accessToken: string
): InviteAcceptUpstreamRequest {
  if (isValidLegacyInviteToken(token)) {
    const url = new URL("/accept-invite", "https://beerflow.local");
    url.searchParams.set("token", token);

    return {
      // Transitional legacy path: 32-char invite tokens still terminate on the
      // legacy GET endpoint until backend rollout completes.
      url: url.pathname + url.search,
      init: {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      },
    };
  }

  if (isValidCurrentInviteToken(token)) {
    return {
      url: "/accept-invite",
      init: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ token }),
        cache: "no-store",
      },
    };
  }

  throw new Error("Invite token is invalid.");
}

export function classifyInviteAcceptError(
  status: number,
  message: string | undefined
): AcceptInviteErrorClassification {
  const normalizedMessage = (message ?? "").toLowerCase();
  const isCutover410 =
    status === 410 &&
    (normalizedMessage.includes("legacy") ||
      normalizedMessage.includes("revoked") ||
      normalizedMessage.includes("security") ||
      normalizedMessage.includes("upgrade") ||
      normalizedMessage.includes("resend"));

  if (status === 401) {
    return {
      status: "auth_required",
      httpStatus: 401,
      message: "Sign in to accept this invitation.",
      retryable: true,
      clearCookie: false,
    };
  }

  if (
    status === 403 ||
    normalizedMessage.includes("email-bound") ||
    normalizedMessage.includes("email bound") ||
    normalizedMessage.includes("email does not match") ||
    normalizedMessage.includes("wrong account")
  ) {
    return {
      status: "email_mismatch",
      httpStatus: 403,
      message: "Sign in with the email address that received this invitation.",
      retryable: false,
      clearCookie: false,
    };
  }

  if (status === 410 || normalizedMessage.includes("expired")) {
    return {
      status: "expired",
      httpStatus: 410,
      message: isCutover410
        ? "This invitation link is no longer usable after the security upgrade. Ask your brewery manager to resend the invitation."
        : "This invitation has expired.",
      retryable: false,
      clearCookie: true,
    };
  }

  if (
    normalizedMessage.includes("invalid") ||
    normalizedMessage.includes("malformed") ||
    normalizedMessage.includes("already used") ||
    normalizedMessage.includes("not found")
  ) {
    return {
      status: "invalid",
      httpStatus: 400,
      message: "This invitation link is invalid.",
      retryable: false,
      clearCookie: true,
    };
  }

  if (status >= 500) {
    return {
      status: "error",
      httpStatus: 502,
      message: "Unable to accept the invitation right now. Please try again.",
      retryable: true,
      clearCookie: false,
    };
  }

  return {
    status: "error",
    httpStatus: Math.max(status, 400),
    message: "Unable to accept the invitation right now. Please try again.",
    retryable: false,
    clearCookie: false,
  };
}

export function getInviteErrorMessage(payload: unknown) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return undefined;
}
