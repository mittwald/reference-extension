# CLAUDE.md

## Learnings

- Changesets CLI and `changesets/action` must match in major version: CLI v3 needs `changesets/action` v2 (v1 parses `New tag:` from stdout, CLI v3 prints `Created git tags:`, so releases are silently skipped).
- `vite build` does not typecheck – run `pnpm exec tsc --noEmit` separately.
- A green build does not prove the server starts: smoke-test `node .output/server/index.mjs` after nitro/bundler updates. Custom nitro `exportConditions` containing `import` made `pg` resolve the `pg-pool` ESM wrapper for `require()` and crashed at startup.
- `pnpm-workspace.yaml` holds pnpm settings (`allowBuilds`, `minimumReleaseAge`) and must be copied into every Docker install stage.
- Node.js 25+ no longer ships corepack: Docker images install a pinned `corepack` via npm before `corepack enable`.
