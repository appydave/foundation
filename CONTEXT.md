---
project: appydave-foundation
kind: system-context (deep comprehension doc — read once, understand the system)
audience: any AI agent or developer using or extending @appydave/core
status: living
last_verified: 2026-07-19
consumers:
  - appytron        # uses @appydave/core (Tier 1)
  - appysentinel    # holds the same primitives today; to be de-duped onto @appydave/core
  - appystack       # to be de-duped onto @appydave/core "as needed"
---

# AppyDave Foundation — System Context

**`@appydave/core` is the shared, product-prefix-free foundation** reused by every AppyDave
boilerplate (AppyStack · AppySentinel · AppyTron). The rule that governs this repo: *if a
capability is common to more than one boilerplate, it lives here — not inside any single product.*

## 1. What's in it

One package today — **`@appydave/core`** — six cross-cutting primitives. **No** product-specific,
web, or Electron code ever belongs here.

| Primitive | Import | Signature (essentials) |
|-----------|--------|------------------------|
| `createLifecycle()` | `@appydave/core` | `{ start(); stop(reason?); onStart(hook); onStop(hook); onReload(hook); health() }` — start hooks run in registration order, stop hooks in reverse; SIGINT/SIGTERM → `stop()`, SIGHUP → `reload()` |
| `createConfigLoader(opts)` | `@appydave/core` | defaults → file → env merge, Zod-validated, reloadable, `onChange` |
| `createLogger({ name, level? })` | `@appydave/core` | Pino logger (`Logger`); reads `$LOG_LEVEL` |
| `atomicWrite(path, content, opts?)` | `@appydave/core` | temp-file + rename; `content: string \| Uint8Array`; optional fsync |
| `SerialQueue` | `@appydave/core` | `.enqueue(task)` runs tasks in submission order, one at a time; errors don't poison the chain; `.drain()`, `.size` |
| `createStore<T>({ path, defaults, ... })` | `@appydave/core` | `{ read(); write(v); update(fn) }` — local-first JSON over `atomicWrite`+`SerialQueue`; concurrent `update()` never lose a write |

## 2. Provenance

`@appydave/core` was **extracted** from the already-tested `@appydave/appysentinel-core`
(`lifecycle`, `config`, `logger`, `atomic-write`, `serial-queue` — code + tests lifted verbatim),
plus a new `Store` primitive built over `atomicWrite` + `SerialQueue`. AppySentinel keeps only its
Sentinel-specific bits (`Signal`, `SignalBus`, `createSentinel`, `QueryResult`); the plan is to
de-dup it (and AppyStack) onto `@appydave/core` — not yet done (touches live systems).

## 3. What belongs here (the bar for adding a primitive)

A candidate primitive must be **all three**:
1. **Cross-cutting** — needed by more than one boilerplate (or clearly will be). One consumer ≠ a
   shared primitive; that's premature. (Same discipline as "recipes are byproducts of pilots.")
2. **Dependency-clean** — depends only on Node built-ins + the core's tiny runtime deps
   (`pino`, `zod`). No Electron, no web, no product code.
3. **Tested** — ships with Vitest coverage; the value of these primitives is that they're small,
   pure, and testable in isolation.

If it's specific to one product (Electron windows, web sockets, Sentinel signals), it lives in that
product, **not** here.

## 4. Conventions

- **Toolchain:** Bun workspaces · Vitest · `tsc`. `bun run test` · `bun run typecheck` · `bun run build`.
- **ESM**, `type: module`; `.js` extensions on relative imports (bundler resolution).
- Runtime deps kept minimal: `pino`, `zod` (and `ulid` only where a primitive needs it — the six
  current primitives need only pino + zod).
- **Published to npm as `@appydave/core@0.1.0`** (public, scoped under `@appydave`). Consumers pin
  `^0.1.0` and it resolves from npm; AppyTron's `--link-core` stays useful for editing core + an app
  together. **Bump the version before each re-publish** (`npm publish` needs an OTP).

## 5. Repo map + verify

```
~/dev/ad/apps/appydave-foundation/       github.com/appydave/foundation (public)
├── CONTEXT.md                           ← you are here
├── README.md
└── packages/core/                       @appydave/core
    ├── src/   lifecycle · config · logger · atomic-write · serial-queue · store · index
    └── test/  one test file per primitive
```

```bash
cd ~/dev/ad/apps/appydave-foundation
bun install && bun run test && bun run typecheck && bun run build   # 33 tests, dist/ emitted
```

## 6. If you're extending it

1. Confirm the candidate clears the §3 bar (cross-cutting, dependency-clean, tested).
2. Add `src/<name>.ts` + `test/<name>.test.ts`; export from `src/index.ts` and add an `exports`
   subpath in `packages/core/package.json`.
3. Keep it pure — no side effects at import time; a `create<Name>()` factory is the house style
   (mirrors `createStore` / `createLogger`).
