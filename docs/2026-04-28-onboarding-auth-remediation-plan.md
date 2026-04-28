# Beer Flow onboarding/auth remediation plan

Date: 2026-04-28
Repo: `/home/gordev/.openclaw/workspace/repos/beer-flow`
Related local audit: `docs/local-audits/2026-04-28-beer-flow-audit-notes.md`
Related API repo: `/home/gordev/.openclaw/workspace/repos/beer-bible-API`

## Scope

This plan covers the first audit's recommended fixes only:

1. Fix middleware public-route allowlist.
2. Fix invite redirect or implement the brewery detail page.
3. Repair login form bindings/submission.
4. Consolidate auth routes and centralize API access.

Security audit items are intentionally separate, except where they directly overlap with these onboarding/auth fixes.

## Current findings from repo review

- `pnpm` is now available locally: `10.33.2`.
- `src/middleware.ts` currently protects the homepage `/`, `/help`, and `/auth/create/account` because they are not excluded from the matcher.
- `src/auth.ts` has an invite auth-flow bug: authenticated users visiting `/accept-invite` are redirected to `/auth/login?next=...`, which is backwards.
- Unauthenticated invite users are redirected to `/auth/login` without preserving the invite URL in `next`.
- `src/components/Invite/AcceptInvite.tsx` redirects successful invite acceptance to `/dashboard/breweries/[breweryId]`.
- `src/app/dashboard/breweries/[breweryId]/page.tsx` currently returns `notFound()` immediately, so that success redirect lands on a 404.
- `src/components/auth-forms/login-form.tsx` stores `email` and `password` state but the inputs do not bind to that state.
- `login-form.tsx` also logs sign-in events and login errors, and uses button `onClick` instead of a single form `onSubmit` flow.
- Auth/signup routes are duplicated across `/auth/[form]` and `/auth/create/account`, with `SignUpForm`, `CreateAccount`, and `login-container` overlapping.
- API calls are mixed between `src/services/fetcher.ts`, `httpClient`, server helpers, and many direct hardcoded `https://beer-bible-api.vercel.app/...` calls.

## Recommended implementation order

### Phase 1 — Middleware and invite flow unblocker

Goal: make public onboarding routes reachable and make invite links preserve intent.

Changes:

1. Replace the fragile negative-regex matcher in `src/middleware.ts` with a clearer public-route allowlist pattern.
2. Public routes should include at least:
   - `/`
   - `/help`
   - `/privacy-policy`
   - `/auth/login`
   - `/auth/signup`
   - `/auth/create/account` temporarily, until consolidated
   - `/accept-invite`
   - static assets and image files
3. In `src/auth.ts` authorized callback:
   - If unauthenticated and visiting `/accept-invite`, redirect to `/auth/login?next=<full invite URL>`.
   - If unauthenticated and visiting any other protected route, redirect to `/auth/login`.
   - If authenticated, allow `/accept-invite` through instead of redirecting back to login.
4. Verify invite query strings are preserved across login/signup.

Acceptance checks:

- Logged-out users can open `/`, `/help`, `/auth/login`, `/auth/signup`, `/auth/create/account`, and `/accept-invite?token=test`.
- Logged-out protected routes still redirect to `/auth/login`.
- Logged-out invite route redirects to login with a `next` param containing the original invite URL.
- Logged-in invite route renders the invite acceptance page.

### Phase 2 — Brewery detail route fix

Goal: stop successful invite acceptance and normal navigation from landing on a guaranteed 404.

Recommendation: implement the brewery detail page instead of changing the invite redirect.

Reason:

- Multiple existing links already point to `/dashboard/breweries/[breweryId]`.
- Redirecting only the invite flow to `/beers` would hide the broader broken route.
- `BreweryProfiles` and `getSingleBrewery` already exist and appear intended for this page.

Changes:

1. Update `src/app/dashboard/breweries/[breweryId]/page.tsx` to fetch brewery data from the API.
2. Render brewery beer/category overview using the existing UI where practical.
3. Return `notFound()` only when the API returns a true missing/unauthorized state.
4. Keep successful invite redirect as `/dashboard/breweries/${breweryId}` if the page is implemented.
5. If page implementation is too large for the first PR, temporary fallback may redirect to `/dashboard/breweries/${breweryId}/beers`, but that should be documented as temporary.

Acceptance checks:

- `/dashboard/breweries/[validId]` no longer always 404s.
- Invite acceptance lands on a usable brewery page.
- Existing nav links to brewery root work.
- Invalid or unauthorized brewery IDs show not-found or a clear error state.

### Phase 3 — Login form repair

Goal: make email/password login actually submit entered credentials and behave predictably.

Changes:

1. Convert login to a single `onSubmit` handler on the `<form>`.
2. Call `event.preventDefault()`.
3. Bind email input:
   - `value={email}`
   - `onChange={(event) => setEmail(event.target.value)}`
   - `name="email"`
   - `autoComplete="email"`
4. Bind password input:
   - `value={password}`
   - `onChange={(event) => setPassword(event.target.value)}`
   - `name="password"`
   - `autoComplete="current-password"`
5. Disable submit while credentials login is loading.
6. Use `router.push(...)` instead of client `redirect(...)` from event handlers.
7. Remove sensitive console logging from this form as part of this fix.
8. Preserve `next` redirects after successful credentials or Google sign-in.

Acceptance checks:

- Email/password form submits the values typed by the user.
- Empty fields are blocked by browser validation and/or client validation.
- Failed login stays on login page and shows one user-safe error.
- Successful login redirects to `next` when present, otherwise `/dashboard/overview`.
- Google sign-in keeps the same callback behavior.

### Phase 4 — Consolidate auth routes

Goal: reduce duplicate auth/signup UX without changing the product model.

Jordan note: Beer Flow uses NextAuth for provider and email logins only. Google likely needs setup again later; Supabase image setup is a separate follow-up.

Recommendation:

- Make `/auth/[form]` the canonical auth route for now:
  - `/auth/login`
  - `/auth/signup`
- Preserve `/auth/create/account` as a compatibility redirect to `/auth/signup`, carrying through the `next` query param.
- Remove or retire duplicated `CreateAccount` / `login-container` flows only after verifying feature parity with `SignUpForm` and `LoginForm`.

Changes:

1. Add a redirect from `/auth/create/account` to `/auth/signup`, preserving query params.
2. Update homepage/help links from `/auth/create/account` to `/auth/signup`.
3. Ensure signup links preserve `next` when coming from invite flow.
4. Keep only Google/provider and email login language in the UI.
5. Do not add GitHub login unless Jordan explicitly asks.

Acceptance checks:

- `/auth/create/account?next=...` redirects to `/auth/signup?next=...`.
- Homepage/help CTA links go to the canonical signup route.
- Login/signup screens use consistent layout and copy.
- Invite flow can move from login to signup without losing `next`.

### Phase 5 — Centralize API access

Goal: stop spreading hardcoded API URLs and create one place to reason about Beer Bible API calls.

Recommendation:

1. Standardize on one base URL env var:
   - server: `API_URL`
   - optional browser-safe public fallback only if truly needed: `NEXT_PUBLIC_API_URL`
2. Create a central API module, likely under `src/lib/api/`, with typed endpoint helpers for:
   - auth/users
   - breweries
   - beers
   - categories
   - staff/invites
3. Move hardcoded `https://beer-bible-api.vercel.app` calls behind that module incrementally.
4. Prefer server-side calls for authenticated API access.
5. Where client components need mutations, use server actions or small Next route handlers so bearer token handling remains server-controlled in the later security pass.
6. Keep `/api/message` out of this plan because Jordan said it is unused.

Initial high-impact files to migrate:

- `src/components/auth-forms/sign-up-form.tsx`
- `src/components/CreateAccount/CreateAccount.tsx`
- `src/components/Invite/AcceptInvite.tsx`
- `src/lib/POST/acceptInvite.ts`
- `src/lib/POST/sendInvite.ts`
- `src/lib/createBrewery.tsx`
- `src/lib/createCategory.tsx`
- `src/lib/getAllBreweries.tsx`
- `src/lib/getAllUsers.tsx`
- `src/lib/getSingleBrewery.tsx`
- `src/lib/getSingleBeer.tsx`
- `src/lib/DELETE/*`
- `src/lib/PATCH/*`
- `src/lib/PUT/*`

Acceptance checks:

- No new code uses hardcoded `https://beer-bible-api.vercel.app` URLs.
- Existing central fetcher handles base URL, JSON headers, auth header, response parsing, and safe error messages.
- Build/lint remain at least no worse than before.
- A grep for the hardcoded API URL shows a shrinking list and eventually zero app runtime callers.

## Suggested PR breakdown

1. PR 1: Middleware allowlist + invite authorized callback + login form bindings.
2. PR 2: Brewery root page implementation or temporary redirect fallback.
3. PR 3: Auth route consolidation and CTA/link cleanup.
4. PR 4+: API client centralization by domain, starting with invite/auth/brewery helpers.

This keeps the most user-visible onboarding breakages isolated from the larger API cleanup.

## Validation commands

Run after each PR-sized change:

```bash
pnpm install
pnpm lint
pnpm build
```

Manual smoke checks:

```text
/logged out: /
/logged out: /help
/logged out: /auth/login
/logged out: /auth/signup
/logged out: /accept-invite?token=fake
/logged in: /accept-invite?token=real-or-test
/logged in: /dashboard/breweries/<breweryId>
/login form: credentials success/failure
/login form: Google callback preserves next
```

## Open decisions before coding

1. Should `/dashboard/breweries/[breweryId]` be the canonical brewery overview page, or should it redirect to `/dashboard/breweries/[breweryId]/beers`?
   - Recommendation: implement it as the canonical overview page.
2. During auth route consolidation, is it okay to remove the old `CreateAccount` flow after parity is confirmed?
   - Recommendation: first redirect it, then remove dead code in a later cleanup PR.
3. Should API centralization immediately force all authenticated calls server-side, or should that be paired with the token/session security pass?
   - Recommendation: centralize now, then fully server-side/token-minimize in the security pass.
