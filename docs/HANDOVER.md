---
doc: handover
kind: session handover — resume with no access to the original chat
session: 2026-07-18 → 2026-07-19
state: AppyTron shipped · shared-foundation convergence mapped + decided + PARKED (nothing migrated)
---

# Handover — AppyTron + AppyDave Shared Foundation

Read this + the canonical docs below and you have everything. Nothing is broken, nothing is
mid-flight — it's all committed and pushed.

## The two things this session produced

**1. AppyTron — a new boilerplate, BUILT & SHIPPED.** Third AppyDave scaffold (peer of AppyStack
web / AppySentinel headless): builds native local-first Electron desktop apps. Published, CI-green,
runs live. `@appydave/core@0.1.0` published to npm.

**2. Shared-foundation convergence — MAPPED, best-in-class stack DECIDED, PARKED.** The plan to make
all boilerplates draw from one shared toolkit (`@appydave/core`). Fully researched; **no live code
migrated** (every step touches published systems → needs David's go + an OTP re-publish).

## Canonical docs (these hold everything — read, don't re-derive)

**AppyTron** (`~/dev/ad/apps/appytron/`, repo `appydave/appytron`, public):
- `CONTEXT.md` — read-once system comprehension
- `docs/appytron-plan.md` — design + all decisions · `docs/BUILD-LOG.md` — as-built vs plan
- `docs/distribution-and-auto-update.md` — the KyberBot pattern + the "$99" answer
- `docs/signing-notarization.md` — Apple credential checklist (when shipping)

**Foundation** (`~/dev/ad/apps/appydave-foundation/`, repo `appydave/foundation`, public):
- `CONTEXT.md` — the `@appydave/core` shared lib
- `docs/dedup-plan.md` — AppySentinel de-dup (GO, low-risk)
- `docs/convergence-map.md` — per-concept unify/split/justified across all 3 boilerplates
- `docs/recommended-stack.md` — the best-in-class technology picks (below)

## The decided stack (from `recommended-stack.md`)

Logging → **LogTape** (NOT Pino — browser/renderer-broken) · Validation → **Zod v4** · Env →
**@t3-oss/env-core** · Config → **c12** · Errors → **tiny custom base** · Emitter → **mitt** ·
IDs → **UUID v7** · Scaffold → **thin custom + giget**. Keep thin `createLogger`/`z` seams.

## Next actions — all PARKED, each needs David's go (live/published; OTP re-publish)

1. **AppySentinel core de-dup** onto `@appydave/core` (byte-identical primitives → import; delete
   the 5 dup files+tests). Low risk, patch-level. See `dedup-plan.md`.
2. **Converge logging → LogTape** across all three (Stack especially — it rolls its own Pino).
3. **Extract into `@appydave/core`** and migrate: env (t3-env), config (c12), typed-errors,
   emitter (mitt), id (uuid v7).
4. **Shared scaffold engine** — converge the three `create-*` CLIs (bigger).
5. **`@appydave/config`** — DEFER (React-vs-node divergence; wait for a 3rd consumer).
6. **Apple signing** — when an app ships to someone else; reuse Ian's Developer ID + copy KyberBot's
   `~/dev/kybernesis/kyberbot-desktop` setup.
7. **AppyTron** is done — only optional polish remains (wire FileAuthor/Updater into `createConsole`,
   bump stack to React 19/Vite 7 later).

## Principles established this session (also in brains memory)

- **Boilerplate ≠ app.** AppyStack/AppySentinel/AppyTron are scaffolds; the *generated* apps
  (AppyRadar, AngelEye Sentinel, ImageDrip…) are what ship and what the shared toolkit must serve.
- **Shared tech = research best-in-class, not majority-vote** (Pino was the majority pick and the
  wrong shared choice).
- `@appydave/core` is a justified shared lib (cross-boilerplate + every generated app), not
  over-engineering — but it's only half-realised until the de-dup + convergence run.

## To resume
Open a session in `~/dev/ad/apps/appydave-foundation` (or `appytron`), read this file, then pick a
"Next action." Nothing requires the original chat.
