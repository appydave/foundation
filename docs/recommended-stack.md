---
doc: recommended-stack
kind: decided technology picks (best-in-class research, 2026-07-19)
principle: research best-in-class, not majority-vote; prefer strong 3rd-party libs where they win, tiny-custom where a dep only adds surface
consumers: AppyStack (web) · AppySentinel (headless) · AppyTron (electron) + every generated app
environments: node · electron-main · electron-renderer · browser
---

# `@appydave/core` — Recommended Shared Stack

The technology the shared toolkit standardises on, chosen by **best-in-class research** (not "what 2
of 3 stacks already use"). Each pick weighed cross-environment fit (node / electron-main /
electron-renderer / browser), maintenance, DX, and bundle size.

## The stack

| Concern | Pick | Form | Why (best-in-class, not incumbent) |
|---------|------|------|------------------------------------|
| **Logging** | **LogTape** | 3rd-party, behind a thin `createLogger` seam | The only logger that's truly **one API across node + browser + electron(main+renderer) + edge**. **Pino is wrong as the *shared* choice** — its browser/renderer path is a degraded console shim. LogTape is zero-dep and *library-first* (silent until the app configures sinks — exactly right for a shared package). **Plan B** (if risk-averse about a younger lib): `LogLayer` routing to pino(node)/console(browser)/electron-log — but that's more moving parts. |
| **Schema validation** | **Zod v4** (`zod/v4`; `zod/mini` for byte-sensitive paths) | 3rd-party, thin `z` re-export | Ecosystem + adapter depth; v4 closes the old bundle gap. Valibot's size win is **noise** for an SPA / Electron renderer and costs a full schema rewrite. *Standard Schema* keeps a future swap cheap. |
| **Env validation** | **`@t3-oss/env-core`** | 3rd-party | Client/server split with **build-time prefix enforcement** exactly matches the topology (browser/renderer must never see server secrets). Standard-Schema-based → reuses the validator above. |
| **Config-file loading** | **`c12`** (unjs) | 3rd-party | Does the defaults→file→env layering + hot-reload that Sentinel currently hand-rolls; multi-format, TS configs. |
| **Typed errors** | **Tiny custom `AppError` base** in core (+ an HTTP subclass **only** in the web boilerplate) | custom | Modern TS+ESM makes `class AppError extends Error` correct with no lib. `neverthrow` is a whole-codebase paradigm, not a shared util — **explicitly rejected**. |
| **Event emitter** | **`mitt`** (~200 B) | 3rd-party | Typed, node+browser, replaces the hand-rolled `Set<callback>` in 3 AppyTron spots + Sentinel's bus. (`nanoevents` = equal alt if you want unbind-returns; `emittery` only if a consumer must *await* listeners.) |
| **ID generation** | **UUID v7** (`uuid` pkg `v7()`; → native `crypto` when Node ships it) | 3rd-party | **Sortable like ULID *and* standard like `randomUUID`** — unifies Sentinel(ulid) + Stack/Tron(uuid) on one format, zero interop cost. `nanoid` for opaque public/short ids; `cuid2` only if enumeration is an explicit threat. |
| **Scaffold engine** | **Thin custom** in core (+ `giget` for *remote*-template fetch only, + `@clack/prompts`) | custom + targeted libs | copy→substitute→git→install→version-pin is ~100 lines; plop/hygen are the wrong altitude (in-project generators, not app bootstrappers). |

## The pattern worth noting

Best-in-class ≠ "adopt a big framework for everything." It's a deliberate mix:
- **Strong 3rd-party where a clear leader exists:** LogTape · Zod v4 · t3-env · c12 · mitt · uuid · giget.
- **Tiny-custom where a dependency only adds surface:** typed errors · scaffold orchestration.

Keep **thin re-export seams** (`createLogger`, `z`) so the *toolkit* — not each app — owns the vendor
choice, and any future swap is one file (Standard Schema and the seams make this cheap).

## Migration cost (rough, all behind the toolkit so apps upgrade via their boilerplate)

- **Validation:** zod v3→v4 codemod (~1 day) + error-API fixes.
- **Env:** move the existing schema into `createEnv({ server, client, runtimeEnv })`.
- **Config:** map precedence into `c12`; keep the same `getConfig()` surface.
- **Logging:** back `createLogger` with LogTape — contained by the seam.
- **Emitter / errors / id / scaffold:** additive + small refactors.

## Sources (condensed — full lists in the research threads)

Sentry *JS Logging Library Definitive Guide 2026*; logtape.org/comparison; LogLayer docs; pino browser
transports; PkgPulse *zod-v4 vs valibot/arktype/typebox 2026* + *config-file loading 2026* + *env
validation 2026* + *giget vs degit 2026*; T3 Env docs + Standard Schema; unjs/c12; npm-compare
emitters; UUID v7 / RFC 9562 + Node native proposal.
