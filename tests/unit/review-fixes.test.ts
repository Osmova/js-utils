/**
 * Regression tests for the external (codex) review findings on v1.5.0
 */
import { setByPath, mapValues, invert, objectFilter, groupBy, softMerge, diff, toFormData } from '../../src/objects/index.js';
import { roundTo, formatBytes } from '../../src/numbers/index.js';
import { moveItem } from '../../src/arrays/index.js';
import { timeAgo, diffDays } from '../../src/dates/index.js';
import { waitFor } from '../../src/async/index.js';

describe('setByPath prototype-pollution guard', () => {
    it('refuses to write through __proto__', () => {
        const target = {};
        setByPath(target, '__proto__.polluted', true);
        expect(({} as any).polluted).toBeUndefined();
        expect(Object.prototype).not.toHaveProperty('polluted');
        expect(target).toEqual({});
    });

    it('refuses constructor/prototype segments (string and array paths)', () => {
        setByPath({}, 'constructor.prototype.hacked', 1);
        expect(({} as any).hacked).toBeUndefined();
        setByPath({}, ['__proto__', 'x'], 1);
        expect(({} as any).x).toBeUndefined();
    });
});

describe('mapValues / invert own-property safety', () => {
    it('mapValues writes __proto__ as an own key', () => {
        const source = JSON.parse('{"__proto__": 1, "a": 2}');
        const result = mapValues(source, v => (v as number) * 10);
        expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(true);
        expect(Object.getOwnPropertyDescriptor(result, '__proto__')!.value).toBe(10);
        expect(result.a).toBe(20);
    });

    it('invert keeps a __proto__ value as an own key', () => {
        const result = invert({ a: '__proto__' });
        expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(true);
        expect(Object.getOwnPropertyDescriptor(result, '__proto__')!.value).toBe('a');
    });
});

describe('object result writers preserve __proto__ keys', () => {
    it('objectFilter preserves a JSON-sourced __proto__ own key', () => {
        const source = JSON.parse('{"__proto__": {"x": 1}, "a": 2}');
        const result = objectFilter(source, () => true);
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(Object.getOwnPropertyDescriptor(result, '__proto__')!.value).toEqual({ x: 1 });
        expect(result.a).toBe(2);
    });

    it('groupBy groups __proto__ values without crashing', () => {
        const item = { type: '__proto__' };
        const result = groupBy([item], ['type']);
        expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
        expect(Object.getOwnPropertyDescriptor(result, '__proto__')!.value).toEqual([item]);
    });
});

describe('prototype-named input keys', () => {
    it('softMerge reads only own keys from its values object', () => {
        expect(softMerge({ toString: 'base' }, {})).toEqual({ toString: 'base' });
        expect(softMerge({ constructor: { nested: true } }, {})).toEqual({ constructor: { nested: true } });
    });

    it('diff handles objects that shadow hasOwnProperty', () => {
        expect(diff({ hasOwnProperty: 1 }, { b: 2 })).toEqual({ b: 2 });
        expect(diff(Object.create(null), { b: 2 })).toEqual({ b: 2 });
    });
});

describe('toFormData Node compatibility', () => {
    it('accepts plain objects when DOM element constructors are unavailable', () => {
        const formData = toFormData({ answer: 42 });
        expect(formData.get('answer')).toBe('42');
    });
});

describe('roundTo negative halves and bad decimals', () => {
    it('rounds negative halves away from zero, mirroring positives', () => {
        expect(roundTo(-1.005, 2)).toBe(-1.01);
        expect(roundTo(2.5)).toBe(3);
        expect(roundTo(-2.5)).toBe(-3);
    });

    it('treats non-finite decimals as 0 and truncates fractional ones', () => {
        expect(roundTo(1.6, NaN)).toBe(2);
        expect(roundTo(1.234, 1.9)).toBe(1.2);
    });
});

describe('moveItem non-integer indexes', () => {
    it('returns an unchanged copy for NaN or fractional indexes', () => {
        expect(moveItem(['a', 'b', 'c'], NaN, 0)).toEqual(['a', 'b', 'c']);
        expect(moveItem(['a', 'b', 'c'], 0, NaN)).toEqual(['a', 'b', 'c']);
        expect(moveItem(['a', 'b', 'c'], 0.5, 1)).toEqual(['a', 'b', 'c']);
    });
});

describe('formatBytes bad options and non-finite input', () => {
    it('clamps negative/non-finite decimals', () => {
        expect(formatBytes(1536, { decimals: -1 })).toBe('2 KB');
        expect(formatBytes(1536, { decimals: NaN })).toBe('1.5 KB');
    });

    it('reports non-finite input honestly instead of 0 B', () => {
        expect(formatBytes(NaN)).toBe('NaN B');
        expect(formatBytes(Infinity)).toBe('Infinity B');
    });
});

describe('timeAgo invalid dates', () => {
    it('returns empty string instead of pretending "now"', () => {
        expect(timeAgo('not-a-date')).toBe('');
        expect(timeAgo(new Date(NaN))).toBe('');
        expect(timeAgo(new Date(), { now: new Date(NaN) })).toBe('');
    });
});

describe('diffDays utc option', () => {
    it('compares UTC calendar dates when requested', () => {
        const lateNight = new Date(Date.UTC(2026, 0, 1, 23, 0));
        const earlyMorning = new Date(Date.UTC(2026, 0, 2, 1, 0));
        expect(diffDays(lateNight, earlyMorning, { utc: true })).toBe(1);
        expect(diffDays(earlyMorning, lateNight, { utc: true, absolute: true })).toBe(1);
    });
});

describe('waitFor deadline behavior', () => {
    it('checks an immediately satisfied predicate even with no wait budget', async () => {
        await expect(waitFor(() => true, { timeout: 0 })).resolves.toBeUndefined();
    });

    it('awaits an asynchronous first predicate check with no wait budget', async () => {
        await expect(waitFor(
            () => new Promise(resolve => setTimeout(() => resolve(true), 5)),
            { timeout: 0 }
        )).resolves.toBeUndefined();
    });

    it('checks once more after the final clamped polling delay', async () => {
        let ready = false;
        setTimeout(() => { ready = true; }, 10);
        await expect(waitFor(() => ready, { interval: 200, timeout: 50 })).resolves.toBeUndefined();
    });

    it('allows an infinite timeout without scheduling an immediate timer', async () => {
        await expect(waitFor(
            () => new Promise(resolve => setTimeout(() => resolve(true), 5)),
            { timeout: Infinity }
        )).resolves.toBeUndefined();
    });

    it('polls on later ticks when interval is zero', async () => {
        let ready = false;
        setTimeout(() => { ready = true; }, 10);
        await expect(waitFor(() => ready, { interval: 0, timeout: 50 })).resolves.toBeUndefined();
    });

    it('allows a large finite timeout without a timer overflow', async () => {
        await expect(waitFor(
            () => new Promise(resolve => setTimeout(() => resolve(true), 5)),
            { timeout: Number.MAX_SAFE_INTEGER }
        )).resolves.toBeUndefined();
    });

    it('still times out when the predicate never settles', async () => {
        const hang = (): Promise<boolean> => new Promise(() => undefined);
        await expect(waitFor(hang, { timeout: 30, timeoutMessage: 'hung' }))
            .rejects.toThrow('hung');
    });
});
