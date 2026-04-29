# Beer Flow Product Remediation Plan

Date: 2026-04-28
Scope: Product audit follow-up for Beer Flow after onboarding/auth and security remediation.

## Goal

Close the highest-value product workflow gaps without starting broad platform rewrites. The focus is on features directly called out by the product audit and already scaffolded in the app: import/export, share-after-create, real brewery analytics, and operational notifications.

## Non-goals for this pass

- Do not build audit/activity history yet.
- Do not build granular RBAC yet.
- Do not build external social/mobile integrations yet.
- Do not do a broad API/data-layer rewrite beyond what the selected product fixes require.
- Do not treat `/api/message` as part of this product pass.

## Current findings from the saved audit and repo inspection

### 1. Bulk import exists as a UI scaffold only

Current state:

- `src/components/FlatfilePortal/FlatfilePortal.tsx` opens Flatfile, validates/transforms records, and downloads a CSV template.
- `onSubmit` currently only logs imported rows:
  - `console.log("onSubmit", data);`
- `src/flatfile/blueprint.js` defines beer fields that mostly map to the Beer model.
- The API currently supports single beer creation at `POST /breweries/:breweryId/beers`, but no dedicated bulk import endpoint was found.

Product impact:

- The app advertises upload/import behavior, but imported rows are not persisted.

### 2. Export is missing beyond template download

Current state:

- `FlatfilePortal` can download a sample/template CSV.
- The overview page has a generic `Download` button with static dashboard content.
- No real brewery beer export flow was found.

Product impact:

- Breweries can enter data but cannot easily extract their beer list for operations, reporting, or migration.

### 3. Analytics are static/dashboard-placeholder content

Current state:

- `src/features/overview/components/overview.tsx` shows sales/revenue/subscription-style cards with static numbers that do not fit the brewery product.
- Graph components and “Recent Sales” are placeholder-style content.
- The product already has enough beer/brewery fields for useful first-pass metrics: total beers, active vs archived, category mix, release cadence, missing images, and recently released beers.

Product impact:

- Dashboard does not reflect the actual brewery state and can reduce trust.

### 4. No share flow after beer creation

Current state:

- Beer creation succeeds, mutates local data, clears the form, and shows a toast.
- There is no post-create action sheet/modal for copying a beer link or navigating to the new beer.
- Existing app routes include beer detail routes under brewery beer paths, so an internal share/copy link is feasible before public beer pages exist.

Product impact:

- Creating a beer is a dead-end workflow instead of a launch/share workflow.

### 5. Notification preferences exist, but events do not appear wired

Current state:

- Notification preferences exist in `src/types/notifications.ts` and `src/components/Settings/NotificationSettings.tsx`.
- API has a notification-settings update endpoint.
- No clear product event pipeline was found for beer create/update/archive.

Product impact:

- Users can configure preferences, but product events do not clearly trigger notifications.

## Recommended implementation order

### Phase 1 — Make import/export real

Why first:

- Highest value from the audit.
- The UI scaffold already exists.
- It turns incomplete promises into complete workflow loops.

#### 1A. Add a frontend import normalization layer

Create a dedicated import mapper that converts Flatfile records into the existing Beer create payload shape.

Suggested location:

- `src/lib/import/beerImport.ts`

Responsibilities:

- Convert Flatfile keys to app/API field names:
  - `name` -> `name`
  - `style` -> `style`
  - `abv` -> `abv`
  - `ibu` -> `ibu`
  - `category` -> category lookup/create flow
  - `malts` -> `malt`
  - `hops` -> `hops`
  - `description` -> `description`
  - `name_sake` -> `nameSake`
  - `notes` -> `notes`
  - `release_date` -> `releasedOn`
  - `archived` -> `archived`
- Enforce required fields before calling the API.
- Return per-row success/error results for the UI.

#### 1B. Persist imported rows

Recommended first implementation:

- Keep API changes minimal.
- Submit valid rows from the frontend using the existing `POST /breweries/:breweryId/beers` endpoint.
- Process rows sequentially or with a small concurrency limit to avoid overwhelming the API.
- Show an import summary after submit:
  - created count
  - failed count
  - row-level errors

Potential follow-up if imports are large:

- Add a Beer Bible API bulk endpoint later: `POST /breweries/:breweryId/beers/bulk`.
- Use one transaction-like server path for category creation and beer creation.

#### 1C. Handle categories during import

Recommended first behavior:

- Match category names case-insensitively against existing brewery categories.
- If category does not exist and current user is owner/admin, create it via existing category endpoint before creating the beer.
- If category creation fails, mark that row failed and continue other rows.

Open question before build:

- Should imported unknown categories be auto-created, or should import require categories to already exist?

Recommendation:

- Auto-create categories for owner/admin users because it makes bulk import dramatically more useful.

#### 1D. Add real export

Add an export control near the existing import/template controls.

Initial export options:

- Export all beers for selected brewery.
- Export filtered/current visible beers if the table/list already has filters available.
- Include archived flag.

CSV columns should mirror import template where possible:

- Name
- Style
- ABV
- IBU
- Category
- Malts
- Hops
- Description
- Name Sake
- Notes
- Release Date
- Archived

Implementation note:

- Start client-side using already fetched brewery beer data.
- If dataset size becomes a problem, move export generation server/API-side later.

### Phase 2 — Add a post-create share flow

Why second:

- Small, high-visibility product improvement.
- Builds on existing beer creation path.

#### 2A. After create, keep the new beer response and show actions

Update beer create flows so success does not only clear and toast.

After a beer is created, show one of:

- a lightweight success modal
- a toast with actions
- a slide-over/share sheet

Recommended first version:

- Success modal or toast action with:
  - “View beer”
  - “Copy link”
  - “Create another”

#### 2B. Use internal beer links first

Use the existing internal route shape for copy/view:

- `/dashboard/breweries/{breweryId}/beers/{beerId}`

Do not build public beer pages in this pass.

Future follow-up:

- Public beer pages with OG metadata for customer-facing sharing.

### Phase 3 — Replace placeholder analytics with real brewery metrics

Why third:

- The dashboard currently looks generic/static.
- Real metrics can be derived from current brewery/beer data without major backend work.

#### 3A. Define first-pass metrics

Replace sales/revenue cards with brewery-relevant cards:

- Total beers
- Active beers
- Archived beers
- Categories
- New releases this month
- Beers missing images/content, if useful

#### 3B. Replace placeholder charts

Use actual beer data for:

- Category mix pie/bar chart
- Release cadence by month
- Active vs archived ratio
- Recent beers/releases list

#### 3C. Data source

Use the currently selected brewery and existing beer/category fetches.

If needed, add a small local analytics utility:

- `src/lib/analytics/breweryMetrics.ts`

Keep the first version frontend/server-component derived. Avoid adding new API endpoints unless performance or data availability requires it.

### Phase 4 — Wire operational notification events

Why fourth:

- Preferences already exist, but event delivery needs product semantics and probably API/email decisions.
- More cross-system risk than import/export/share/analytics.

#### 4A. Define events

Start with:

- beer created / released
- beer updated
- beer archived

Use current preferences:

- `notifications.allow`
- `notifications.newBeerRelease.email`
- `notifications.newBeerRelease.push`
- `notifications.beerUpdate.email`
- `notifications.beerUpdate.push`

#### 4B. Decide event execution location

Recommendation:

- Server/API side should own notification dispatch because events must be trustworthy and should not depend on a browser staying open.

Possible first cut:

- Beer Bible API triggers notification emails when beer create/update/archive succeeds.
- Frontend only displays local success toasts.

#### 4C. Keep push out unless infrastructure exists

If no push notification infrastructure is configured, treat push preferences as stored settings only and implement email notifications first.

## Suggested PR breakdown

### PR 1 — Product import/export foundation

- Add import normalization utility.
- Persist Flatfile submitted rows to the Beer Bible API.
- Add import summary UI.
- Add CSV export for selected brewery beers.
- Keep implementation scoped to existing endpoints unless category auto-create requires current category endpoint use.

Verification:

- `pnpm lint`
- `pnpm build`
- Manual import of sample CSV creates beers.
- Exported CSV can round-trip into import with expected field mapping.

### PR 2 — Beer create share flow

- Add post-create success actions.
- Copy internal beer link.
- Add “View beer” navigation.

Verification:

- `pnpm lint`
- `pnpm build`
- Manual create beer -> copy/view/create another all work.

### PR 3 — Real overview analytics

- Replace static sales/revenue cards with brewery metrics.
- Replace placeholder charts/lists with derived beer/category data.

Verification:

- `pnpm lint`
- `pnpm build`
- Manual dashboard check with breweries containing active/archived beers and categories.

### PR 4 — Notification event design / first implementation

- Document event rules.
- Implement server-side email event for the least risky first event, likely beer created/released.
- Honor stored preferences.

Verification:

- API route/unit smoke check if API is changed.
- Frontend build if frontend settings display changes.
- Manual create/update/archive event test in a non-production environment.

## API considerations

Immediate frontend-only product work can start without API changes by using existing endpoints:

- `POST /breweries/:breweryId/beers`
- `POST /breweries/:breweryId/categories`
- `GET /breweries/:breweryId/beers`
- `GET /breweries/:breweryId`

Likely API improvements for later or larger imports:

- Bulk beer import endpoint.
- Bulk category lookup/create endpoint.
- Server-generated export endpoint.
- Server-side notification event dispatch for beer lifecycle events.

## Recommended next action

Start with PR 1: import/export foundation.

Before implementation, confirm one product decision:

- Should imported unknown categories be auto-created for owner/admin users?

My recommendation is yes: auto-create categories during import, with per-row failure reporting if creation fails.
