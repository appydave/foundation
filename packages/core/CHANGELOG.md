# Changelog — @appydave/core

## 0.2.0 — 2026-10-29

**Breaking: zod 4, as a peer dependency.**

- `zod` moves from `dependencies` (`^3.23.0`) to `peerDependencies` (`^4.0.0`). The consuming app
  supplies the one zod copy; `@appydave/core` no longer installs its own.
- Why a peer and not a plain dependency: `ConfigLoaderOptions.schema` is typed `z.ZodType<T>` and
  the package re-exports `z`. Those types only line up when core and the app see the *same* zod.
  A plain `zod@^4` dependency still lets npm nest a second copy whenever ranges or lockfiles drift,
  which is exactly the TS2719 ("two different types with this name exist") that Teletubby hit with
  zod 3 + zod 4. A peer can never be nested — there is one zod per app by construction.
- The `z` re-export (`import { z } from '@appydave/core'` / `'@appydave/core/config'`) is now the
  app's zod 4.
- No other API change. `createConfigLoader` still calls `schema.parse()` and throws the `ZodError`
  unchanged; in zod 4 read `err.issues` (`err.errors` is gone in zod 4).
- Consumers: add `zod@^4` if you don't already have it (npm 7+ and Bun auto-install a missing
  peer), and move any zod 3-only API in your own schemas (`z.string().email()` → `z.email()` is
  deprecated-but-working; error maps / `.errors` are not).

## 0.1.0

- First release: Lifecycle, ConfigLoader, Logger, atomicWrite, SerialQueue, Store.
