# Flow Stable Upgrade — Notes & Plan

**Date:** 2026-09-28
**Branch:** `lb/fresh-ref-hunt-deletion-bug`
**Goal:** Move the reference extension off the abandoned `0.2.0-alpha.*` Flow track onto stable **`1.3.5`**.

**Two repos are involved:**

| Repo | Role | Path / URL |
|---|---|---|
| `reference-extension` | the extension (remote / iframe side) | this workspace |
| `mittwald-extension-mock-host` | the mock Frontend Fragment host | <https://github.com/gandie/mittwald-extension-mock-host> (default branch `master`) |

The mock host is upgraded **first** and verified against the *unchanged* extension, before the extension is touched. See §6.

---

## 1. Background — how we got here

A broad dependency upgrade (react 19.2→19.3, vite 7.2→7.3, TanStack Router 1.139→1.170, Start 1.139→1.168, api-client 4.267→4.474, …) was applied. The Flow/ext-bridge packages were **not** touched and stayed pinned at `0.2.0-alpha.557`.

Two problems surfaced.

### 1.1 `ExtBridgeError: Ext Bridge not ready after 7500ms` (fixed)

Posting a comment threw inside `<CommentMessage>` → `useConfig()` → `useExtBridge()` → `getExtBridge()` → `readiness.isReady()`.

**Root cause — an undeclared, order-dependent coupling via `globalThis`:**

1. `@mittwald/ext-bridge/{browser,react}` sets `globalThis.mwExtBridge = { readiness }` as a side effect of module evaluation.
2. `RemoteRoot` connects to the host in its `ref` callback on the **first commit**, via `connectHostRenderRoot`:
   ```js
   if (typeof mwExtBridge !== "undefined") {
     mwExtBridge.connection = connection.imports;
     await mwExtBridge.readiness.setIsReady();
   }
   ```
   If the global is not yet defined, the readiness handshake is **silently skipped forever** — no error, no warning.
3. The only modules importing `@mittwald/ext-bridge/react` were `CommentMessage.tsx` and `CommentMessageLoading.tsx`, which live in the lazily-loaded `/` route chunk (`routes/index.tsx` has `ssr: false`). They only mount once at least one comment exists.
4. Therefore: post a comment → `CommentMessage` mounts → ext-bridge evaluates for the first time → fresh, never-resolved `readiness` promise → `isReady()` races it against the 7500 ms timeout → error.

The upgrade did not break the bridge. It changed **module evaluation / chunking order**, exposing a latent bug. Previously ext-bridge happened to land in the entry graph before `RemoteRoot` mounted.

**Fix applied** — first import in `src/routes/__root.tsx`:

```tsx
// must be evaluated before RemoteRoot connects, otherwise globalThis.mwExtBridge
// is still undefined and flow-remote-core silently skips readiness.setIsReady()
import "@mittwald/ext-bridge/browser";
```

Verified working against both the mocked host (mocked API) and productive mStudio. Committed as a checkpoint.

### 1.2 `api-client` breaking change (fixed)

`@mittwald/api-client` 4.474 removed `project.updateProjectDescription`; it is folded into `project.updateProject` with an **identical** request shape. Fixed in `src/domain/project.ts`. `tsc --noEmit` is clean.

---

## 2. Version landscape (checked 2026-09-28 via `npm view`)

| Package | Current | `latest` | `next` | `experimental` |
|---|---|---|---|---|
| `@mittwald/ext-bridge` | `0.2.0-alpha.557` | **`1.3.5`** | `1.4.0-next.5` | — |
| `@mittwald/flow-react-components` | `0.2.0-alpha.557` | **`1.3.5`** | `1.4.0-next.5` | `0.2.0-experimental.776` |
| `@mittwald/flow-remote-core` | `0.2.0-alpha.557` | **`1.3.5`** | `1.4.0-next.5` | `0.2.0-alpha.35` |
| `@mittwald/flow-remote-elements` | `0.2.0-alpha.557` | **`1.3.5`** | `1.4.0-next.5` | `0.2.0-alpha.35` |
| `@mittwald/flow-remote-react-components` | `0.2.0-alpha.557` | **`1.3.5`** | `1.4.0-next.5` | `0.2.0-alpha.35` |
| `@mittwald/mstudio-ext-react-components` | `0.2.0-alpha.557` | **`1.3.5`** | `1.4.0-next.5` | — |
| `@mittwald/remote-dom-react` | `1.2.2-mittwald.10` | `1.2.2-mittwald.10` | — | — |

The `experimental` dist-tag still points at `0.2.0-alpha.35` — the `0.2.0-alpha.557` line is that abandoned experimental track. This explains the alpha churn.

`@mittwald/remote-dom-react` is unchanged, so no churn expected there.

### 2.1 Mock host (`mittwald-extension-mock-host`, branch `master`)

| Package | Current | `latest` |
|---|---|---|
| `@mittwald/flow-react-components` | `0.2.0-alpha.737` | **`1.3.5`** |
| `@mittwald/flow-remote-core` | `^0.2.0-alpha.661` | **`1.3.5`** |
| `@mittwald/flow-remote-react-components` | `^0.2.0-alpha.661` | **`1.3.5`** |
| `@mittwald/flow-remote-react-renderer` | `^0.2.0-alpha.661` | **`1.3.5`** |
| `react` / `react-dom` | `^19.2.0` | (fine) |
| `vite` | `^7.2.4` | (fine) |

Notes:
- The mock host uses `@mittwald/flow-remote-react-renderer`, which the extension does not. It also publishes `1.3.5` / `next 1.4.0-next.5`.
- The mock host is currently on **newer alphas (`.661`/`.737`) than the extension (`.557`)** and works today — direct evidence that the host/remote handshake tolerates version skew.
- `@mittwald/flow-remote-react-components` is declared but `src/App.jsx` does not appear to use it; it may be droppable.
- `src/App.jsx` contains TypeScript syntax (`useRef<HTMLIFrameElement>(null)`) in a `.jsx` file. Pre-existing; leave alone unless the Vite 7 / esbuild loader starts rejecting it.

---

## 3. What 1.3.5 changes

### 3.1 Dependency / peer metadata

`@mittwald/ext-bridge@1.3.5`:
- `dependencies`: `zod ^4.4.3` (was `^3.25.76`), `jose ^6.2.10`, `axios ^1.19.0`, `std-env ^4.1.0`, `@mittwald/react-use-promise ~4.2.2`
- `peerDependencies`: `react ^19.2.0`, `react-dom ^19.2.0`, `i18next ^26.0.0` — **all optional**
- New export subpath: `./i18next`

`@mittwald/flow-remote-react-components@1.3.5`:
- `peerDependencies`: `react ^19.2.0`, `react-hook-form ^7.65.0`, `@mittwald/ext-bridge 1.3.5` (exact), `@internationalized/date ^3.12.2`
- `dependencies`: `flow-remote-core 1.3.5`, `flow-remote-elements 1.3.5`, `flow-react-components 1.3.5`, `remote-dom-react 1.2.2-mittwald.10`, `react-error-boundary ^6.1.3`

`@mittwald/mstudio-ext-react-components@1.3.5`:
- `peerDependencies`: `react ^19.2.0`, `@mittwald/flow-remote-react-components 1.3.5` (exact)

**Compatible with our current stack:** react 19.3, react-dom 19.3, react-hook-form 7.89, zod 4.6, react-error-boundary 6.1.

**Bonus:** the zod 3→4 move in ext-bridge removes a duplicate zod copy from the bundle (app is on zod 4).

### 3.2 Breaking: ext-bridge global initialization is now explicit

`global-browser.mjs` no longer self-assigns on import:

```js
// 1.3.5
if (typeof globalThis.mwExtBridge !== "undefined")
  console.warn("mwExtBridge is already defined. ... installed multiple times.");
var mwExtBridge = { readiness: readinessApi };
function initExtBridge() { globalThis.mwExtBridge = mwExtBridge; }
export { initExtBridge, mwExtBridge };
```

- `@mittwald/ext-bridge/browser` → **does** call `initExtBridge()` on import, and re-exports it.
- `@mittwald/ext-bridge/react` → **no longer touches the global at all** (only exports `useConfig`, `useLanguage`).

**Consequence:** our `__root.tsx` side-effect import is not a workaround — it is the required setup step under the stable API. Upgrading *without* it would reproduce the 7500 ms bug deterministically.

### 3.3 Breaking: host protocol v3 → v5

**Extension side** (`connectHostRenderRoot`, 1.3.5):
- `setIsReady({ version: Version.v5, packageVersion })` — an **object** (was the bare number `Version.v3`)
- new thread export `setHostError`
- new `onHostError` / `packageVersion` options
- render path refactored into `connectRemoteReceiver`

**Host side** (`connectRemoteIframe`, 1.3.5) — new exports `reportDeprecation`, `reportEvent`, `getHostConfig`, new `hostConfig` prop, and:

```js
var normalizeReadyEvent = (event) => {
  if (typeof event === "number") return { version: event };   // old extensions
  return event ?? { version: Version.v1 };
};
...
reportHostError: async (error) => {
  if (result.version >= Version.v5) await result.thread.imports.setHostError(error);
}
```

**This asymmetry dictates the upgrade order:**

| | old host (alpha) | new host (1.3.5) |
|---|---|---|
| **old extension (alpha, sends number)** | works today | **works** — `normalizeReadyEvent` handles the number, v5-only features are version-gated |
| **new extension (1.3.5, sends object)** | **degraded** — host assigns the object to `result.version`, so `version >= Version.v2` is `NaN`-false and `setPathname` silently no-ops; `setHostError` does not exist | works |

So: **bump the host first.** A new host is backward compatible; an old host is not forward compatible.

### 3.4 Host config plumbing (`language` / `theme`)

1.3.5 `setIsReady` does `parseConfig(config)` **and** `extractHostConfig(config)`, the latter reading `config.language` and `config.theme`. The host merges these in via the new `hostConfig` prop (`getWithMergedHostConfig`).

The config zod schema (`config/schemas.mjs`) requires only `sessionId`, `userId`, `extensionId`, `extensionInstanceId`; every context parameter is `optionalString`, and there is a `.catchall(optionalString)`. **The mock host's existing `getConfig` payload therefore still parses unchanged** — no new required fields. `language`/`theme` are optional and may be added later if we want to exercise `useLanguage()`.

### 3.5 New features

- `useLanguage()` hook
- `@mittwald/ext-bridge/i18next` integration subpath

---

## 4. Upstream smells NOT fixed in 1.3.5

Verified against the published 1.3.5 sources. Concrete fix proposals live in **Stage F** (§6).

1. **Silent readiness skip.** `connectHostRenderRoot` still treats a missing `mwExtBridge` as a legitimate state and skips the handshake with no diagnostic. The failure surfaces 7.5 s later in an unrelated component. A single `console.warn` in the `else` branch would turn a mystery into an instant diagnosis.
2. **Shared module-level timeout promise.** `readiness.mjs` is byte-for-byte unchanged here:
   ```js
   const [timoutPromise, , rejectOnTimeout] = controllablePromise();
   const startTimeout = () => { setTimeout(() => rejectOnTimeout(...), timeoutMs); return timoutPromise; };
   ```
   The first `isReady()` call's 7500 ms timer permanently poisons the promise for every later caller. Harmless only because `Promise.race([readiness, timoutPromise])` lists the resolved `readiness` first. Fragile.
3. Typo `timoutPromise` persists.

---

## 5. Risks

| Risk | Severity | Notes |
|---|---|---|
| Renamed / removed Flow components between alpha and 1.3.5 (extension) | Medium | We use `Message`, `MessageThread`, `IllustratedMessage`, `LayoutCard`, `ColumnLayout`, `Section`, `Avatar`, `Initials`, `Image`, `Header`, `Content`, `Align`, `Text`, `Heading`, `InlineCode`, `Title`. Caught by `tsc`. |
| Prop/API changes on retained components | Medium | e.g. `Message type="sender" \| "responder"`. Caught by `tsc`. |
| Mock host `RemoteRenderer` API drift | Low | Verified: `src`, `timeoutMs`, `extBridgeImplementation` all still present in `RemoteRendererBrowserProps@1.3.5`. New optional props: `onConnected`, `onDeprecation`, `onComponentUsage`, `hostPathname`, `integrations`. |
| Mock host `RemoteReceiver` import | Low | Verified: `flow-remote-core@1.3.5` still re-exports `RemoteReceiver` (now from `@mittwald/remote-dom-core/receivers`). The mock's `receiver` const is unused anyway. |
| Mock host `getConfig` payload rejected by stricter schema | Low | Verified not an issue — see §3.4. |
| Exact-version peer pins (`ext-bridge 1.3.5`, `flow-remote-react-components 1.3.5`) | Low | All Flow packages must move together in lockstep, in **both** repos. |
| Custom-element double-registration (`flr-*`) | Low | Existing `resolve.dedupe` in `vite.config.ts` should still cover it; keep the dedupe list. |
| Stale Vite dep cache / stale `node_modules/.pnpm` dirs | Low | `0.2.0-alpha.557` + react 19.2 leftovers are still on disk in the extension. Clean install before testing. |

The previously-High "mock host may not speak v5" risk is **retired**: we control the mock host, and it is upgraded first (§6).

---

## 6. Plan — four stages, host first

> Rationale for the order is in §3.3: a 1.3.5 host is backward compatible with an alpha extension, but an alpha host is **not** forward compatible with a 1.3.5 extension. Upgrading the host first therefore keeps a working reference point at every step and isolates failures to one repo at a time.

### Stage A — Bump the mock host

Repo: `mittwald-extension-mock-host`

- [X] Create a branch off `master`. -> `upgrade/stable-flow`
- [X] Bump to exact `1.3.5`: `flow-react-components`, `flow-remote-core`, `flow-remote-react-components` (or drop it if genuinely unused), `flow-remote-react-renderer`.
- [X] Clean install (`npm ci` / `rm -rf node_modules package-lock.json && npm install`), clear `node_modules/.vite`.
- [X] Confirm a single resolved `@mittwald/ext-bridge@1.3.5` in the lockfile.
- [X] `npm run lint` and `npm run build` pass.
- [X] Fix any `RemoteRenderer` / `RemoteReceiver` import or prop fallout (expected: none — see §5). -> None found as expected.

### Stage B — Upgraded host × **unchanged** extension

**This is the backward-compatibility gate. The extension is not touched in this stage.**

- [X] Extension still at `0.2.0-alpha.557` + the `__root.tsx` ext-bridge fix, i.e. the current checkpoint commit.
- [X] Run upgraded mock host against it.
- [X] Smoke test (see §6.1).
- [X] Expected: **works**. `normalizeReadyEvent` accepts the bare `Version.v3` number and v5-only features stay gated.
- [X] If it fails → the problem is entirely in the mock host bump. Fix there before going further. Do **not** start Stage C. -> no fails, everything fine

Finding: Error behavior is slightly worse in this combination, i do not
get error message when post comment with non-existant mock extension instance.
This might be an issue of host- and frontend-fragment version mismatch now.

### Stage C — Bump the extension, run against the upgraded host

Repo: `reference-extension`

- [X] Set all six `@mittwald/*` Flow packages to exact `1.3.5` in `package.json`:
      `ext-bridge`, `flow-react-components`, `flow-remote-core`, `flow-remote-elements`, `flow-remote-react-components`, `mstudio-ext-react-components`.
- [X] Leave `@mittwald/remote-dom-react` at `1.2.2-mittwald.10`.
- [X] Clean install: remove `node_modules`, the Vite cache dir (`VITE_CACHE_DIR` / `node_modules/.vite`), then `pnpm install`.
- [X] Verify a single resolved copy of `@mittwald/ext-bridge` in `pnpm-lock.yaml`.
- [X] Replace the side-effect import in `src/routes/__root.tsx` with the explicit stable API:
      `import { initExtBridge } from "@mittwald/ext-bridge/browser";` + call `initExtBridge()` at module scope, before any render.
- [X] Re-check `src/middleware/auth.ts` (`getSessionToken` from `@mittwald/ext-bridge/browser`, `verify` from `@mittwald/ext-bridge/node`) still resolves.
- [X] Review `vite.config.ts`: `optimizeDeps.exclude: ["@mittwald/ext-bridge"]` (added because the `./node` export condition breaks the esbuild dep scanner) — confirm still needed with the 1.3.5 exports map.
- [X] Keep / update `resolve.dedupe` list.
- [X] `npx tsc --noEmit` clean; fix renamed components or props.
- [X] Biome clean.
- [X] Production build succeeds.
- [X] Smoke test against the **upgraded mock host** (see §6.1).
- [X] Expected: works, now on protocol v5 end to end.

### Stage D — Productive mStudio

- [X] Only once Stage C is green.
- [X] Run the upgraded extension against productive mStudio.
- [X] Smoke test (see §6.1).
- [X] Webhook scripts in `scripts/` still pass.

### Stage E — Land

- [X] Changeset entry in `reference-extension`.
- [X] Commit both repos.
- [ ] Hand the §4 findings to Stage F.

### Stage F — Bonus: upstream fix proposal (optional, not blocking)

Nothing here is required for the upgrade. It is the give-back: we lost an afternoon to a failure mode that is cheap to make self-diagnosing, and we are probably not the last. Ordered by value-per-line.

All three are in `@mittwald/ext-bridge` / `@mittwald/flow-remote-core` as of `1.3.5`.

#### F1 — Make the error say what actually went wrong (highest value, zero false positives)

Today a missing `initExtBridge()` and a genuinely unreachable host produce the *same* message, 7.5 s late, in whichever component happened to call `useConfig()` first. But `readiness` can tell the two apart: if the host connected, `mwExtBridge.connection` was assigned; if the bridge was never initialised in time, it was not.

`src/readiness.ts`:

```ts
isReady: async () => {
  assertBrowserEnv();
  try {
    await Promise.race([readiness, startTimeout()]);
  } catch (error) {
    if (mwExtBridge.connection === undefined) {
      throw new ExtBridgeError(
        `Ext Bridge not ready after ${timeoutMs}ms: the host never connected. ` +
          "If this extension renders <RemoteRoot>, make sure initExtBridge() has run " +
          "(import '@mittwald/ext-bridge/browser') before the first render.",
      );
    }
    throw error;
  }
}
```

This is strictly additive and cannot misfire — it only refines the message on a path that was already throwing.

#### F2 — Per-call timeout instead of one shared, self-poisoning promise

Current:

```ts
const [timoutPromise, , rejectOnTimeout] = controllablePromise();
const startTimeout = () => {
  setTimeout(() => rejectOnTimeout(new ExtBridgeError(...)), timeoutMs);
  return timoutPromise;                      // same promise for every caller
};
```

The first `isReady()` call's timer rejects the *shared* promise at t+7500 ms and it stays rejected forever. Every later caller races against an already-rejected promise and only survives because `Promise.race` lists the resolved `readiness` first. It also leaks a timer per call. Proposed:

```ts
isReady: async () => {
  assertBrowserEnv();
  let timeoutId: ReturnType<typeof setTimeout>;
  try {
    await Promise.race([
      readiness,
      new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new ExtBridgeError(`Ext Bridge not ready after ${timeoutMs}ms`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeoutId!);
  }
}
```

Each call gets its own timer, the timer is cleared on success, and no shared state can be poisoned. Also fixes the `timoutPromise` → `timeoutPromise` typo.

#### F3 — Optional dev-time warning on the skipped handshake

`connectHostRenderRoot` treats a missing `mwExtBridge` as a legitimate state, which it is — `@mittwald/ext-bridge` is an optional peer of `flow-remote-core`, so extensions that never use the bridge must not be nagged. A `console.warn` in the `else` branch would therefore produce false positives for them.

Worth proposing only if it can be made conditional (dev builds, or gated on the consumer opting in). **F1 achieves most of the same diagnostic value with none of the noise**, so F3 is the fallback, not the headline.

#### Also worth raising

- Document `initExtBridge()` as a **required setup step** for any extension that renders `<RemoteRoot>` and uses `useConfig()` / `useLanguage()`. In `1.3.5` the `/react` entry no longer initialises the global, so this is now load-bearing and easy to miss when migrating from `0.2.0-alpha.*`.
- Suggest the compatibility matrix from §3.3 for the migration notes — "upgrade hosts before remotes" is not obvious from the changelog, and we only established it by reading `normalizeReadyEvent`.

#### Deliverable

- [ ] One issue against <https://github.com/mittwald/flow> covering F1 + F2, with the §1.1 reproduction (lazy route chunk → ext-bridge evaluates after `RemoteRoot` mounts → silent skip → 7.5 s timeout in an unrelated component).
- [ ] Mention F3 and the doc gaps in the same issue rather than splitting.

### 6.1 Smoke test checklist (run identically in Stages B, C, D)

- [ ] Dev server starts clean; no `customElements.define` duplicate errors.
- [ ] Extension iframe console: `globalThis.mwExtBridge` is **defined** immediately after load.
- [ ] No `"mwExtBridge is already defined ... installed multiple times"` warning.
- [ ] Page renders; greeting, project card, readme, link cards all appear.
- [ ] Project description edit works.
- [ ] **Add a comment → `CommentMessage` renders.** This is the exact regression from §1.1 — it only mounts once a comment exists, so an empty list proves nothing.
- [ ] Delete a comment works.
- [ ] No `ExtBridgeError` in console, before or after the 7.5 s mark.

---

## 7. Rollback

Working tree / branches only; no infrastructure changes. Both repos are on branches with checkpoint commits.

- **Stage A/B failure** → problem is isolated to the mock host bump. The extension was never touched. Fix or abandon the host branch; nothing to restore in `reference-extension`.
- **Stage C failure** → restore `package.json`, `pnpm-lock.yaml` and touched `src/` files from the extension's checkpoint commit, then clean-install. The upgraded mock host still works with the restored extension (that is exactly what Stage B proved), so you keep a working dev loop while investigating.
- **Stage D failure** → productive mStudio disagrees with a locally-green build. Do not roll back blindly; capture the console output first, since this would mean mStudio's host version differs from `1.3.5`.

---

## 8. Open questions

- Is there a migration guide for `0.2.0-alpha.*` → `1.x`? (Not consulted yet — worth checking the Flow docs at <https://mittwald.github.io/flow> and the repo changelog **before** Stage C.)
- Which protocol version does **productive mStudio** host speak? If it is older than v5 we would hit the same forward-compat asymmetry as an un-bumped mock host (§3.3). Stage D is the only place this can be observed.
- Should the mock host start passing the new `hostConfig` prop (`language` / `theme`) so we can exercise `useLanguage()`?
- Should we adopt `useLanguage()` / the `i18next` integration now, or keep this upgrade mechanical? Default: mechanical.
- Is `@mittwald/flow-remote-react-components` actually used by the mock host, or can it be dropped from its `package.json`?
- Do we want `next` (`1.4.0-next.5`) instead? Default answer: no — the goal is explicitly *stable*.

---

## 9. Debugging cheat sheet (ext-bridge)

- `globalThis.mwExtBridge` is `undefined` in the iframe → readiness will never be set; nothing will tell you.
- Console warning `"mwExtBridge is already defined..."` → duplicate module instance; a second copy overwrote a ready bridge. Check `pnpm-lock.yaml` for multiple resolved `@mittwald/ext-bridge` entries and stale `node_modules/.pnpm/...` dirs.
- `ExtBridgeError: Ext Bridge not ready after 7500ms` → almost always one of the two above, not an actual host connectivity problem.
- `optimizeDeps.exclude: ["@mittwald/ext-bridge"]` means it is served as raw ESM in dev, so evaluation order is chunk-dependent. Never rely on it.
