import { partition, zip, toggleItem, moveItem } from '../../src/arrays/index.js';
import { setByPath, mapValues, invert, getByPath } from '../../src/objects/index.js';
import { roundTo, formatBytes } from '../../src/numbers/index.js';
import { diffDays, timeAgo } from '../../src/dates/index.js';
import { deferred, waitFor, sleep } from '../../src/async/index.js';
import { safeJsonParse } from '../../src/strings/index.js';
import { copyToClipboard, blobToDataUrl, dataUrlToBlob } from '../../src/browser/index.js';
import { memoize } from '../../src/functions/index.js';

describe('arrays: partition / zip / toggleItem / moveItem', () => {
    it('partition splits by predicate in one pass', () => {
        expect(partition([1, 2, 3, 4], n => n % 2 === 0)).toEqual([[2, 4], [1, 3]]);
        expect(partition([], () => true)).toEqual([[], []]);
    });

    it('zip pairs up to the shorter array', () => {
        expect(zip(['a', 'b'], [1, 2, 3])).toEqual([['a', 1], ['b', 2]]);
        expect(zip([], [1])).toEqual([]);
    });

    it('toggleItem adds or removes immutably', () => {
        const source = [1, 2];
        expect(toggleItem(source, 3)).toEqual([1, 2, 3]);
        expect(toggleItem(source, 2)).toEqual([1]);
        expect(source).toEqual([1, 2]);
    });

    it('toggleItem supports a custom comparator', () => {
        const users = [{ id: 1 }, { id: 2 }];
        const byId = { comparator: (a: { id: number }, b: { id: number }) => a.id === b.id };
        expect(toggleItem(users, { id: 2 }, byId)).toEqual([{ id: 1 }]);
        expect(toggleItem(users, { id: 3 }, byId)).toHaveLength(3);
    });

    it('moveItem reorders immutably and clamps targets', () => {
        const source = ['a', 'b', 'c'];
        expect(moveItem(source, 0, 2)).toEqual(['b', 'c', 'a']);
        expect(moveItem(source, 2, 0)).toEqual(['c', 'a', 'b']);
        expect(moveItem(source, 0, 99)).toEqual(['b', 'c', 'a']);
        expect(moveItem(source, 99, 0)).toEqual(['a', 'b', 'c']);
        expect(source).toEqual(['a', 'b', 'c']);
    });
});

describe('objects: setByPath / mapValues / invert', () => {
    it('setByPath creates intermediate objects and arrays', () => {
        expect(setByPath({}, 'a.b.c', 1)).toEqual({ a: { b: { c: 1 } } });
        expect(setByPath({}, 'list.0', 'x')).toEqual({ list: ['x'] });
        expect(setByPath({ a: { keep: 1 } }, 'a.b', 2)).toEqual({ a: { keep: 1, b: 2 } });
    });

    it('setByPath round-trips with getByPath and honors separator option', () => {
        const obj = setByPath({}, 'x/y', 5, { separator: '/' });
        expect(getByPath(obj, 'x.y')).toBe(5);
    });

    it('mapValues keeps keys, maps values', () => {
        expect(mapValues({ a: 1, b: 2 }, v => v * 10)).toEqual({ a: 10, b: 20 });
        expect(mapValues({ a: 1 }, (_v, k) => k)).toEqual({ a: 'a' });
    });

    it('invert swaps keys and values', () => {
        expect(invert({ a: 1, b: 2 })).toEqual({ '1': 'a', '2': 'b' });
    });
});

describe('numbers: roundTo / formatBytes', () => {
    it('roundTo rounds to fixed decimals as a number', () => {
        expect(roundTo(1.005, 2)).toBe(1.01);
        expect(roundTo(1234.5678, 1)).toBe(1234.6);
        expect(roundTo(5.5)).toBe(6);
    });

    it('formatBytes formats decimal and binary units', () => {
        expect(formatBytes(0)).toBe('0 B');
        expect(formatBytes(999)).toBe('999 B');
        expect(formatBytes(1536)).toBe('1.5 KB');
        expect(formatBytes(1536, { binary: true })).toBe('1.5 KiB');
        expect(formatBytes(1_500_000)).toBe('1.5 MB');
        expect(formatBytes(1234567, { decimals: 2 })).toBe('1.23 MB');
    });
});

describe('dates: diffDays / timeAgo', () => {
    it('diffDays returns signed calendar-day differences', () => {
        expect(diffDays(new Date(2026, 0, 1), new Date(2026, 0, 8))).toBe(7);
        expect(diffDays(new Date(2026, 0, 8), new Date(2026, 0, 1))).toBe(-7);
        expect(diffDays(new Date(2026, 0, 8), new Date(2026, 0, 1), { absolute: true })).toBe(7);
        expect(diffDays(new Date(2026, 0, 1, 23, 59), new Date(2026, 0, 2, 0, 1))).toBe(1);
    });

    it('timeAgo formats relative time via Intl', () => {
        const now = new Date('2026-07-10T12:00:00Z');
        expect(timeAgo(new Date('2026-07-10T11:57:00Z'), { locale: 'en-US', now })).toBe('3 minutes ago');
        expect(timeAgo(new Date('2026-07-11T12:00:00Z'), { locale: 'en-US', now })).toBe('tomorrow');
        expect(timeAgo(new Date('2026-07-10T11:57:00Z'), { now })).toBe('il y a 3 minutes');
    });
});

describe('async: deferred / waitFor', () => {
    it('deferred resolves externally', async () => {
        const d = deferred<number>();
        setTimeout(() => d.resolve(42), 5);
        await expect(d.promise).resolves.toBe(42);
    });

    it('deferred rejects externally', async () => {
        const d = deferred();
        d.reject(new Error('nope'));
        await expect(d.promise).rejects.toThrow('nope');
    });

    it('waitFor resolves once the predicate turns true', async () => {
        let ready = false;
        setTimeout(() => { ready = true; }, 20);
        await waitFor(() => ready, { interval: 5, timeout: 500 });
        expect(ready).toBe(true);
    });

    it('waitFor rejects on timeout', async () => {
        await expect(waitFor(() => false, { interval: 5, timeout: 30 }))
            .rejects.toThrow('condition not met');
    });

    it('waitFor supports async predicates', async () => {
        let calls = 0;
        await waitFor(async () => {
            await sleep(1);
            return ++calls >= 3;
        }, { interval: 1, timeout: 500 });
        expect(calls).toBe(3);
    });
});

describe('strings: safeJsonParse', () => {
    it('parses valid JSON and falls back on garbage', () => {
        expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
        expect(safeJsonParse('{oops')).toBeNull();
        expect(safeJsonParse('{oops', [])).toEqual([]);
    });

    it('passes the reviver through', () => {
        const parsed = safeJsonParse<{ n: number }>('{"n":1}', null, {
            reviver: (_k, v) => (typeof v === 'number' ? v * 2 : v)
        });
        expect(parsed).toEqual({ n: 2 });
    });
});

describe('browser: copyToClipboard / blobToDataUrl', () => {
    it('copyToClipboard returns false outside the browser', async () => {
        await expect(copyToClipboard('x')).resolves.toBe(false);
    });

    it('blobToDataUrl round-trips with dataUrlToBlob', async () => {
        const dataUrl = await blobToDataUrl(new Blob(['hi'], { type: 'text/plain' }));
        expect(dataUrl).toBe('data:text/plain;base64,aGk=');
        const back = dataUrlToBlob(dataUrl);
        expect(back).not.toBeNull();
        expect(await back!.text()).toBe('hi');
    });
});

describe('memoize options object', () => {
    it('accepts { resolver } as well as a bare resolver function', () => {
        const fn = jest.fn((o: { id: number; v: number }) => o.v);
        const memo = memoize(fn, { resolver: (o) => String(o.id) });
        expect(memo({ id: 1, v: 10 })).toBe(10);
        expect(memo({ id: 1, v: 99 })).toBe(10);
        expect(fn).toHaveBeenCalledTimes(1);

        const bare = memoize(fn, (o) => String(o.id));
        expect(bare({ id: 2, v: 20 })).toBe(20);
    });
});
