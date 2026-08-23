# Cross-Boilerplate Drift Audit — 2026-08-23

**Purpose**: One sweep across AppyStack, AppySentinel, AppyTron and Foundation, resolving every
known doc-vs-reality drift to CONFIRMED STALE / STILL TRUE / ALREADY FIXED.

**Why it lives here**: the drift is *cross-boilerplate*, so it belongs with the other
cross-boilerplate records (`convergence-map.md`, `dedup-plan.md`,
`boilerplate-consolidation-decision.md`) rather than in any one product repo.

**Scope**: documentation and dependency-manifest facts only. **No code was refactored.** Three
fixes were applied (F1, F2, F8); everything else is recorded as backlog.

**Trigger**: doctrine extraction for `brains/agentic-factory/appydave-stack-doctrine.md`.

---

## Summary

| # | Item | Verdict | Action |
|---|---|---|---|
| 1 | Sentinel `CONTEXT.md` self-contradicts on the mutation rule | 🔴 **CONFIRMED STALE** | ✅ **FIXED** |
| 2 | AppyTron plan §15 foundation path wrong | 🔴 **CONFIRMED STALE** | ✅ **FIXED** |
| 3 | `@appydave/core` backfill onto AppyStack | 🟡 **PARTIAL — 1 of 4 primitives** | 📋 backlog |
| 4 | `appytron-config` → `@appydave/config` | 🟢 **STILL TRUE** (undecided) | 📋 backlog |
| 5 | AppyStack "Planned Improvements" Q2/Q3 2026 dates | 🔴 **CONFIRMED STALE** — 1 shipped, 1 done, 3 overdue+unmarked | 📋 backlog |
| 6 | `configure-sentinel/SKILL.md` "is a placeholder" | 🔴 **CONFIRMED STALE** — 454 lines | 📋 backlog |
| 7 | Dependency currency | 🔴 **5 majors behind** | 📋 backlog — **do not upgrade blind** |
| 8 | `appysentinel` vs `appyradar-sentinel` collision | 🟡 real, undocumented | ✅ **FIXED** |
| 9 | *(new)* `~/.config/appydave/` backup-file sprawl | 🔴 **~250 stray backups** | 📋 backlog — not this repo |

---

## 1. 🔴 CONFIRMED STALE — Sentinel `CONTEXT.md` gave two answers on mutation · ✅ FIXED

`appysentinel/CONTEXT.md` contradicted itself in one file:

- **§4 (line 118)** — *"Observer-only by default (an **80/20 posture, not a blanket ban**)"*, with the
  ~20% exception scoped to the Access channel for managing the Sentinel itself. Explicitly says it
  *"supersedes the earlier 'mutation is a future `mcp-tools` recipe' framing"*. **Resolved 2026-06-13.**
- **§7 (line 187)** — still carried the superseded framing verbatim: *"No mutation by default…
  (Future opt-in `mcp-tools` recipe deferred to v1.1+.)"*

**Why it matters**: §7 is the *Scope Limits* section — the part an agent reads to decide what it is
allowed to build. It was pointing at a ruling that had been overturned two months earlier.

**Fix applied** → `appysentinel/CONTEXT.md` §7 now states the 80/20 posture, points at §4, and
carries a dated correction note.

---

## 2. 🔴 CONFIRMED STALE — AppyTron plan §15 foundation path · ✅ FIXED

`appytron/docs/appytron-plan.md:387` read:

```
~/dev/ad/apps/appydave-core/    → @appydave/core   (…)  [home TBC]
```

**Three sources already disagreed with it** — the *same file* at §16 line 412, plus
`appytron/CONTEXT.md` lines 8, 182 and 199 — all giving `~/dev/ad/apps/appydave-foundation/`, which
is what is on disk.

**Fix applied** → §15 corrected to `~/dev/ad/apps/appydave-foundation/packages/core/`, `[home TBC]`
removed (resolved 2026-07-19), with a note saying which line was the stale one.

---

## 3. 🟡 PARTIAL — the AppyStack backfill is 1 of 4 primitives

AppyTron §16 said AppyStack would be *"backfilled onto `@appydave/core` as needed (later)"*. It has
**started** — further than the docs imply — but is not done.

✅ **Wiring exists**: `appystack/template/server/package.json` and
`appystack/create-appystack/template/server/package.json` both declare `"@appydave/core": "^0.1.0"`.

| Primitive | Used by AppyStack? | Evidence |
|---|---|---|
| `createLogger` | ✅ **yes** | `template/server/src/config/logger.ts:1` — *"The vendor choice lives in @appydave/core"* |
| `createConfigLoader` | ❌ no | AppyStack keeps its own `src/config/env.ts` (Zod env validation) |
| `createLifecycle` | ❌ no | no import anywhere in template source |
| `createStore` / `atomicWrite` / `SerialQueue` | ❌ no | no import anywhere in template source |

**Not necessarily wrong.** An Express request/response app has little use for a daemon `Lifecycle`,
and `env.ts` validates *environment* rather than layering a config file. The open question is
whether `ConfigLoader` should absorb `env.ts` or whether the two are genuinely different jobs.

📋 **Backlog**: decide per-primitive whether AppyStack *should* adopt it. Do not treat "3 of 4
unadopted" as debt until that call is made. **No refactor performed.**

---

## 4. 🟢 STILL TRUE — `@appydave/config` remains undecided

`appytron/docs/appytron-plan.md` §14.6 / §16 flag `appytron-config` possibly collapsing into a
neutral `@appydave/config` — *"flagged, not decided."*

**Still accurate.** `appydave-foundation/packages/` contains exactly one package (`core`), and
`appydave-foundation/README.md` lists `@appydave/config` as *(planned)*.

📋 **Backlog**: still a live decision. Note the doctrine's **P7** (independent lifecycles) argues
*for* the split, and **P2** (near-zero dependency floor) is silent on it — config packages carry
only devDependencies.

---

## 5. 🔴 CONFIRMED STALE — three overdue targets carry no marking

`appystack/docs/architecture.md` §"Planned Improvements" still shows Q2/Q3 **2026** targets. It is
now **2026-08-23**; Q2 ended 30 June and Q3 ends 30 September.

| Improvement | Doc says | Reality (verified on disk) | Verdict |
|---|---|---|---|
| MSW for API mocking | Planned (Q2 2026) | ✅ **SHIPPED** — `template/client/src/test/msw/{browser,server}.ts` + wired into `test/setup.ts` | 🔴 doc stale, mark shipped |
| Shared tooling packages | In progress | ✅ **DONE** — `@appydave/appystack-config` published | 🔴 mark done |
| Feature-based architecture | Planned (Q2 2026) | ❌ no `features/` directory in the template | 🔴 **overdue, unmarked** |
| ServiceResponse pattern | Planned (Q2 2026) | ❌ no match in template source | 🔴 **overdue, unmarked** |
| OpenAPI auto-generation | Planned (Q3 2026) | ❌ no `openapi` / `zod-to-openapi` anywhere | 🟡 due 30 Sep — at risk |

**Why it matters**: an unmarked overdue date reads as a plan. Three of these are quietly past due.

📋 **Backlog**: re-status all five — shipped / slipped-with-new-date / dropped. The two shipped rows
are the cheap win; **the three unshipped ones need David's ruling, so they were not touched.**

---

## 6. 🔴 CONFIRMED STALE — `configure-sentinel/SKILL.md` is no longer a placeholder

`appysentinel/CONTEXT.md` §5 *Non-obvious Constraints* states:

> *"`packages/template/.claude/skills/configure-sentinel/SKILL.md` is a placeholder. Until it is
> fleshed out (deliberately deferred for v1), the Layer 2 handoff runs but the agent works from the
> base prompt in `handoff.ts`, not from a project-local skill file."*

**On disk: 454 lines.** It has been fleshed out.

📋 **Backlog**: rewrite that constraint. ⚠️ **What this check did NOT establish** — only the line
count was measured. Whether `handoff.ts` actually *reads* the skill file, or still falls through to
its base prompt, was **not** verified. The constraint may be stale in its premise while remaining
true in its effect. Read `handoff.ts` before rewriting.

---

## 7. 🔴 Dependency currency — five majors behind

Latest versions queried from npm 2026-08-23. **Nothing was upgraded.**

| Package | Pinned | Latest | Gap |
|---|---|---|---|
| **typescript** | `^5.7.3` | **7.0.2** | 🔴 **two majors** |
| **zod** | `^3.24.1` (Stack) / `^3.23.0` (core) | **4.4.3** | 🔴 one major |
| **pino** | `^9.6.0` | **10.3.1** | 🔴 one major |
| **eslint** | `^9.39.5` | **10.9.0** | 🔴 one major |
| **vite** | `^7.3.6` | **8.2.2** | 🔴 one major |
| express | `^5.0.1` | 5.2.1 | 🟢 current major |
| react | `^19.2.7` | 19.2.8 | 🟢 |
| socket.io | `^4.8.1` | 4.8.3 | 🟢 |
| tailwindcss | `^4.3.2` | 4.3.3 | 🟢 |
| vitest | `^4.1.10` | 4.1.11 | 🟢 |
| prettier | `^3.9.5` | 3.9.6 | 🟢 |

**The one that propagates**: `zod` is a runtime dependency of `@appydave/core` (one of only two).
Zod 3 → 4 in the foundation is a breaking change for **every** boilerplate at once. That is the
cost of P2's small floor working as designed — few dependencies, but each is load-bearing.

📋 **Backlog**: sequence a deliberate upgrade — `@appydave/core` first (it is the shared root), then
consumers. **Do not upgrade blind**; TypeScript 5→7 and ESLint 9→10 each carry their own migration.

---

## 8. 🟡 Naming collision — `appysentinel` vs `appyradar-sentinel` · ✅ FIXED

Two different things, one syllable apart:

| Path | What it is |
|---|---|
| `~/dev/ad/apps/appysentinel` | **A boilerplate.** Produces Sentinels. Not an application; does not run |
| `~/dev/ad/apps/appyradar-sentinel` | **A live application** — AppyRadar's Tailscale fleet-telemetry dashboard (launchd + MCP run from it). `locations.json` records its directory as the misspelt `sentinal`, rename pending |

The second predates the first. A Sentinel from the boilerplate is a *kind of thing*; AppyRadar's is
*one instance of that kind*, built before the kind existed.

**Fix applied** → disambiguation table added near the top of `appysentinel/README.md`.

📋 **Backlog** (not this repo): the `sentinal` → `sentinel` rename is still pending per
`locations.json`; see `appyradar-sentinel/docs/migration-sentinal-to-sentinel.md`.

---

## 9. 🔴 NEW FINDING — `~/.config/appydave/` backup sprawl

Not a boilerplate issue, but surfaced during the sweep and worth recording.

`~/.config/appydave/` holds roughly **250** stray backup files — `bank-reconciliation.json.backup.*`
(~190, timestamped to the second across 2026-05-28 → 06-01) and `locations.json.backup.*` (~60,
several written within the *same second*).

Both are live registry files: `locations.json` is the canonical location registry that drives
`jump`, and the directory is a **git repo with a private remote** (`appydave/appydave-config`).

📋 **Backlog**: whatever writes these has no retention policy, and a same-second burst suggests a
loop re-saving per mutation rather than per operation. **Not touched** — nothing was deleted, and
the writer was not identified.

---

## What this audit did NOT establish

- **No code was read for correctness.** Items 3, 5 and 6 were resolved by `grep` over template
  source and by file presence. Presence of an import is not proof it is exercised.
- **Item 6 is half-checked** — the SKILL.md is real, but whether `handoff.ts` reads it is unverified.
- **No build or test run.** Item 7's version gaps are manifest-vs-registry only; whether any upgrade
  is *safe* was not assessed.
- **AppyTron has no shipped consumer**, so every AppyTron item is a plan-vs-plan comparison.
  Its own plan still closes with *"Nothing is scaffolded yet."*
- **Only four repos were swept.** Downstream apps built on AppyStack (FliGen, FliHub, FliDeck,
  Storyline) were not checked and may carry their own drift.

---

## Related

- [convergence-map.md](./convergence-map.md) · [dedup-plan.md](./dedup-plan.md) · [boilerplate-consolidation-decision.md](./boilerplate-consolidation-decision.md)
- `~/dev/ad/brains/agentic-factory/appydave-stack-doctrine.md` — the doctrine this sweep fell out of
