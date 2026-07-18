# AppyDave Foundation

Neutral, **product-prefix-free** shared libraries reused by every AppyDave boilerplate
(AppyStack · AppySentinel · AppyTron). If a capability is common to more than one boilerplate,
it lives here — not inside any single product.

## Packages

| Package | What it is |
|---------|-----------|
| [`@appydave/core`](./packages/core) | Foundation primitives — `Lifecycle`, `ConfigLoader`, `Logger`, `atomicWrite`, `SerialQueue`, `Store`. No product-specific or Electron code. |
| `@appydave/config` *(planned)* | Shared ESLint / TS / Prettier / Vitest config. |

## Provenance

`@appydave/core` was **extracted** from the already-tested `@appydave/appysentinel-core`
(`lifecycle`, `config`, `logger`, `atomic-write`, `serial-queue`) — the code and its tests were
lifted verbatim, plus a new `Store` primitive built over `atomicWrite` + `SerialQueue`.
AppySentinel and AppyStack will be de-duplicated onto `@appydave/core` as needed.

## Toolchain

Bun workspaces · Vitest · `tsc`. `bun run test` · `bun run typecheck`.
