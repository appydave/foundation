/**
 * @appydave/core — shared AppyDave foundation primitives.
 *
 * Cross-cutting building blocks reused by every AppyDave boilerplate
 * (AppyStack, AppySentinel, AppyTron): process lifecycle, config loading,
 * structured logging, atomic file writes, a serial task queue, and a
 * local-first JSON store. No product-specific or Electron code lives here.
 */

export {
  type Lifecycle,
  type LifecycleStatus,
  type StopReason,
  type HealthReport,
  type StartHook,
  type StopHook,
  type ReloadHook,
  type CreateLifecycleOptions,
  createLifecycle,
} from './lifecycle.js';

export {
  type ConfigLoader,
  type ConfigLoaderOptions,
  createConfigLoader,
  z,
} from './config.js';

export {
  createLogger,
  type Logger,
  type LogLevel,
  type CreateLoggerOptions,
} from './logger.js';

export { atomicWrite, type AtomicWriteOptions } from './atomic-write.js';

export { SerialQueue } from './serial-queue.js';

export { createStore, type Store, type StoreOptions } from './store.js';
