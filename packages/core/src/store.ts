/**
 * Store — local-first JSON persistence.
 *
 * A thin, crash-safe wrapper over `atomicWrite` (torn-write-proof file writes)
 * and `SerialQueue` (ordered, one-at-a-time access). Every read/write/update is
 * serialised through a single queue, so concurrent `update()` calls never lose a
 * write — the classic read-modify-write race is eliminated.
 *
 * Not a database: one JSON document per Store. For structured/queryable data a
 * consumer reaches for SQLite (a per-product recipe), not this.
 */

import { promises as fs } from 'node:fs';
import { atomicWrite, type AtomicWriteOptions } from './atomic-write.js';
import { SerialQueue } from './serial-queue.js';

export interface StoreOptions<T> {
  /** Absolute path to the JSON file backing this store. */
  path: string;
  /** Value returned by `read()` when the file does not yet exist. */
  defaults: T;
  /** Passed through to `atomicWrite` (mode, fsync, encoding). */
  write?: AtomicWriteOptions;
  /** `JSON.stringify` spacing. Defaults to 2 (pretty-printed). */
  space?: number | string;
}

export interface Store<T> {
  /** Read + parse the file. Returns a fresh clone of `defaults` if absent. */
  read(): Promise<T>;
  /** Atomically overwrite the file with `value`. Serialised. */
  write(value: T): Promise<void>;
  /** Read → apply `fn` → atomically write the result. Serialised end-to-end. */
  update(fn: (current: T) => T): Promise<T>;
}

export function createStore<T>(options: StoreOptions<T>): Store<T> {
  const { path, defaults, write: writeOptions, space = 2 } = options;
  const queue = new SerialQueue();

  async function readRaw(): Promise<T> {
    try {
      const text = await fs.readFile(path, 'utf8');
      return JSON.parse(text) as T;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        // Fresh clone so callers can't mutate the shared defaults object.
        return structuredClone(defaults);
      }
      throw err;
    }
  }

  async function writeRaw(value: T): Promise<void> {
    await atomicWrite(path, JSON.stringify(value, null, space), writeOptions);
  }

  return {
    read() {
      return queue.enqueue(readRaw);
    },
    write(value: T) {
      return queue.enqueue(() => writeRaw(value));
    },
    update(fn: (current: T) => T) {
      return queue.enqueue(async () => {
        const current = await readRaw();
        const next = fn(current);
        await writeRaw(next);
        return next;
      });
    },
  };
}
