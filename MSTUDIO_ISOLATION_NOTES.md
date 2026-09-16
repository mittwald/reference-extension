# mStudio Integration Inventory & Isolation Plan

## Inventory

### Auth / token exchange
- `src/middleware/auth.ts` — core integration point
  - `getSessionToken` (`@mittwald/ext-bridge/browser`) — client fetches session token from mStudio host
  - `verify` (`@mittwald/ext-bridge/node`) — server verifies session token
  - `getAccessToken` (`@mittwald/ext-bridge/node`) — exchanges session token + `EXTENSION_SECRET` for API access token (real network call to mStudio)
  - `MittwaldAPIV2Client.newWithToken(...)` — constructs API client used everywhere downstream
  - exports `authenticationMiddlewareWithSessionVerification`, `authenticationMiddlewareWithAccessToken`

### Domain calls to mStudio API (via injected `mittwaldClient`)
- `src/domain/project.ts` — `getProject`, `editProjectDescription`
- `src/domain/comments/user.ts` — `getUserName`, `getUserAvatar`

### Server functions wiring domain + middleware
- `src/serverFunctions/get-project-of-extension-instance.ts`
- `src/serverFunctions/edit-project-description.ts`
- `src/serverFunctions/comments/get-user-name.ts`
- `src/serverFunctions/comments/get-user-avatar.ts`
- `src/serverFunctions/comments/add-comment.ts`
- `src/serverFunctions/comments/delete-comment.ts`
- `src/serverFunctions/comments/get-comments.ts`

### Client-side ext-bridge usage
- `src/components/comments/CommentMessage.tsx` — `useConfig` (`@mittwald/ext-bridge/react`)
- `src/components/comments/CommentMessageLoading.tsx` — `useConfig`

### Webhook handling
- `src/routes/api/webhooks.mittwald.ts` — POST `/api/webhooks/mittwald`
  - `CombinedWebhookHandlerFactory` + `HttpWebhookHandler` (`@weissaufschwarz/mitthooks`) — signature verification, event parsing, instance lifecycle (external lib, no logic in this repo)
  - `PgExtensionStorage` (`@weissaufschwarz/mitthooks-drizzle`) — backed by `src/db/schema.ts` (`extensionInstances`), `src/db/index.ts`

### Config
- `src/env.ts` — `EXTENSION_ID`, `EXTENSION_SECRET`, DB/encryption vars

## Plan: Isolation from mStudio

### 1. API client base URL (straightforward) — DONE
- `MITTWALD_API_BASE_URL` optional env var added in `src/env.ts`.
- In `src/middleware/auth.ts`, after `MittwaldAPIV2Client.newWithToken(...)`, `mittwaldClient.axios.defaults.baseURL` is overridden when the env var is set (underlying eaxios client reached via `apiClient.axios`).
- Since `mittwaldClient` is already passed as a parameter into all `src/domain/*` functions, no further changes needed there.

### 2. Token exchange isolation (needs care — two channels)
- **In-browser part (session token flow):** `getSessionToken` → `verify` → `getAccessToken`. Since the mocked API behind the client won't validate tokens anyway, this path is lower risk — likely just needs `verify`/`getAccessToken` to be bypassable or stubbed in dev/test mode (mock token value that satisfies shape without hitting real mStudio).
- **Webhook part (harder):** verification logic lives inside `@weissaufschwarz/mitthooks` (`CombinedWebhookHandlerFactory` / `HttpWebhookHandler`), not in this repo.
  - Open question: does the lib support pluggable/mock signature verification, or only real mStudio-issued signatures?
  - Need to check whether `HttpWebhookHandler`/`CombinedWebhookHandlerFactory` expose a way to inject a mock verifier, or whether we need a wrapper/adapter at the route level (`src/routes/api/webhooks.mittwald.ts`) to short-circuit verification for local/test runs.
  - Action item: inspect `@weissaufschwarz/mitthooks` source/types for extension points before deciding on approach.

### Open questions / next steps
- [X] Decide on env var / config mechanism for API base URL override. **ANSWER:** Add "MITTWALD_API_BASE_URL" environment variable, wire it into client construction.
- [ ] Investigate `@weissaufschwarz/mitthooks` for mockable verification hooks
- [ ] Decide whether webhook mocking happens at lib level (preferred) or via route-level wrapper (fallback)

# Snippets / More notes

Manually seed database with mock extension instance:

```sql
INSERT INTO extension_instance (
    id,
    "contextId",
    context,
    active,
    variant_key,
    consented_scopes,
    secret
)
VALUES (
    'MOCK_EXTENSION_INSTANCE_ID',
    'MOCK_CONTEXT_ID',
    'project',
    true,
    NULL,
    ARRAY[]::text[],
    NULL
)
ON CONFLICT (id) DO NOTHING;
```