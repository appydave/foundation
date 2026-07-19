---
doc: dedup-plan
kind: actionable plan (read-only audit done; execution needs David's go — touches a live published system)
created: 2026-07-19
audited: AppySentinel · AppyStack · AppyTron · @appydave/core
status: NOT executed — awaiting go
---

# @appydave/core — Consumer De-dup Plan

`@appydave/core` was extracted **by copy** from `@appydave/appysentinel-core`, so Sentinel still holds
duplicate primitives. This is the plan to consolidate — grounded in a three-app read-only audit
(the answer to "did we look at all three?": **yes, now we have**).

## Ground truth (verified 2026-07-19)

- **The 5 shared primitives are byte-identical** (`diff` = zero drift) between
  `appydave-foundation/packages/core/src` and `appysentinel/packages/core/src`:
  `lifecycle · config · logger · atomic-write · serial-queue`.
- **`store.ts` is core-only** (new; never existed in Sentinel).
- Both are **published**: `@appydave/core@0.1.0`, `@appydave/appysentinel-core@0.2.0` — live consumers
  are the central risk vector.
- **AppyTron already consumes `@appydave/core`** (via `file:` link) and it works — the proven pattern
  for how Sentinel should consume it.

## Findings

| Primitive | AppySentinel | AppyStack |
|-----------|-------------|-----------|
| lifecycle | ✅ duplicate (used by `create-sentinel.ts`) | ❌ none (Express owns shutdown) |
| config (ConfigLoader) | ✅ duplicate (pure re-export) | ⚠️ different — `server/src/config/env.ts` is a zod **env-var** schema, not a file+env loader |
| logger | ✅ duplicate (used by `create-sentinel.ts`) | ⚠️ different — direct `pino`, no factory |
| atomic-write | ✅ duplicate | ❌ none |
| serial-queue | ✅ duplicate | ❌ none |
| store | ❌ core-only | ❌ none |

Sentinel-specific — **stays in appysentinel-core**: `signal · bus · create-sentinel · query`.

**AppyStack shares essentially nothing** with core's primitives — it's a web/Express/Socket.io scaffold
with web-shaped logger/config and no atomic-write/store/serial-queue/lifecycle. Adopting core there
would be a misfit, not a win.

## The plan

### 1. AppySentinel — GO (high value, low risk) · needs David's go (live, published)
Make `@appydave/appysentinel-core` depend on `@appydave/core` and delete the duplicates:
1. Add `@appydave/core` dep (`file:` link for dev like AppyTron; `^0.1.0` for publish).
2. Delete the 5 impl files **and their 5 duplicate test files** (now tested in core).
3. Rewrite `create-sentinel.ts` imports: `createLifecycle`/`createLogger` from `@appydave/core`.
4. `index.ts`: re-export the 5 (+ optionally `createStore`) from `@appydave/core`; keep exporting
   `signal/bus/create-sentinel/query` locally.

Public API of `appysentinel-core` is **unchanged** → semver **patch/minor, no break**.
**Verify:** `npm run build && npm run test && npm run typecheck` in sentinel-core (bus/signal/
create-sentinel tests are the real check) + build one scaffolded template.
**Risks:** (a) it's published — `@appydave/core@0.1.0` must be on npm first (it is); re-publishing
sentinel-core needs an OTP. (b) Drift now flows one way (core → sentinel) — a breaking change in core
breaks sentinel; pin deliberately. (c) Reuse AppyTron's `file:`-vs-published dual-mode pattern
(`create-appytron/src/scaffold.ts`) — don't reinvent.

### 2. AppyStack — SKIP (genuine mismatch, not laziness)
Nothing switches. `env.ts`/`logger.ts` are web-shaped and serve different concerns. Leave app-specific.

### 3. `@appydave/config` extraction — DEFER (premature)
`appysentinel-config` vs `appystack-config`: prettier identical; vitest-node + tsc-base ~identical;
but eslint, tsc-node, and AppyStack's `react.*` / client-vitest are **intentionally divergent**
(headless-node vs React-web). Two divergent consumers = below rule-of-three, and the abstraction risk
(leaking React assumptions into headless projects) is real. **Trigger to revisit: a 3rd consumer —
i.e. when AppyTron gains its own config package.**

## Bottom line
- **AppySentinel de-dup → GO** when David okays it (only real consolidation win; low risk).
- **AppyStack → SKIP** (shares nothing).
- **`@appydave/config` → DEFER** (premature at 2 divergent consumers).
