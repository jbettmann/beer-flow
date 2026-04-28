# Beer Flow security remediation plan

Date: 2026-04-28
Repo: `/home/gordev/.openclaw/workspace/repos/beer-flow`
Related local audit: `docs/local-audits/2026-04-28-beer-flow-audit-notes.md`
Related prior plan: `docs/2026-04-28-onboarding-auth-remediation-plan.md`
Related API repo: `/home/gordev/.openclaw/workspace/repos/beer-bible-API`

## Scope

This plan covers the security audit recommended fixes:

1. Remove/rotate exposed OAuth secrets.
2. Remove sensitive auth/signup logging.
3. Keep refresh/access tokens out of client-visible session data.
4. Lock down `/api/message` with auth, rate limits, size caps, and server-controlled roles.
5. Fix invite token handling and login/signup redirects.
6. Centralize server-side authorization for tenant/brewery ownership.

Jordan note from the saved audit: `/api/message` is currently unused, so it is not a product blocker. If it remains in the codebase, it should still be made safe before exposure or use.

## Current findings from repo review

### 1. OAuth secrets exposure

`next.config.js` still exposes provider secrets through `module.exports.env`:

- `GITHUB_SECRET`
- `GOOGLE_CLIENT_SECRET`
- Also exposes provider IDs that do not need to be manually inlined.

This should be removed. NextAuth can read server-only env vars directly from `process.env` in server code.

Follow-up outside code:

- Rotate any Google/GitHub OAuth secret that may have been deployed while exposed.
- Reconfigure Google provider credentials after rotation.

### 2. Sensitive auth/signup logging

Remaining sensitive/noisy logs found:

- `src/components/auth-forms/sign-up-form.tsx`
  - logs full signup form data, including password and confirm password.
  - logs signup response payload.
- `src/lib/GET/getUserByCredentials.tsx`
  - logs email/password and full returned user data.
- `src/components/CreateAccount/CreateAccount.tsx`
  - logs create-account error response data; route is now redirected but code remains.
- `src/auth.ts`
  - logs sign-in error messages; less severe, but should be normalized to safe server logging.
- Other non-auth console logs exist, but the first pass should focus on auth/signup/password/user payload logs.

### 3. Client-visible token/session exposure

`src/auth.ts` currently signs app access/refresh tokens and copies both into `session.user`:

- `session.user.accessToken`
- `session.user.refreshToken`

`src/types/users.ts` and `src/types/next-auth.d.ts` model access/refresh tokens as user/session fields, which encourages client usage.

Many client components call API helpers with `session.user.accessToken`, so fully removing this requires an incremental server-side proxy/action migration.

### 4. `/api/message` exposure

`src/app/api/message/route.ts` currently:

- accepts unauthenticated POST requests.
- parses arbitrary JSON without size/shape guard before body read.
- maps client-provided messages into OpenAI roles based on `isUserMessage`.
- lacks rate limiting.
- lacks request size caps.
- streams OpenAI output to caller.

Even though unused, it should be either disabled or hardened before public deployment.

### 5. Invite token handling and login/signup redirects

The onboarding remediation already improved:

- unauthenticated invite users redirect to login with `next` preserved.
- authenticated invite users are allowed through.
- login form preserves `next`.
- `/auth/create/account` redirects to `/auth/signup`.

Remaining security issue:

- invite tokens are still passed in URL query strings (`/accept-invite?token=...`) and forwarded to the API query string.
- Query string tokens can leak through logs, browser history, referrers, analytics, and screenshots.

API compatibility needs checking before changing this, because Beer Bible API currently exposes `/accept-invite?token=...`.

### 6. Tenant/brewery authorization

Current frontend architecture still relies heavily on:

- browser/session-visible `selectedBreweryId`.
- `localStorage` selected brewery values.
- client-visible bearer tokens.
- client-side API calls for brewery/beer/category/staff mutations.

This should move toward server-side authorization wrappers that derive identity from the server session and validate brewery membership/role before mutation.

## Recommended implementation order

### Phase 1 — Remove exposed secrets and sensitive logging

Goal: eliminate obvious secret leaks and password/form-data logs without broad architecture changes.

Changes:

1. Remove `env` block from `next.config.js` for OAuth secrets/IDs.
   - Do not expose `GITHUB_SECRET` or `GOOGLE_CLIENT_SECRET` via Next config.
   - Keep provider credentials server-only in `.env`/deployment environment.
2. Remove or sanitize auth/signup logs:
   - `src/components/auth-forms/sign-up-form.tsx`
   - `src/lib/GET/getUserByCredentials.tsx`
   - `src/components/CreateAccount/CreateAccount.tsx` if retained temporarily.
   - `src/auth.ts` sign-in error logging should avoid raw provider/API details when possible.
3. Replace sensitive logs with user-safe toast messages and optional development-only sanitized diagnostics.
4. Add a short `docs/security-operations.md` note or checklist for rotating exposed OAuth secrets.

Acceptance checks:

- `next.config.js` no longer contains `GOOGLE_CLIENT_SECRET`, `GITHUB_SECRET`, or provider env passthrough.
- `grep` finds no password/form-data credential logging in auth/signup code.
- Signup and credentials login still work against existing API in dev.
- `pnpm lint` and `pnpm build` pass or are no worse than baseline.

### Phase 2 — Minimize browser-visible session data

Goal: stop exposing refresh tokens and broad sensitive user objects to the browser.

Recommended approach:

1. Immediate safe reduction:
   - Remove `refreshToken` from `session.user`.
   - Remove `refreshToken` from `src/types/next-auth.d.ts` session/user type.
   - Remove `refreshToken` from `src/types/users.ts` user model unless it is genuinely returned by the API and needed server-side.
2. Keep any API access token server-side where possible.
3. If an access token must remain temporarily for existing client calls, document it as a temporary compatibility bridge and remove it only after server route/action migration.
4. Narrow JWT payload creation in `src/lib/jwt.ts` / `src/auth.ts`:
   - Do not sign the full user object.
   - Use minimal claims: user id, email if needed, brewery ids, selected brewery id, role/permissions if available.
   - Never include password, refresh token, full notifications object unless needed.
5. Move token refresh logic out of client-visible session callbacks.

Acceptance checks:

- Browser session payload no longer includes `refreshToken`.
- JWT payload no longer signs full API user objects.
- Type definitions no longer encourage client refresh-token usage.
- Existing screens that rely on `session.user.accessToken` remain functional until Phase 4 migration removes that dependency.

### Phase 3 — Lock down or disable `/api/message`

Goal: remove unauthenticated OpenAI proxy risk.

Recommended option for now: disable by default unless explicitly enabled.

Changes:

1. Add an env guard such as `ENABLE_MESSAGE_API=true`.
   - If not enabled, return `404` or `403`.
2. Require authentication using `auth()` before processing.
3. Add request body size protection.
   - Prefer route/runtime config or manual byte-length cap before JSON parsing.
   - Suggested cap: 8–16 KB unless product requirements need more.
4. Validate schema strictly.
   - Cap number of messages.
   - Cap text length per message and total text length.
5. Server-control roles.
   - Treat all caller-provided content as user text.
   - Never allow callers to set OpenAI `system`, `assistant`, or arbitrary roles.
6. Add rate limiting.
   - Use existing Upstash dependencies if configured.
   - Key by authenticated user id first, IP fallback second.
7. Return safe errors only.

Acceptance checks:

- Unauthenticated `/api/message` request is rejected.
- Oversized request is rejected.
- Caller cannot inject non-user/system roles.
- Rate-limit path is covered or the endpoint is disabled until rate-limit env is configured.
- If Jordan confirms it is unused, endpoint can be disabled entirely in production.

### Phase 4 — Invite token hardening

Goal: reduce invite token leakage without breaking Beer Bible API compatibility.

Changes:

1. Confirm API support in `beer-bible-API`.
   - Current API appears to use `/accept-invite?token=...`.
2. Preferred target architecture:
   - frontend invite link contains a short opaque code only.
   - Next route handler receives the code and exchanges/accepts server-side.
   - token is stored/forwarded server-side, not kept in long-lived client URLs.
3. Incremental app-only improvement if API cannot change yet:
   - After reading token from URL, immediately replace browser history state to remove `?token=...`.
   - Avoid logging token anywhere.
   - Ensure redirects preserve invite intent without duplicating token unnecessarily.
4. Better API change, if allowed later:
   - add `POST /accept-invite` with token in request body or one-time server exchange.
   - make invite tokens short-lived and single-use.

Acceptance checks:

- Invite acceptance still works.
- Token is not logged by frontend code.
- Browser URL is cleaned after token capture where feasible.
- Long-term API change is documented if not implemented in this repo.

### Phase 5 — Server-side authorization and mutation migration

Goal: prevent client-controlled brewery IDs/tokens from becoming the authorization source.

Recommended architecture:

1. Create server-side API wrappers/route handlers/server actions for mutations:
   - create/update/delete beer
   - create/update/delete category
   - staff invite/remove/admin toggle
   - brewery profile update/delete
   - notification preference update
2. Each server-side mutation should:
   - call `auth()` to get the server session.
   - derive user id and brewery membership from server-owned session/JWT claims or backend API lookup.
   - validate the requested `breweryId` belongs to the current user.
   - validate owner/admin permission for privileged actions.
   - call Beer Bible API server-side with server-held auth token.
3. Keep `selectedBreweryId` as UI state only, not an authorization decision.
4. Avoid trusting `localStorage` for authorization or mutation ownership.
5. Migrate by domain to reduce risk:
   - staff/admin operations first.
   - brewery profile/delete next.
   - beer/category mutations next.

Acceptance checks:

- Client mutation code no longer passes raw bearer tokens.
- Server checks user/brewery relationship before mutation.
- Staff/admin actions require admin/owner role server-side.
- Bad brewery IDs fail even if manually supplied from the browser.

### Phase 6 — Medium-priority hardening pass

Goal: address remaining audit issues after the critical/high pass.

Changes:

1. Add security headers/CSP in `next.config.js` or middleware.
   - Start report-only if needed, then enforce.
2. Remove `typescript.ignoreBuildErrors: true` after baseline TS errors are fixed.
3. Move upload validation server-side.
4. Verify markdown/external-link URL scheme sanitization and add tests/helpers if missing.
5. Add anti-automation controls to signup/public routes.
6. Fix or remove malformed `/api/users` route.

Acceptance checks:

- Build does not ignore TypeScript errors.
- Security headers are present in production responses.
- Uploads are validated server-side.
- Signup endpoint has basic abuse resistance.

## Suggested PR breakdown

1. PR 1: Remove client-exposed secrets + remove sensitive auth/signup logging + add secret-rotation checklist.
2. PR 2: Remove refresh token from client session and narrow JWT payloads.
3. PR 3: Disable or harden `/api/message`.
4. PR 4: Invite token cleanup/history replacement + API follow-up doc if backend change needed.
5. PR 5+: Server-side authorization migration by domain, starting with staff/admin and brewery mutations.
6. PR 6+: Medium-priority security headers, TypeScript build strictness, upload validation, `/api/users` cleanup.

## Validation commands

Run after each PR-sized change:

```bash
pnpm lint
pnpm build
```

Useful grep checks:

```bash
grep -RIn "GOOGLE_CLIENT_SECRET\|GITHUB_SECRET" next.config.js src || true
grep -RIn "console\.log.*password\|console\.log.*Form Data\|console\.log.*credentials\|console\.log.*User data" src || true
grep -RIn "refreshToken" src/auth.ts src/types src/components src/app || true
grep -RIn "session\.user\.accessToken" src/components src/app src/context || true
```

Manual smoke checks:

```text
/signup: email account create success/failure
/login: credentials success/failure
/login: Google sign-in callback
/invite: logged-out invite preserves next
/invite: logged-in invite acceptance
/api/message: unauthenticated request rejected or endpoint disabled
/dashboard brewery mutations: staff/admin actions still work after server migration
```

## Open decisions before coding

1. Should `/api/message` be disabled entirely for now?
   - Recommendation: yes, disable by default and only re-enable behind auth/rate-limit/env guard if the product uses it later.
2. Is it acceptable to remove `refreshToken` from client session immediately while leaving `accessToken` temporarily until server-side mutation migration is complete?
   - Recommendation: yes. Removing refresh token now is low risk; removing access token needs staged migration.
3. Can Beer Bible API be changed for safer invite acceptance?
   - Recommendation: eventually add a POST/body or server-side exchange flow. For this repo pass, clean the browser URL and avoid token logging.
4. Should the first server-side authorization migration target staff/admin or beer/category mutations?
   - Recommendation: staff/admin first because privilege changes are higher impact.
