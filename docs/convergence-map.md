---
doc: convergence-map
kind: analysis + recommendation (read-only audit; nothing migrated yet)
created: 2026-07-19
audited: AppyStack · AppySentinel · AppyTron boilerplates vs @appydave/core
principle: unify-by-default — same concept implemented differently = suspected mistake
---

# Boilerplate Convergence Map — what should share `@appydave/core`

**Goal:** three boilerplates (AppyStack web · AppySentinel headless · AppyTron Electron), soon more,
each generating dozens of apps — all drawing from **one shared toolkit where possible**. This maps,
per cross-cutting concern, whether the boilerplates should **converge** or stay divergent.

**The rule:**
- **Same concept, different implementations = the mistake → UNIFY.** (e.g. a boilerplate rolling its
  own logger.)
- **Genuinely different needs = SPLIT-BUT-SHARE** — offer *both* tools in the toolkit; each app picks.
  The sin is reinventing, not choosing.
- **Defining per-boilerplate difference = JUSTIFIED-DIVERGENCE** — keep separate (this is what makes
  each boilerplate a distinct *style*).

*(AppyStack + AppySentinel columns are from read-only inventory agents; AppyTron is from this
session's build — I wrote every line.)*

## The map

| Concern | AppyStack (web) | AppySentinel (headless) | AppyTron (electron) | in `@core` today | Verdict |
|---------|-----------------|-------------------------|---------------------|:----------------:|---------|
| **logging** | own Pino singleton | `createLogger` | uses `@core createLogger` | ✅ | **UNIFY** — Stack drops its singleton → `createLogger` |
| **config: file loader** | — | `createConfigLoader` | available, unused | ✅ | in toolkit; adopt on need |
| **config: env-schema** | own Zod env + `env`/`clientEnv` accessor | — (env is one config layer) | — | ❌ | **SPLIT-BUT-SHARE** — lift Stack's env-validate into `@core` as a 2nd config tool |
| **atomic-write** | — | `atomicWrite` | uses `@core` | ✅ | gap, not divergence |
| **local-first store** | — (entity contract is a stub) | pattern only | uses `@core createStore` | ✅ | in toolkit; adopt on need |
| **serial-queue** | — | `SerialQueue` | uses `@core` (in Store) | ✅ | in toolkit |
| **lifecycle / shutdown** | own (Express `io/http.close` + `cleanupPort`) | `createLifecycle` | uses `@core createLifecycle` | ✅ | **SPLIT-BUT-SHARE** — Stack uses `@core` harness, registers web closers as stop-hooks (low pri) |
| **typed errors** | `AppError` + `ApiError` | none (`onError` hooks) | none | ❌ | **UNIFY-candidate** — lift `AppError` into `@core` for all |
| **id generation** | `crypto.randomUUID` | `ulid` | `crypto.randomUUID` | ❌ | minor — optionally add `ulid`/`newId` to `@core` |
| **validation (zod)** | env + request middleware | config loader | `@core z` (IPC) | ✅ (`z` re-export) | shared story exists; maybe add validate helpers |
| **env-var access** | central `env`/`clientEnv` | `process.env` direct | `process.env` direct | ❌ | folds into the env-schema unify |
| **`cn()` Tailwind util** | yes (client) | n/a (headless) | yes (renderer) | ❌ | **SPLIT-BUT-SHARE** — a shared UI util for the *React* boilerplates (Stack + Tron) |
| **subscription / emitter** | — | `SignalBus` (welded to `Signal`) | hand-rolled `Set<cb>` ×3 (ProcessSupervisor, Updater, store) | ❌ | **UNIFY-candidate** — a tiny generic `createEmitter` in `@core` de-dups the pattern |
| **events / bus** | Socket.io | `Signal`/`SignalBus` (telemetry) | IPC | ❌ | **JUSTIFIED-DIVERGENCE** (transport-shaped) |
| **transport** | Express + Socket.io | MCP / HTTP / CLI | IPC / webview | ❌ | **JUSTIFIED-DIVERGENCE** — *this is the defining per-boilerplate difference* |
| **response envelope** | `apiSuccess/apiFailure` | `QueryResult` (freshness) | — | ❌ | mostly justified (different consumers) — note the parallel |
| **security middleware** | helmet/cors/rate-limit | — | — | ❌ | web-only, keep |
| **process supervision** | — | — | `ProcessSupervisor` | ❌ | Tron-only today; generic — toolkit candidate at a 2nd consumer |
| **file authoring** | — | (`atomicWrite`) | `FileAuthor` (scoped+git) | ❌ | Tron-only today; generic — toolkit candidate at a 2nd consumer |
| **scaffold CLI** | `create-appystack` | `create-appysentinel` | `create-appytron` | ❌ | **UNIFY-candidate** — three near-identical copy+rewrite+version-pin CLIs |
| **toolchain config pkg** | `appystack-config` | `appysentinel-config` | none | ❌ | **DEFER** — React-vs-node divergence; revisit at 3rd consumer |

## The unify wins (ranked — gratuitous divergence to fix)

1. **Logging → `createLogger`.** The one you called. Stack rolls its own Pino; Sentinel + Tron already
   share `@core`'s factory. Pure win, tiny change.
2. **Env-config as a shared tool.** Stack's Zod-env-schema + accessor is a *generic* pattern every app
   re-copies — lift it into `@core` (alongside the file `createConfigLoader`) so the "config" concept
   has two blessed flavours, not per-boilerplate reinventions.
3. **Scaffold CLI core.** All three rolled near-identical mechanical scaffolders (copy template →
   substitute → install → git → version-pin). The biggest *structural* convergence — a shared
   `create-*` engine each boilerplate thin-wraps. (More work; high payoff as boilerplates multiply.)
4. **Typed errors (`AppError`).** Only Stack has it, but it's generic — lift to `@core` so every app
   gets operational-error typing for free.
5. **`cn()`** shared across the two Tailwind boilerplates (Stack + Tron).

## Justified divergence (do NOT unify — this is the point of having 3 boilerplates)

- **Transport** — Socket.io vs MCP/HTTP/CLI vs IPC/webview *is* the defining difference between the
  styles. Never unify.
- **Event model** — Sentinel's `Signal`/`Bus` is telemetry-welded; Stack's is Socket.io; Tron's is IPC.
  A generic bus is speculative — defer.
- **Web security middleware / HTTP client** (Stack) and **Electron primitives**
  (WindowManager/IpcRouter/Bridge/Updater/createConsole, Tron) stay in their boilerplates.

## What the shared toolkit should GROW to include

Net-new (not a lift of an existing shared thing): **env-schema config tool**, **typed-error module**,
an **id helper** (`ulid`/`newId`), a **generic `createEmitter`** (de-dups the hand-rolled `Set<cb>`
subscription pattern that recurs 3× in AppyTron and underlies Sentinel's bus), and — at a 2nd
consumer — **FileAuthor** + **ProcessSupervisor** (both generic Node, currently Tron-only) and a
**shared scaffold engine**.

## Migration sequence + risk

All three boilerplates + their config/core are **live and published** — changes ripple to every
generated app, and re-publishing needs an OTP. Verify each step with the boilerplate's own
tests/typecheck/build + one scaffolded app.

1. **AppySentinel core de-dup** (byte-identical primitives → import `@core`) — trivial, pending go.
2. **AppyStack logging → `createLogger`** — the clearest gratuitous-divergence fix.
3. **Extract env-schema + typed-errors into `@core`; Stack adopts.**
4. **Shared scaffold engine** — bigger; converge the three `create-*` CLIs.
5. **`@appydave/config`** — still DEFER (React-vs-node divergence; wait for a 3rd real consumer).

Nothing here is executed — decisions first.
