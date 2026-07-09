import { genUuid, throttle, debounce, once, memoize } from '../../src/functions/index.js';
import { lightenColor, darkenColor, hexToRgb, rgbToHex } from '../../src/colors/index.js';
import { addDays, isSameDay, startOfDay, endOfDay, parseDate } from '../../src/dates/index.js';
import { intersection, difference, chunk, uniq, range } from '../../src/arrays/index.js';
import { parseBool } from '../../src/validation/index.js';

describe('genUuid', () => {
    it('generates valid v4 UUIDs', () => {
        expect(genUuid()).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        );
    });

    it('generates well-formed v1 UUIDs (regression: >>>32 truncation)', () => {
        const uuid = genUuid({ version: 1 });
        expect(uuid).toMatch(
            /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
        );
        // timeMid carries the timestamp's high bits: floor(now / 2^32) & 0xffff
        const timeMid = parseInt(uuid.split('-')[1], 16);
        expect(timeMid).toBe(Math.floor(Date.now() / 2 ** 32) & 0xffff);
    });
});

describe('throttle', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('invokes on trailing edge when leading is disabled (regression)', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100, { leading: false });
        throttled();
        expect(fn).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('limits call frequency with leading default', () => {
        const fn = jest.fn();
        const throttled = throttle(fn, 100);
        throttled();
        throttled();
        throttled();
        expect(fn).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(100);
        throttled();
        expect(fn).toHaveBeenCalledTimes(2);
    });
});

describe('debounce', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('collapses rapid calls into one', () => {
        const fn = jest.fn();
        const debounced = debounce(fn, 100);
        debounced();
        debounced();
        debounced();
        expect(fn).not.toHaveBeenCalled();
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('immediate mode fires on the leading edge only', () => {
        const fn = jest.fn();
        const debounced = debounce(fn, 100, { immediate: true });
        debounced();
        debounced();
        expect(fn).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(100);
        expect(fn).toHaveBeenCalledTimes(1);
    });
});

describe('once / memoize', () => {
    it('once executes a single time', () => {
        const fn = jest.fn(() => 42);
        const wrapped = once(fn);
        expect(wrapped()).toBe(42);
        expect(wrapped()).toBe(42);
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('memoize caches by arguments', () => {
        const fn = jest.fn((n: number) => n * n);
        const memo = memoize(fn);
        expect(memo(4)).toBe(16);
        expect(memo(4)).toBe(16);
        expect(memo(5)).toBe(25);
        expect(fn).toHaveBeenCalledTimes(2);
    });
});

describe('colors', () => {
    it('lighten/darken produce bounded 6-digit hex', () => {
        expect(lightenColor('#000000', 100)).toBe('#FFFFFF');
        expect(darkenColor('#FFFFFF', 100)).toBe('#000000');
        expect(lightenColor('#207dd3', 0)).toBe('#207DD3');
    });

    it('drops the alpha channel of 8-digit hex instead of corrupting channels (regression)', () => {
        expect(lightenColor('#11223344', 0)).toBe('#112233');
        expect(hexToRgb('#FF000080')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('hexToRgb / rgbToHex round-trip', () => {
        expect(hexToRgb('#207DD3')).toEqual({ r: 32, g: 125, b: 211 });
        expect(rgbToHex(32, 125, 211)).toBe('#207DD3');
        expect(rgbToHex(300, -5, 0)).toBe('#FF0000');
    });
});

describe('dates', () => {
    it('addDays and isSameDay', () => {
        const d = new Date(2026, 0, 31, 12, 0, 0);
        expect(addDays(d, 1).getDate()).toBe(1);
        expect(addDays(d, 1).getMonth()).toBe(1);
        expect(isSameDay(new Date(2026, 0, 1, 0, 1), new Date(2026, 0, 1, 23, 59))).toBe(true);
        expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
    });

    it('startOfDay / endOfDay', () => {
        const d = new Date(2026, 5, 15, 13, 37, 42, 123);
        const start = startOfDay(d);
        const end = endOfDay(d);
        expect([start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds()])
            .toEqual([0, 0, 0, 0]);
        expect([end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()])
            .toEqual([23, 59, 59, 999]);
        expect(startOfDay(d, { utc: true }).getUTCHours()).toBe(0);
    });

    it('parseDate falls back to the default on invalid input', () => {
        const fallback = new Date(0);
        expect(parseDate('not-a-date', fallback)).toBe(fallback);
        expect(parseDate('2026-01-01').getUTCFullYear()).toBe(2026);
    });
});

describe('arrays', () => {
    it('intersection / difference', () => {
        expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]);
        expect(difference([1, 2, 3], [2, 3, 4])).toEqual([1]);
    });

    it('chunk / uniq / range', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(uniq([1, 1, 2])).toEqual([1, 2]);
        expect(range(1, 5)).toEqual([1, 2, 3, 4]);
        expect(range(5, 0, -2)).toEqual([5, 3, 1]);
    });
});

describe('parseBool', () => {
    it('parses common representations', () => {
        expect(parseBool(1)).toBe(true);
        expect(parseBool('0')).toBe(false);
        expect(parseBool('true')).toBe(true);
        expect(parseBool(null)).toBe(false);
        expect(parseBool('anything')).toBe(true);
    });
});
