/**
 * Deep equality check
 */
interface EqualOptions {
    strict?: boolean;
    fastJSON?: boolean;
    maxDepth?: number;
    comparators?: Map<any, (a: any, b: any) => boolean>;
}

const hasOwn = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

export const equal = (a: any, b: any, options: EqualOptions = {}): boolean => {
    const { strict = true, fastJSON = false, maxDepth = 100, comparators } = options;

    return _equal(a, b, new Map(), 0, { strict, fastJSON, maxDepth, comparators });
};

const _equal = (
    a: any,
    b: any,
    cache: Map<any, Set<any>>,
    depth: number,
    options: Required<Omit<EqualOptions, 'comparators'>> & { comparators?: Map<any, (a: any, b: any) => boolean> }
): boolean => {
    if (depth > options.maxDepth) {
        throw new Error(`Maximum comparison depth of ${options.maxDepth} exceeded`);
    }

    if (a === b) return true;

    if (a == null || b == null) {
        return options.strict ? a === b : a == b;
    }

    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object') {
        return Number.isNaN(a) && Number.isNaN(b);
    }

    if (options.comparators) {
        const aConstructor = a.constructor;
        if (options.comparators.has(aConstructor)) {
            return options.comparators.get(aConstructor)!(a, b);
        }
    }

    const aTag = toString.call(a);
    const bTag = toString.call(b);
    if (aTag !== bTag) return false;

    if (cache.has(a)) {
        return cache.get(a)!.has(b);
    }
    if (cache.has(b)) {
        return cache.get(b)!.has(a);
    }

    cache.set(a, new Set([b]));
    cache.set(b, new Set([a]));

    let result: boolean;

    switch (aTag) {
        case '[object Date]':
            result = a.getTime() === b.getTime();
            break;

        case '[object RegExp]':
            result = a.source === b.source && a.flags === b.flags;
            break;

        case '[object Array]':
            result = _compareArrays(a, b, cache, depth, options);
            break;

        case '[object Map]':
            result = _compareMaps(a, b, cache, depth, options);
            break;

        case '[object Set]':
            result = _compareSets(a, b, cache, depth, options);
            break;

        case '[object ArrayBuffer]':
            result = _compareArrayBuffers(a, b);
            break;

        case '[object DataView]':
        case '[object Int8Array]':
        case '[object Uint8Array]':
        case '[object Uint8ClampedArray]':
        case '[object Int16Array]':
        case '[object Uint16Array]':
        case '[object Int32Array]':
        case '[object Uint32Array]':
        case '[object Float32Array]':
        case '[object Float64Array]':
        case '[object BigInt64Array]':
        case '[object BigUint64Array]':
            result = _compareTypedArrays(a, b);
            break;

        case '[object Object]':
            if (options.fastJSON && _isPlainObject(a) && _isPlainObject(b)) {
                try {
                    result = JSON.stringify(a) === JSON.stringify(b);
                    break;
                } catch {
                    // Fall through to regular object comparison
                }
            }
            result = _compareObjects(a, b, cache, depth, options);
            break;

        default:
            if (a.constructor !== b.constructor) {
                result = false;
                break;
            }
            result = _compareObjects(a, b, cache, depth, options);
    }

    cache.delete(a);
    cache.delete(b);

    return result;
};

const _compareArrays = (
    a: any[],
    b: any[],
    cache: Map<any, Set<any>>,
    depth: number,
    options: Required<Omit<EqualOptions, 'comparators'>> & { comparators?: Map<any, (a: any, b: any) => boolean> }
): boolean => {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (!_equal(a[i], b[i], cache, depth + 1, options)) {
            return false;
        }
    }
    return true;
};

const _compareMaps = (
    a: Map<any, any>,
    b: Map<any, any>,
    cache: Map<any, Set<any>>,
    depth: number,
    options: Required<Omit<EqualOptions, 'comparators'>> & { comparators?: Map<any, (a: any, b: any) => boolean> }
): boolean => {
    if (a.size !== b.size) return false;

    for (const [key, value] of a) {
        if (!b.has(key) || !_equal(value, b.get(key), cache, depth + 1, options)) {
            return false;
        }
    }
    return true;
};

const _compareSets = (
    a: Set<any>,
    b: Set<any>,
    cache: Map<any, Set<any>>,
    depth: number,
    options: Required<Omit<EqualOptions, 'comparators'>> & { comparators?: Map<any, (a: any, b: any) => boolean> }
): boolean => {
    if (a.size !== b.size) return false;

    for (const value of a) {
        let found = false;
        for (const bValue of b) {
            if (_equal(value, bValue, cache, depth + 1, options)) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
};

const _compareArrayBuffers = (a: ArrayBuffer, b: ArrayBuffer): boolean => {
    if (a.byteLength !== b.byteLength) return false;
    const aView = new Uint8Array(a);
    const bView = new Uint8Array(b);
    for (let i = 0; i < aView.length; i++) {
        if (aView[i] !== bView[i]) return false;
    }
    return true;
};

const _compareTypedArrays = (a: ArrayBufferView, b: ArrayBufferView): boolean => {
    if (a.byteLength !== b.byteLength) return false;
    const aView = new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
    const bView = new Uint8Array(b.buffer, b.byteOffset, b.byteLength);
    for (let i = 0; i < aView.length; i++) {
        if (aView[i] !== bView[i]) return false;
    }
    return true;
};

const _compareObjects = (
    a: Record<string, any>,
    b: Record<string, any>,
    cache: Map<any, Set<any>>,
    depth: number,
    options: Required<Omit<EqualOptions, 'comparators'>> & { comparators?: Map<any, (a: any, b: any) => boolean> }
): boolean => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!hasOwn.call(b, key) || !_equal(a[key], b[key], cache, depth + 1, options)) {
            return false;
        }
    }
    return true;
};

const _isPlainObject = (obj: any): boolean => {
    if (toString.call(obj) !== '[object Object]') return false;
    const proto = Object.getPrototypeOf(obj);
    return proto === null || proto === Object.prototype;
};