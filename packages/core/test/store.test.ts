import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStore } from '../src/store.js';

describe('createStore', () => {
  let dir: string;
  let path: string;

  beforeEach(async () => {
    dir = await fs.mkdtemp(join(tmpdir(), 'appydave-core-store-'));
    path = join(dir, 'store.json');
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it('returns defaults when the file is absent', async () => {
    const store = createStore<{ count: number }>({ path, defaults: { count: 0 } });
    expect(await store.read()).toEqual({ count: 0 });
  });

  it('returns a fresh clone of defaults (no shared mutation)', async () => {
    const store = createStore<{ items: string[] }>({ path, defaults: { items: [] } });
    const a = await store.read();
    a.items.push('x');
    const b = await store.read();
    expect(b.items).toEqual([]);
  });

  it('writes and reads back, and the file really exists on disk', async () => {
    const store = createStore<{ count: number }>({ path, defaults: { count: 0 } });
    await store.write({ count: 42 });
    expect(await store.read()).toEqual({ count: 42 });
    const text = await fs.readFile(path, 'utf8');
    expect(JSON.parse(text)).toEqual({ count: 42 });
  });

  it('update applies a function over current state', async () => {
    const store = createStore<{ count: number }>({ path, defaults: { count: 0 } });
    const next = await store.update((c) => ({ count: c.count + 1 }));
    expect(next).toEqual({ count: 1 });
    expect(await store.read()).toEqual({ count: 1 });
  });

  it('serialises concurrent updates without lost writes', async () => {
    const store = createStore<{ count: number }>({ path, defaults: { count: 0 } });
    await Promise.all(
      Array.from({ length: 20 }, () => store.update((c) => ({ count: c.count + 1 })))
    );
    expect(await store.read()).toEqual({ count: 20 });
  });
});
