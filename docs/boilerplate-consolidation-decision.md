---
doc: boilerplate-consolidation-decision
kind: decision record (the OUTCOME — supersedes the migration plan as the thing to act on)
created: 2026-07-19
decision: DO NOT build the monorepo now — take the cheaper multi-repo path
method: 3-seat adversarial panel (fresh-context, read the real code), unanimous
supersedes: monorepo-migration-plan.md is DEFERRED (kept as the record of *why*, not the next step)
related: convergence-map.md · recommended-stack.md · dedup-plan.md
---

# Decision — Don't Monorepo the Boilerplates (Yet)

## The decision

**Do NOT consolidate the 3 boilerplates + `@appydave/core` into one monorepo now.** Keep them
multi-repo and published, and capture the real value through a handful of small, reversible,
in-place changes. Revisit the monorepo only on a concrete trigger (below), not on principle.

This **reverses** the earlier "migrate first" recommendation in `monorepo-migration-plan.md`. That
plan justified a ~1-day irreversible git-history rewrite by a convergence benefit that is (a) mostly
one 30-minute de-dup and (b) needs neither the monorepo nor `filter-repo` to capture. The tail was
wagging the dog.

## Why — the one code fact that sinks it

An adversarial panel of three independent reviewers (a maintainer lens, an adversarial architect, and
a recipes/distribution specialist) each read the actual repos with no knowledge of the advocacy. They
**converged on every axis**, on one verified fact:

> **`@appydave/core` has ~one real consumer.** AppyTron uses it (via `file:` link). AppyStack shares
> *nothing* with it (the de-dup plan itself marks it SKIP). AppySentinel holds **5 byte-identical**
> copies but doesn't even import core yet.

So the monorepo's headline benefit — atomic changes across many consumers — would be coordinating a
grand total of *one* live dependency. Combined with your own premise that the **generated apps are
cheap/disposable and not in lockstep**, the structural case evaporates. It's tidiness dressed as
architecture.

## The five axes (panel verdicts, unanimous)

| Axis | Verdict | One-line reason |
|------|---------|-----------------|
| **A · Monorepo now** | 🛑 **STOP** | Co-locates for a multi-consumer benefit that doesn't exist (~1 real consumer; disposable apps) |
| **B · Convergence** | **De-dup ONLY** | The 5 byte-identical files are a real win; LogTape / shared env-errors-emitter / scaffold-engine are premature (extraction from a single consumer, or forcing 3 deliberately-different styles into false uniformity) |
| **C · Recipes** | **Per-repo + fix drift** | Recipes bind to each stack's primitives → cross-boilerplate overlap ≈ zero; global would co-mingle things that don't belong together |
| **D · Plugin system** | **Reuse existing** | `appydave-plugins` is already a working Claude Code marketplace; a new one is net-new infra for an imagined problem |
| **E · Timing** | 🛑 **STOP** | Never rewrite four repos' history while divergent off-remote work exists (it did, on 2 machines) |

## The cheaper path — do these instead (ranked, all multi-repo, all reversible)

1. **✅ DONE (this session) — Fleet hygiene.** Both machines reconciled: appystack + appysentinel
   committed/pushed and clean on Roamy **and** M4 Mini; the leaking build-artifact junk is now
   gitignored at root. (There was no true divergence — just Roamy behind on fetch.)
2. **AppySentinel core de-dup, in place.** Delete the 5 byte-identical primitives in
   `appysentinel/packages/core/src/`, add `@appydave/core` as a dep, re-export. One PR, one publish.
   The *only* convergence step that's ready and clearly worth it. See `dedup-plan.md`.
3. **AppyStack logger → `createLogger` seam — keep Pino underneath.** Do **not** rip in LogTape. Two
   of three boilerplates don't even have the browser-shim problem LogTape solves. Small, contained.
4. **Fix recipe drift *within* each family.** Real bug the panel found: `create-appytron` carries a
   **second, already-diverged copy** of the recipe skill (its `probe` is missing 5 reference files).
   Make the `create-*` scaffolder single-source the template's recipe skill instead of holding a
   second copy. Per-repo — no globalizing.
5. **Publish the thin global layer** (`appydave-palette`, `readme`, `domain-expert-uat`) as ONE skill
   in the existing `appydave-plugins` marketplace. The single genuinely-global reusable-asset move —
   and it's independent of the mono-vs-multi question.
6. **Move domain DSLs out** (`care-provider-operations`, `youtube-launch-optimizer`) from boilerplate
   templates into example/app repos — they're app content leaking into the scaffold.

## Recipes — the three-tier structure (the answer to "per-repo or global?")

Your instinct that recipes have both a per-repo and a global half was right; the panel sharpened it.
The split is **not** per-repo-vs-global — it's three tiers, each with a distinct home:

- **Stack recipes** (`ipc-crud`, `entity-socket-crud`, `wrap-cli`…) → **per-repo.** They bind to each
  stack's primitives; overlap across boilerplates ≈ zero. Even same-named recipes differ (electron
  `nav-shell` ≠ web `nav-shell`).
- **Thin global** (`appydave-palette`, `readme`, `domain-expert-uat`) → **one shared skill** in the
  existing marketplace.
- **Domain DSLs** (NDIS, YouTube) → **out of the boilerplate entirely**, into app/example repos.

The copied-skill duplication is a real drift problem, but only *within* a family — fix it by
single-sourcing the scaffolder's copy, not by making recipes global.

## Plugin system

**Reuse `appydave-plugins`** (the existing Claude Code marketplace: `.claude-plugin/marketplace.json`,
install via `/plugin marketplace add github:appydave/appydave-plugins`). The gap is only that recipe
skills currently ship by template-copy instead of through this channel. Do **not** build a second
plugin system.

## Parked — and the trigger to revisit each

| Parked | Revisit when |
|--------|--------------|
| The **monorepo** | Coordinated multi-package *releases* become recurring pain, OR a real 2nd/3rd shared consumer of `@appydave/core` appears, OR boilerplate #4 arrives |
| **LogTape** swap | A generated app actually hits the Pino browser/renderer shim in anger |
| Shared **env-schema / typed-errors / emitter** in core | A genuine 2nd consumer needs the same primitive (rule-of-three) |
| Shared **scaffold engine** | Boilerplate #4 — the point at which 3 near-identical `create-*` CLIs stop being tolerable |
| `@appydave/config` | Still deferred — React-vs-node divergence; wait for a 3rd real consumer |

## Status

- Fleet reconciliation: **done** (this session).
- Everything else above: **not started** — this doc is the decision, `dedup-plan.md` is the next
  concrete step.

*Next session: act on step 2 (the de-dup). The monorepo plan is deferred, not dead — see the trigger
table before resurrecting it.*
