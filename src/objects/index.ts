/**
 * Type checking utilities
 */
export const isObject = (item: any): item is Record<string, any> => {
    return item && typeof item === 'object' && !Array.isArray(item);
};

export const isNumeric = (any: any): boolean => !isNaN(parseFloat(any)) && isFinite(any);

/**
 * Checks if value is empty
 */
export const isEmpty = (any: any, opts: { trim?: boolean; deep?: boolean } = {}): boolean => {
    const { trim = true, deep = false } = opts;

    if (any == null) return true;

    if (typeof any === 'string') {
        return trim ? any.trim() === '' : any === '';
    }

    if (typeof any === 'object') {
        if (!Array.isArray(any)) {
            if (deep) {
                return Object.values(any).every((prop) => isEmpty(prop, opts));
            }
            any = Object.keys(any);
        }
        return !any?.length;
    }

    return any === 0;
};

/**
 * Soft merge - only merges properties that exist in base object
 */
export const softMerge = (base: Record<string, any>, values: Record<string, any>, options: { deep?: boolean } = {}): Record<string, any> => {
    const { deep = true } = options;

    return Object.keys(base).reduce((result, key) => {
        const valueExists = key in values;
        const sourceObj = valueExists ? values : base;
        const value = sourceObj[key];

        if (deep && valueExists && isObject(base[key]) && isObject(value)) {
            result[key] = softMerge(base[key], value, options);
        } else {
            result[key] = value;
        }

        return result;
    }, {} as Record<string, any>);
};

/**
 * Deep merge multiple objects
 */
export const deepMerge = (...objects: Record<string, any>[]): Record<string, any> => {
    if (objects.length < 2) {
        throw new Error('deepMerge: this function expects at least 2 objects to be provided');
    }

    return objects.reduce((prev, obj) => {
        Object.keys(obj).forEach((key) => {
            const pVal = prev[key];
            const oVal = obj[key];

            if (Array.isArray(pVal) && Array.isArray(oVal)) {
                prev[key] = pVal.concat(...oVal);
            } else if (isObject(pVal) && isObject(oVal)) {
                prev[key] = deepMerge(pVal, oVal);
            } else {
                prev[key] = oVal;
            }
        });

        return prev;
    }, {});
};

/**
 * Filter object properties
 */
export const objectFilter = <T>(
    obj: Record<string, T>,
    predicate: (value: T, key: string) => boolean
): Record<string, T> => {
    return Object.keys(obj).reduce((acc, key) => {
        if (predicate(obj[key], key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {} as Record<string, T>);
};

/**
 * Group array by keys
 */
export const groupBy = <T>(array: T[], keys: (keyof T)[]): Record<string, T[]> =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = keys.map((key) => obj[key]).join('-');
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {} as Record<string, T[]>);

/**
 * Get value by index
 */
export const valueByIndex = <T>(object: Record<string, T>, index: number): T | undefined =>
    object[Object.keys(object)[index]];

/**
 * Get index by key
 */
export const indexByKey = (object: Record<string, any>, key: string): number =>
    Object.keys(object).indexOf(key);

/**
 * Get key by value
 */
export const keyByValue = <T>(object: Record<string, T>, value: T): string | undefined =>
    Object.keys(object).find((key) => object[key] === value);

/**
 * Remove item from array once
 */
export const removeItemOnce = <T>(array: T[], value: T): T[] => {
    const index = array.indexOf(value);
    if (index > -1) {
        array.splice(index, 1);
    }
    return array;
};

/**
 * Remove empty values from object recursively
 */
export const removeUnsetValues = (
    obj: any,
    options: { removeEmpty?: boolean; emptyOptions?: { trim?: boolean; deep?: boolean } } = {}
): any => {
    const { removeEmpty = false, emptyOptions = { trim: true, deep: false } } = options;

    if (obj === null || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj
        .filter(
            (item) =>
                !(
                    item === null ||
                    item === undefined ||
                    (removeEmpty && isEmpty(item, emptyOptions))
                )
        )
        .map((item) => removeUnsetValues(item, options));
    }

    return Object.entries(obj).reduce((result: any, [key, value]) => {
        if (
            value === null ||
            value === undefined ||
            (removeEmpty && isEmpty(value, emptyOptions))
        ) {
            return result;
        }

        result[key] = removeUnsetValues(value, options);
        return result;
    }, {});
};

/**
 * Flatten object with dot notation
 */
export const flattenObject = (
    ob: Record<string, any>,
    prefix: string | false = false,
    result: Record<string, any> | null = null,
    options: { separator?: string; ignoreProperties?: string | string[] } = {}
): Record<string, any> => {
    result = result || {};
    const separator = options.separator || '.';
    const ignoreProps = options.ignoreProperties
        ? Array.isArray(options.ignoreProperties)
            ? options.ignoreProperties
            : [options.ignoreProperties]
        : [];

    if (
        prefix &&
        typeof ob === 'object' &&
        ob !== null &&
        Object.keys(ob).length === 0
    ) {
        result[prefix] = Array.isArray(ob) ? [] : {};
        return result;
    }

    const prefixStr = prefix ? prefix + separator : '';

    for (const prop in ob) {
        if (Object.prototype.hasOwnProperty.call(ob, prop)) {
            if (typeof ob[prop] === 'object' && ob[prop] !== null) {
                flattenObject(ob[prop], prefixStr + prop, result, options);
            } else {
                let propName = prop;
                let previous = prefixStr;
                if (ignoreProps.includes(prop)) {
                    propName = '';
                    previous =
                        prefixStr.substring(0, prefixStr.lastIndexOf(separator)) +
                        '' +
                        prefixStr.substring(prefixStr.lastIndexOf(separator) + 1);
                }
                result[previous + propName] = ob[prop];
            }
        }
    }
    return result;
};

/**
 * Deep equality check
 */
export const equal = (a: any, b: any): boolean => {
    if (a === b) return true;

    if (a && b && typeof a == 'object' && typeof b == 'object') {
        if (a.constructor !== b.constructor) return false;

        let length: number, i: any;
        if (Array.isArray(a)) {
            length = a.length;
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) if (!equal(a[i], b[i])) return false;
            return true;
        }

        if (a instanceof Map && b instanceof Map) {
            if (a.size !== b.size) return false;
            for (i of a.entries()) if (!b.has(i[0])) return false;
            for (i of a.entries()) if (!equal(i[1], b.get(i[0]))) return false;
            return true;
        }

        if (a instanceof Set && b instanceof Set) {
            if (a.size !== b.size) return false;
            for (i of a.entries()) if (!b.has(i[0])) return false;
            return true;
        }

        if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
            // @ts-ignore
            length = a.length;
            // @ts-ignore
            if (length != b.length) return false;
            for (i = length; i-- !== 0; ) { // @ts-ignore
                if (a[i] !== b[i]) return false;
            }
            return true;
        }

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);
        if (keysA.length != keysB.length) return false;

        for (i of keysA) if (!keysB.includes(i) || !equal(a[i], b[i])) return false;

        return true;
    }

    return a !== a && b !== b;
};