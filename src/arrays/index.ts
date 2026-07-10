/**
 * Split array into chunks of specified size
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * chunk(['a', 'b', 'c', 'd'], 3) // [['a', 'b', 'c'], ['d']]
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
    if (size <= 0) return [];

    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
};

/**
 * Remove duplicate values from array
 * @param array - Array with potential duplicates
 * @returns Array with unique values
 *
 * @example
 * uniq([1, 2, 2, 3, 3, 4]) // [1, 2, 3, 4]
 * uniq(['a', 'b', 'a', 'c']) // ['a', 'b', 'c']
 */
export const uniq = <T>(array: T[]): T[] => {
    return [...new Set(array)];
};

/**
 * Alias for uniq - remove duplicate values
 * @param array - Array with potential duplicates
 * @returns Array with unique values
 */
export const unique = uniq;

/**
 * Remove falsy values from array
 * @param array - Array with potential falsy values
 * @returns Array without falsy values
 *
 * @example
 * compact([0, 1, false, 2, '', 3, null, undefined, NaN]) // [1, 2, 3]
 * compact(['a', '', 'b', null, 'c']) // ['a', 'b', 'c']
 */
export const compact = <T>(array: (T | null | undefined | false | 0 | '')[]): T[] => {
    return array.filter(Boolean) as T[];
};

/**
 * Sort array of objects by property or custom function
 * @param array - Array to sort
 * @param iteratee - Property name or function to get sort value
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 *
 * @example
 * sortBy([{ age: 30 }, { age: 20 }], 'age') // [{ age: 20 }, { age: 30 }]
 * sortBy([{ age: 30 }, { age: 20 }], 'age', 'desc') // [{ age: 30 }, { age: 20 }]
 * sortBy([{ name: 'John' }], (x) => x.name.length) // Sort by name length
 */
export const sortBy = <T>(
    array: T[],
    iteratee: keyof T | ((item: T) => any),
    order: 'asc' | 'desc' = 'asc'
): T[] => {
    const getValue = typeof iteratee === 'function'
        ? iteratee
        : (item: T) => item[iteratee];

    return [...array].sort((a, b) => {
        const aVal = getValue(a);
        const bVal = getValue(b);

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
    });
};

/**
 * Create array of numbers from start to end
 * @param start - Start value (or end if only one arg)
 * @param end - End value (exclusive)
 * @param step - Step increment
 * @returns Array of numbers
 *
 * @example
 * range(5) // [0, 1, 2, 3, 4]
 * range(1, 5) // [1, 2, 3, 4]
 * range(0, 10, 2) // [0, 2, 4, 6, 8]
 * range(5, 0, -1) // [5, 4, 3, 2, 1]
 */
export const range = (start: number, end?: number, step: number = 1): number[] => {
    if (end === undefined) {
        end = start;
        start = 0;
    }

    if (step === 0) return [];

    const result: number[] = [];
    const shouldIncrement = start < end;

    if (shouldIncrement && step < 0) return [];
    if (!shouldIncrement && step > 0) return [];

    for (let i = start; shouldIncrement ? i < end : i > end; i += step) {
        result.push(i);
    }

    return result;
};

/**
 * Values present in both arrays
 * @example
 * intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 */
export const intersection = <T>(array: T[], other: T[]): T[] => {
    const set = new Set(other);
    return array.filter(item => set.has(item));
};

/**
 * Values of the first array not present in the second
 * @example
 * difference([1, 2, 3], [2, 3, 4]) // [1]
 */
export const difference = <T>(array: T[], other: T[]): T[] => {
    const set = new Set(other);
    return array.filter(item => !set.has(item));
};

/**
 * Split array into two groups in a single pass
 * @returns Tuple of [items matching predicate, items not matching]
 * @example
 * partition([1, 2, 3, 4], n => n % 2 === 0) // [[2, 4], [1, 3]]
 */
export const partition = <T>(
    array: T[],
    predicate: (item: T, index: number) => boolean
): [T[], T[]] => {
    const pass: T[] = [];
    const fail: T[] = [];
    array.forEach((item, index) => (predicate(item, index) ? pass : fail).push(item));
    return [pass, fail];
};

/**
 * Pair up two arrays index by index (stops at the shorter one)
 * @example
 * zip(['a', 'b'], [1, 2, 3]) // [['a', 1], ['b', 2]]
 */
export const zip = <A, B>(a: A[], b: B[]): [A, B][] => {
    const length = Math.min(a.length, b.length);
    const result: [A, B][] = new Array(length);
    for (let i = 0; i < length; i++) {
        result[i] = [a[i], b[i]];
    }
    return result;
};

/**
 * Add the item if absent, remove it if present (immutable)
 * Handy for toggling selections in UI state
 * @param options.comparator - Custom equality (defaults to strict ===), e.g. compare objects by id
 * @example
 * toggleItem([1, 2], 3) // [1, 2, 3]
 * toggleItem([1, 2, 3], 3) // [1, 2]
 * toggleItem(users, user, { comparator: (a, b) => a.id === b.id })
 */
export const toggleItem = <T>(
    array: T[],
    item: T,
    options: { comparator?: (a: T, b: T) => boolean } = {}
): T[] => {
    const { comparator = (a: T, b: T): boolean => a === b } = options;
    return array.some(existing => comparator(existing, item))
        ? array.filter(existing => !comparator(existing, item))
        : [...array, item];
};

/**
 * Move an item to another position (immutable)
 * Out-of-range `from` returns a copy unchanged; `to` is clamped
 * @example
 * moveItem(['a', 'b', 'c'], 0, 2) // ['b', 'c', 'a']
 */
export const moveItem = <T>(array: T[], from: number, to: number): T[] => {
    const result = [...array];
    if (from < 0 || from >= result.length) return result;
    const [item] = result.splice(from, 1);
    result.splice(Math.max(0, Math.min(result.length, to)), 0, item);
    return result;
};
