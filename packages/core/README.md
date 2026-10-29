# @appydave/core

The shared, product-prefix-free foundation reused by every AppyDave boilerplate
(AppyStack · AppySentinel · AppyTron).

```bash
npm i @appydave/core zod@^4
```

`zod` is a **peer dependency** (`^4.0.0`) from 0.2.0: the app supplies the one zod, and the
`z` that `@appydave/core` re-exports is that same copy. npm 7+ and Bun install a missing peer
automatically; listing it yourself keeps the version visible.

## Primitives

| Export | What it does |
|--------|--------------|
| `createLifecycle()` | start/stop hook harness (signals, ordered hooks, health) |
| `createConfigLoader()` | defaults → file → env, Zod-validated, reloadable |
| `createLogger({ name })` | Pino structured logging |
| `atomicWrite(path, content)` | torn-write-proof file write (`string \| Uint8Array`) |
| `SerialQueue` | ordered, one-at-a-time task queue |
| `createStore({ path, defaults })` | local-first JSON store (atomic + serialised) |

No product-specific, web, or Electron code — those live in the consuming boilerplate.

MIT · David Cruwys · [github.com/appydave/foundation](https://github.com/appydave/foundation)
