---
doc: monorepo-migration-plan
kind: plan (REPORT-ONLY) — ⚠️ DEFERRED 2026-07-19; NOT the next step
status: deferred — superseded by boilerplate-consolidation-decision.md
created: 2026-07-19
decision: consolidate the 3 boilerplates + shared core into ONE Bun-workspace monorepo
target: appydave/foundation (already a Bun workspace — becomes the monorepo)
supersedes-tooling: the earlier "pnpm + changesets + turbo" suggestion — foundation is already Bun; we extend it
related: boilerplate-consolidation-decision.md (the ACTUAL decision) · convergence-map.md · recommended-stack.md · dedup-plan.md · HANDOVER.md
---

> ⚠️ **DEFERRED — do not act on this plan.** A 3-seat adversarial panel (2026-07-19) concluded the
> monorepo is premature: `@appydave/core` has ~one real consumer and the generated apps are
> disposable, so the co-location benefit is largely absent. The real value is captured by a cheaper
> multi-repo path. **See [`boilerplate-consolidation-decision.md`](./boilerplate-consolidation-decision.md)
> for the decision and the next steps.** This document is retained as the record of *how* a monorepo
> migration would be done (and its history/tooling analysis stays valid) for the day a revisit-trigger
> fires — see the trigger table in the decision doc.

# Monorepo Migration Plan — AppyDave Boilerplate Family

## 0. TL;DR

- **The monorepo already exists.** `appydave/foundation` is a Bun workspace (`bun.lock`,
  `workspaces: ["packages/core"]`) holding `@appydave/core`. It just has one tenant. This migration
  **moves three more tenants in** — it does not build a monorepo from scratch.
- **Scope = 4 things only:** `@appydave/core` + the three *boilerplates* (AppyStack, AppySentinel,
  AppyTron). The **generated apps** (AppyRadar, AppyRadar-Sentinel, ImageDrip, AngelEye Sentinel…)
  stay in their own repos and keep consuming `@appydave/core` **from npm** — the monorepo does not
  touch them or the external npm contract. (Principle: *boilerplate ≠ app*.)
- **Do this BEFORE the parked convergence work**, not after. Convergence (de-dup, LogTape, shared
  env/errors/emitter, shared scaffold engine) is a series of changes that hit core + N consumers at
  once. In multi-repo that's OTP-publish-per-step (which is why it's parked). In the monorepo it's a
  single atomic PR with `workspace:*` linking. The migration is the thing that *unparks* convergence.
- **Tooling: stay on Bun.** Extend the existing Bun workspace. Do **not** introduce pnpm/turbo —
  that would swap a deliberate working config. Versioning stays manual initially (matches today);
  evaluate Changesets later as an additive follow-up, not a blocker.

---

## 1. Ground truth (verified 2026-07-19)

| Repo | Layout | Publishable packages | Tags | Tree |
|------|--------|----------------------|------|------|
| **foundation** (target) | Bun workspace, `packages/core` | `@appydave/core` | none | clean |
| **appytron** | flat | `create-appytron`, `appytron-upgrade` (+ private `template/` = `appytron-app`) | none | clean |
| **appystack** | flat-ish, nested template workspace | `@appydave/appystack-config`, `create-appystack`, `appystack-upgrade` (+ private template server/shared/client) | **v1.0.0–v1.0.3** | ⚠️ **DIRTY** |
| **appysentinel** | **own Bun workspace** (`packages/core|config|cli|template`) | `@appydave/appysentinel-core`, `@appydave/appysentinel-config`, `create-appysentinel` | **v0.1.6–v0.2.0** | clean |

**Two hazards this surfaces:**
1. **Tag collision** — AppyStack (`v1.0.x`) and AppySentinel (`v0.1.x/v0.2.0`) will collide with each
   other and with future foundation tags. → **namespace all tags on import.**
2. **Nested workspaces** — AppySentinel declares its own `workspaces:[…]`, and AppyStack's template
   sub-tree does too. Nested workspaces are **not supported** by Bun/npm/pnpm. → **foundation root
   must become the sole workspace authority; the imported `workspaces` fields get neutralized.**

**Pre-flight blocker:** AppyStack is dirty — commit + push it before import (filter-repo clones the
GitHub remote; uncommitted local work would simply not be included).

`git-filter-repo` is installed (`/opt/homebrew/bin/git-filter-repo`). Bun 10.11, npm 11.11 present.

---

## 2. Target layout

Keep each boilerplate **self-contained as a subtree**, and let the foundation root workspace reach in
via globs — so the boilerplate's own history, docs, CONTEXT.md and packages travel together.

```
appydave/foundation/                    # the monorepo (Bun workspace, repo name unchanged)
├── packages/
│   └── core/                           # @appydave/core          (unchanged)
├── boilerplates/
│   ├── appytron/                       # create-appytron, appytron-upgrade, template/, docs/…
│   ├── appystack/                      # create-appystack, appystack-upgrade, config/, template/…
│   └── appysentinel/                   # packages/core|config|cli|template/, docs/…
├── docs/                               # foundation-level docs (this file lives here)
├── CONTEXT.md · README.md · tsconfig.json · bun.lock · package.json
```

Root `package.json` workspaces glob (single authority):
```jsonc
"workspaces": [
  "packages/*",                     // @appydave/core
  "boilerplates/*",                 // create-* CLIs, *-upgrade, appystack/config
  "boilerplates/*/packages/*",      // appysentinel's core/config/cli/template
  "boilerplates/*/template"         // boilerplate app templates (private)
]
```

**Repo name:** keep `appydave/foundation` (least disruption; the name still fits — it *is* the
foundation of the family). Optional cosmetic rename to `appydave/appydave` later; not part of this plan.

**Naming note:** `@appydave/core` (repo already points here) needs no `repository` change. Each *moved*
package gets `repository.directory` updated to its new path (see §4.5).

---

## 3. The import — concrete, history-preserving

**Method:** `git filter-repo --to-subdirectory-filter` (rewrites each repo's whole history under a
prefix, auto-resolving root-file collisions) **+ `--tag-rename`** (namespaces tags) in one pass, then
merge into foundation with `--allow-unrelated-histories`. This preserves per-commit, per-file history
at the new paths.

```bash
#!/usr/bin/env bash
# monorepo-import.sh — REFERENCE ONLY. Do NOT run without David's go.
# Idempotency: run against a FRESH branch of foundation; if it goes wrong, delete the branch.
set -euo pipefail

MONO="$HOME/dev/ad/apps/appydave-foundation"   # existing Bun workspace = target
WORK="$(mktemp -d)"                            # scratch for rewritten clones
BR=main

# --- pre-flight (fail fast) -------------------------------------------------
cd "$MONO"
[ -z "$(git status --porcelain)" ] || { echo "foundation dirty — commit first"; exit 1; }
git checkout -b monorepo-import                 # do the whole import on a branch

# <repo> <dest-prefix> <tag-prefix>
import () {
  local repo="$1" dest="$2" tagpfx="$3"
  echo "== importing $repo -> $dest =="
  git clone "git@github.com:appydave/${repo}.git" "$WORK/$repo"
  ( cd "$WORK/$repo"
    # move ALL history under dest/ AND namespace tags, in one rewrite
    git filter-repo --to-subdirectory-filter "$dest" --tag-rename ":${tagpfx}-"
  )
  git -C "$MONO" remote add "imp-$repo" "$WORK/$repo"
  git -C "$MONO" fetch "imp-$repo" --tags
  git -C "$MONO" merge --allow-unrelated-histories --no-edit "imp-$repo/$BR"
  git -C "$MONO" remote remove "imp-$repo"
}

import appytron     boilerplates/appytron     appytron       # no tags → rename is a no-op
import appystack    boilerplates/appystack    appystack      # v1.0.x  → appystack-v1.0.x
import appysentinel boilerplates/appysentinel appysentinel   # v0.1.x  → appysentinel-v0.1.x

echo "History imported on branch 'monorepo-import'. Now do §4 wiring, verify, THEN merge to main."
rm -rf "$WORK"
```

Result: four root-commits in the graph (foundation's + each import's), history interleaved by date
(correct, just busier), every file's log intact at its new path, tags namespaced.

---

## 4. Post-import wiring (the real work — none of it is automatic)

**4.1 Neutralize nested workspaces.** In `boilerplates/appysentinel/package.json` remove the
`workspaces:[…]` field (its packages are now claimed by the foundation root glob). Do the same for any
nested `workspaces` in `boilerplates/appystack/template`. Foundation root = sole authority.

**4.2 Extend the root workspace glob** (see §2).

**4.3 Convert cross-deps to workspace protocol.** Anywhere a boilerplate consumes `@appydave/core`
(or one boilerplate consumes another's package), change the version to `workspace:*`. This is what
kills the `--link-core` workaround — linking is now native and always-on.

**4.4 One lockfile.** Delete the imported per-repo lockfiles under the prefixes; run `bun install` at
root to produce a single `bun.lock`.

**4.5 Fix `repository` fields.** Each moved publishable package.json:
`"repository": { "type": "git", "url": "git+https://github.com/appydave/foundation.git", "directory": "boilerplates/appytron" }` (etc). Package **names never change** — only where they live.

**4.6 Inert workflows.** Imported `.github/workflows/*` now sit under `boilerplates/<x>/.github/` and
**GitHub will not run them** (only root `.github/workflows` runs). That's a free win (no double-runs) —
but delete them and write one consolidated root workflow (§6).

**4.7 Verify before merging to main:**
- `bun install` clean, single lockfile
- `bun run --filter '@appydave/*' build` green
- `bun run --filter '@appydave/*' test` green
- **Scaffold one app from each** `create-appytron` / `create-appystack` / `create-appysentinel` and
  confirm it builds — the boilerplates' actual job.
- `bun run` each `*-upgrade` in dry mode if it has one.

Only when all green: `git checkout main && git merge --no-ff monorepo-import`.

---

## 5. History gotchas + mitigations (the answer to "what breaks")

| Gotcha | Effect | Mitigation |
|--------|--------|------------|
| **SHAs rewritten** | filter-repo mints new commit hashes; old permalinks / "fixed in abc123" / commit-trailer links stop resolving in the new repo | **Archive the old repos, don't delete** (GitHub keeps old SHAs resolvable there); new work references new hashes |
| **Tag collision** | `v1.0.0` (Stack) vs `v0.2.0` (Sentinel) vs future foundation tags | **`--tag-rename` on import** → `appystack-v1.0.0`, `appysentinel-v0.2.0`; foundation/appytron had none |
| **`git blame` / `log --follow` seam** | one commit where paths shift; plain blame won't auto-cross it | Use `git log --follow`; within each package blame is intact. filter-repo makes this as clean as possible |
| **Root-file collisions** (4× README/package.json/.gitignore) | would clobber on a naive merge | `--to-subdirectory-filter` prefixes everything first → no collision |
| **Interleaved `git log`** | history sorted by date across 4 origins looks busy | Cosmetic; correct. `git log -- boilerplates/appytron` scopes it |
| **Nested workspaces** | Bun/npm can't nest workspace roots | §4.1 neutralization |
| **npm package identity** | must not drift (generated apps depend on exact names) | Folder ≠ package name — names preserved; only `repository.directory` changes |

Net: **no history is lost.** The only genuine tradeoff is old SHAs ceasing to resolve *in the new
repo* — fully covered by archiving the originals.

---

## 6. What changes operationally

**Publishing `@appydave/core` (and the create-* CLIs):** external result **identical** — still
`npm publish` under the same names, still OTP. The monorepo changes *frequency* (publish only on
release, not to test a change), not the mechanism. Generated apps install from npm exactly as today.

**Versioning:** stays **independent + manual** to start (matches current practice; AppySentinel already
ships versioned). No lockstep. *Follow-up (not a blocker):* evaluate Changesets for coordinated release
notes + version bumps — verify Bun compatibility first; fall back to manual if friction.

**CI:** collapse the per-repo workflows into **one root Bun workflow** (`bun install` → build → test →
scaffold-smoke). Add path filters later only if run-time hurts; **Turborepo deferred** — Bun's
`--filter` already runs workspace tasks, so no task-runner is needed at 4 packages.

**`--link-core` dev flow:** **retired.** Replaced by native `workspace:*`. Delete the flag + its docs
once every consumer is a workspace member.

**Convergence plan (de-dup / LogTape / env / errors / emitter / scaffold engine):** each step becomes
a single in-repo PR editing core + all affected boilerplates together, verified atomically, published
once. Specifically: **AppySentinel core de-dup** (dedup-plan.md) stops being an OTP dance and becomes a
local edit — delete the 5 duplicate primitives, point `@appydave/appysentinel-core` at `@appydave/core`
via `workspace:*`, run tests.

---

## 7. Rollback

Very safe — the import runs on a branch and the merges are purely additive:
- Before merge to main: `git branch -D monorepo-import` — foundation is untouched.
- After merge, before archiving originals: `git reset --hard <pre-merge-sha>` on foundation; the four
  source repos are still live and canonical.
- Point of no *easy* return is only after you (a) archive the old repos AND (b) start committing new
  work into the monorepo. Keep the originals archived-but-present indefinitely.

---

## 8. Sequencing + rough cost

```
Pre-flight:  commit+push AppyStack (dirty) · confirm all 4 clean+pushed · backup/verify remotes
   ↓
Import:      run §3 on a branch                                    ~15 min
   ↓
Wire:        §4.1–4.6 (neutralize nested ws · globs · workspace:* · lockfile · repo fields)  ~half day
   ↓
Verify:      §4.7 build + test + scaffold-smoke each boilerplate   ~1–2 hr
   ↓
Land:        merge to main · push · one root CI green
   ↓
Cleanup:     archive old repos + add "moved to appydave/foundation" README notice
   ↓
THEN:        convergence (start with AppySentinel core de-dup — now a local edit)
```

**Total: ~1 day**, one-time, most of it the §4 wiring + verification (the import itself is minutes).
Worth doing **now**: it's a bounded cost that converts the entire parked convergence backlog from
"OTP-hell, per-repo, per-step" into "atomic PRs" — and AppySentinel is already a workspace, so the
model is proven.

**One carve-out:** the AppySentinel byte-identical de-dup is trivial in *either* layout — if a quick
win is wanted before the migration, that single step is safe to do standalone. Everything else in
convergence benefits from doing the migration first.

---

## 9. Open decisions for David (before any `go`)

1. **Repo name** — keep `appydave/foundation`, or rename to `appydave/appydave`? (Plan assumes keep.)
2. **Layout** — self-contained boilerplate subtrees + root-glob (this plan), vs. flattening every
   `@appydave/*` package up into top-level `packages/`? (Plan chooses subtrees — keeps each
   boilerplate's identity + history cohesive.)
3. **Changesets now or later?** (Plan says later — manual to start.)
4. **Timing** — full migration now, or do the standalone AppySentinel de-dup first and migrate after?
   (Plan recommends migrate-first; de-dup carve-out available if you want a taste.)

*Nothing in this document is executed. It waits on your go.*
