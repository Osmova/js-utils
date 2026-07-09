import {
    deepMerge,
    diff,
    clone,
    toArray,
    isArrayLike,
    isEmpty,
    pick,
    omit,
    equal,
    getByPath
} from '../../src/objects/index.js';

describe('deepMerge', () => {
    it('merges nested objects', () => {
        expect(deepMerge({ a: { x: 1 } }, { a: { y: 2 }, b: 3 }))
            .toEqual({ a: { x: 1, y: 2 }, b: 3 });
    });

    it('does not mutate its inputs (regression)', () => {
        const base = { a: { x: 1 }, list: [1] };
        const other = { a: { y: 2 }, list: [2] };
        deepMerge(base, other);
        expect(base).toEqual({ a: { x: 1 }, list: [1] });
        expect(other).toEqual({ a: { y: 2 }, list: [2] });
    });

    it('concatenates arrays without flattening nested arrays (regression)', () => {
        expect(deepMerge({ a: [[1]] }, { a: [[2]] })).toEqual({ a: [[1], [2]] });
        expect(deepMerge({ a: [1] }, { a: [2, 3] })).toEqual({ a: [1, 2, 3] });
    });

    it('throws with fewer than 2 objects', () => {
        expect(() => deepMerge({})).toThrow();
    });
});

describe('diff', () => {
    it('returns keys missing from the first object', () => {
        expect(diff({ a: 1 }, { a: 1, b: 2 })).toEqual({ b: 2 });
    });

    it('deep mode does not crash on null vs object (regression)', () => {
        expect(diff({ a: null }, { a: { b: 1 } }, { deep: true }))
            .toEqual({ a: { b: 1 } });
        expect(diff({ a: 1 }, { a: { b: 1 } }, { deep: true }))
            .toEqual({ a: { b: 1 } });
    });
});

describe('clone', () => {
    it('deep clones nested structures', () => {
        const source = { a: { b: [1, { c: 2 }] }, d: new Date(0), r: /x/g };
        const copy = clone(source);
        expect(copy).toEqual(source);
        expect(copy.a).not.toBe(source.a);
        expect(copy.a.b[1]).not.toBe(source.a.b[1]);
        expect(copy.d).not.toBe(source.d);
    });

    it('clones Map and Set', () => {
        const map = new Map([['k', { v: 1 }]]);
        const set = new Set([1, 2]);
        expect(clone(map).get('k')).toEqual({ v: 1 });
        expect([...clone(set)]).toEqual([1, 2]);
    });
});

describe('toArray', () => {
    it('converts numeric-key objects preserving order', () => {
        expect(toArray({ '1': 'b', '0': 'a', '10': 'c' })).toEqual(['a', 'b', 'c']);
    });

    it('splits delimited strings with trim and filterEmpty', () => {
        expect(toArray('a, b, , c')).toEqual(['a', 'b', 'c']);
        expect(toArray('a|b', { delimiter: '|' })).toEqual(['a', 'b']);
    });

    it('handles Set, Map, null and single values', () => {
        expect(toArray(new Set([1, 2]))).toEqual([1, 2]);
        expect(toArray(new Map([['a', 1]]))).toEqual([['a', 1]]);
        expect(toArray(null)).toEqual([]);
        expect(toArray(42)).toEqual([42]);
    });

    it('applies the map option', () => {
        expect(toArray('1,2', { map: (v) => Number(v) })).toEqual([1, 2]);
    });
});

describe('isArrayLike', () => {
    it('detects arrays and numeric-key objects', () => {
        expect(isArrayLike([1])).toBe(true);
        expect(isArrayLike({ '0': 'a' })).toBe(true);
        expect(isArrayLike({ a: 1 })).toBe(false);
        expect(isArrayLike(null)).toBe(false);
    });
});

describe('misc object utils', () => {
    it('isEmpty', () => {
        expect(isEmpty('')).toBe(true);
        expect(isEmpty('  ')).toBe(true);
        expect(isEmpty({})).toBe(true);
        expect(isEmpty([])).toBe(true);
        expect(isEmpty({ a: 1 })).toBe(false);
        expect(isEmpty(null)).toBe(true);
    });

    it('pick / omit', () => {
        expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
        expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('getByPath', () => {
        expect(getByPath({ a: { b: [10] } }, 'a.b.0')).toBe(10);
        expect(getByPath({}, 'x.y', 'fallback')).toBe('fallback');
    });

    it('equal handles cycles and structures', () => {
        const a: any = { x: 1 };
        a.self = a;
        const b: any = { x: 1 };
        b.self = b;
        expect(equal(a, b)).toBe(true);
        expect(equal({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
        expect(equal(new Map([['k', 1]]), new Map([['k', 1]]))).toBe(true);
        expect(equal({ a: 1 }, { a: 2 })).toBe(false);
    });
});
