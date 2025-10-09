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
export const softMerge = (
    base: Record<string, any>,
    values: Record<string, any>,
    options: { deep?: boolean } = {}
): Record<string, any> => {
    const { deep = true } = options;
    const result: Record<string, any> = {};

    for (const key of Object.keys(base)) {
        const baseValue = base[key];
        const hasValueKey = key in values;

        if (deep && hasValueKey && isObject(baseValue) && isObject(values[key])) {
            result[key] = softMerge(baseValue, values[key], options);
        } else {
            result[key] = hasValueKey ? values[key] : baseValue;
        }
    }

    return result;
};

/**
 * Deep merge multiple objects
 */
export const deepMerge = (...objects: Record<string, any>[]): Record<string, any> => {
    if (objects.length < 2) {
        throw new Error('deepMerge: this function expects at least 2 objects to be provided');
    }

    let result = objects[0];

    for (let i = 1; i < objects.length; i++) {
        const obj = objects[i];

        for (const key of Object.keys(obj)) {
            const prevValue = result[key];
            const currentValue = obj[key];

            if (Array.isArray(prevValue) && Array.isArray(currentValue)) {
                result[key] = prevValue.concat(...currentValue);
            } else if (isObject(prevValue) && isObject(currentValue)) {
                result[key] = deepMerge(prevValue, currentValue);
            } else {
                result[key] = currentValue;
            }
        }
    }

    return result;
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
    
    // Handle special object types that should not be processed recursively
    if (
        obj instanceof File ||
        obj instanceof Blob ||
        obj instanceof Date ||
        obj instanceof RegExp ||
        obj instanceof ArrayBuffer ||
        obj instanceof DataView ||
        obj instanceof Map ||
        obj instanceof Set ||
        obj instanceof WeakMap ||
        obj instanceof WeakSet ||
        obj instanceof Error ||
        // Handle typed arrays
        obj instanceof Int8Array ||
        obj instanceof Uint8Array ||
        obj instanceof Uint8ClampedArray ||
        obj instanceof Int16Array ||
        obj instanceof Uint16Array ||
        obj instanceof Int32Array ||
        obj instanceof Uint32Array ||
        obj instanceof Float32Array ||
        obj instanceof Float64Array ||
        obj instanceof BigInt64Array ||
        obj instanceof BigUint64Array
    ) {
        return obj;
    }

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
 * Converts object to FormData with nested support
 */
export const objectToFormData = (
    obj: Record<string, any>,
    params: {
        formData?: FormData;
        namespace?: string;
        ignoreFields?: string[];
        ignoreNullUndefined?: boolean;
    } = {}
): FormData => {
    const {
        formData = new FormData(),
        namespace = '',
        ignoreFields = [],
        ignoreNullUndefined = true
    } = params;

    for (let property in obj) {
        if (obj.hasOwnProperty(property) && !ignoreFields.includes(property)) {
            let field = namespace ? `${namespace}[${property}]` : property;
            let data = obj[property];

            if (data == null) {
                if (!ignoreNullUndefined) {
                    formData.append(field, '');
                }
            } else if (typeof data === 'object' && !(data instanceof File)) {
                objectToFormData(data, { ...params, formData, namespace: field });
            } else {
                formData.append(field, data);
            }
        }
    }

    return formData;
};

/**
 * Get difference between two objects
 */
export const diff = (
    obj1: Record<string, any>,
    obj2: Record<string, any>,
    opts: { deep?: boolean } = {}
): Record<string, any> => {
    const { deep = false } = opts;
    const result: Record<string, any> = {};

    for (const key in obj2) {
        if (!deep) {
            if (!obj1.hasOwnProperty(key)) {
                result[key] = obj2[key];
            }
        } else {
            if (!obj1.hasOwnProperty(key)) {
                result[key] = obj2[key];
            } else if (typeof obj2[key] === 'object' && obj2[key] !== null) {
                const nestedDiff = diff(obj1[key], obj2[key], { deep: true });
                if (Object.keys(nestedDiff).length > 0) {
                    result[key] = nestedDiff;
                }
            }
        }
    }

    return result;
};

/**
 * Clone function with support for various object types
 * @param obj - The object to clone
 * @param options - Clone options
 * @returns Cloned object
 */
export const clone = (obj: any, options: { deep?: boolean } = {}): any => {
    const { deep = true } = options;

    // Handle primitives and null/undefined
    if (obj === null || obj === undefined || typeof obj !== 'object') {
        return obj;
    }

    // Handle built-in types
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
    if (obj instanceof File) {
        const newFile = new File([obj], obj.name, {
            type: obj.type,
            lastModified: obj.lastModified
        });

        // Copy any additional custom properties
        const descriptors = Object.getOwnPropertyDescriptors(obj);
        for (const key of Object.getOwnPropertyNames(obj)) {
            if (!['name', 'size', 'type', 'lastModified', 'lastModifiedDate', 'webkitRelativePath'].includes(key)) {
                const descriptor = descriptors[key];
                if (descriptor && descriptor.configurable !== false) {
                    try {
                        Object.defineProperty(newFile, key, {
                            ...descriptor,
                            value: deep ? clone(descriptor.value, options) : descriptor.value
                        });
                    } catch (e) {
                        // Fallback for non-configurable properties
                        // @ts-ignore
                        (newFile as any)[key] = deep ? clone(obj[key], options) : obj[key];
                    }
                }
            }
        }

        return newFile;
    }
    if (obj instanceof Blob) return new Blob([obj], { type: obj.type });
    if (obj instanceof ArrayBuffer) return obj.slice(0);

    // Handle typed arrays
    if (obj instanceof Int8Array) return new Int8Array(obj);
    if (obj instanceof Uint8Array) return new Uint8Array(obj);
    if (obj instanceof Uint8ClampedArray) return new Uint8ClampedArray(obj);
    if (obj instanceof Int16Array) return new Int16Array(obj);
    if (obj instanceof Uint16Array) return new Uint16Array(obj);
    if (obj instanceof Int32Array) return new Int32Array(obj);
    if (obj instanceof Uint32Array) return new Uint32Array(obj);
    if (obj instanceof Float32Array) return new Float32Array(obj);
    if (obj instanceof Float64Array) return new Float64Array(obj);

    // Handle Map
    if (obj instanceof Map) {
        const clonedMap = new Map();
        obj.forEach((value, key) => {
            clonedMap.set(
                deep ? clone(key, options) : key,
                deep ? clone(value, options) : value
            );
        });
        return clonedMap;
    }

    // Handle Set
    if (obj instanceof Set) {
        const clonedSet = new Set();
        obj.forEach(value => {
            clonedSet.add(deep ? clone(value, options) : value);
        });
        return clonedSet;
    }

    // Handle WeakMap and WeakSet
    if (obj instanceof WeakMap) return new WeakMap();
    if (obj instanceof WeakSet) return new WeakSet();

    // Handle functions
    if (typeof obj === 'function') return obj;

    // Handle arrays
    if (Array.isArray(obj)) {
        return deep ? obj.map(item => clone(item, options)) : [...obj];
    }

    // Handle Error objects
    if (obj instanceof Error) {
        const clonedError = new (obj.constructor as any)(obj.message);
        clonedError.name = obj.name;
        clonedError.stack = obj.stack;
        return clonedError;
    }

    // Handle plain objects and other object types
    const clonedObj: any = Object.create(Object.getPrototypeOf(obj));

    // Get all property descriptors (enumerable and non-enumerable)
    const descriptors = Object.getOwnPropertyDescriptors(obj);

    for (const key of Object.getOwnPropertyNames(obj)) {
        const descriptor = descriptors[key];

        if (!descriptor) continue;

        // Handle data properties
        if ('value' in descriptor) {
            Object.defineProperty(clonedObj, key, {
                ...descriptor,
                value: deep ? clone(descriptor.value, options) : descriptor.value
            });
        }
        // Handle accessor properties (getters/setters)
        else if (descriptor.get || descriptor.set) {
            Object.defineProperty(clonedObj, key, {
                ...descriptor,
                get: descriptor.get,
                set: descriptor.set
            });
        }
    }

    // Handle symbol properties
    const symbols = Object.getOwnPropertySymbols(obj);
    for (const symbol of symbols) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, symbol);
        if (descriptor) {
            if ('value' in descriptor) {
                Object.defineProperty(clonedObj, symbol, {
                    ...descriptor,
                    value: deep ? clone(descriptor.value, options) : descriptor.value
                });
            } else {
                Object.defineProperty(clonedObj, symbol, descriptor);
            }
        }
    }

    return clonedObj;
};

/**
 * Deep clone with File support
 * @deprecated Use clone() function with deep: true option instead
 */
export const deepClone = (obj: any): any => {
    return clone(obj, { deep: true });
};

/**
 * Flatten object with dot notation
 */
export const flattenObject = (
    ob: Record<string, any>,
    prefix: string = '',
    result: Record<string, any> = {},
    options: { separator?: string; ignoreProperties?: string[] } = {}
): Record<string, any> => {
    const separator = options.separator || '.';
    const ignorePropsSet = new Set(options.ignoreProperties || []);

    if (prefix && typeof ob === 'object' && ob !== null) {
        const keys = Object.keys(ob);
        if (keys.length === 0) {
            result[prefix] = Array.isArray(ob) ? [] : {};
            return result;
        }
    }

    for (const key of Object.keys(ob)) {
        const value = ob[key];
        const newKey = prefix ? `${prefix}${separator}${key}` : key;

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, newKey, result, options);
        } else {
            if (!ignorePropsSet.has(key)) {
                result[newKey] = value;
            }
        }
    }

    return result;
};

/**
 * Gets nested object value by path
 */
export const getByPath = <T = any>(
    obj: Record<string, any>,
    path: string | string[],
    defaultValue?: T
): T | undefined => {
    if (!obj || typeof obj !== 'object') return defaultValue;

    const keys = Array.isArray(path) ? path : path.split('.');
    let result: any = obj;

    for (const key of keys) {
        if (result == null || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }

    return result !== undefined ? (result as T) : defaultValue;
};

/**
 * Check if a variable or nested object property exists and is defined
 * @param target - The variable or path to check
 * @param options - Configuration options
 * @returns boolean - true if the variable exists and is defined
 */
export const isset = (
    target: any,
    options: { strict?: boolean; context?: any } = {}
): boolean => {
    const { strict = true, context } = options;

    if (typeof target === 'string' && context) {
        if (!context || typeof context !== 'object') {
            return false;
        }

        const keys = target.split('.');
        let current = context;

        for (const key of keys) {
            if (current == null || typeof current !== 'object' || !(key in current)) {
                return false;
            }
            current = current[key];
        }

        return strict ? current !== undefined : current !== undefined && current !== null;
    }

    return strict ? target !== undefined : target !== undefined && target !== null;
};


/**
 * Converts various inputs to FormData with advanced options
 * Supports objects, DOM form elements, and JSON strings
 */
export const toFormData = (
    input: Record<string, any> | HTMLFormElement | string,
    options: {
        ignoreFields?: string[];
        ignoreUnset?: boolean;
        ignoreEmpty?: boolean;
        serializeBooleans?: boolean;
        namespace?: string;
        formData?: FormData;
    } = {}
): FormData => {
    const {
        ignoreFields = [],
        ignoreUnset = true,
        ignoreEmpty = false,
        serializeBooleans = false,
        namespace = '',
        formData = new FormData()
    } = options;

    let processedInput: Record<string, any>;

    if (typeof input === 'string') {
        try {
            processedInput = JSON.parse(input);
        } catch (error) {
            throw new Error('Invalid JSON string provided to toFormData');
        }
    } else if (input instanceof HTMLFormElement) {
        const formDataObj = new FormData(input);
        processedInput = {};

        // @ts-ignore
        for (const [key, value] of formDataObj.entries()) {
            if (processedInput[key]) {
                if (Array.isArray(processedInput[key])) {
                    processedInput[key].push(value);
                } else {
                    processedInput[key] = [processedInput[key], value];
                }
            } else {
                processedInput[key] = value;
            }
        }
    } else if (typeof input === 'object' && input !== null) {
        processedInput = input;
    } else {
        throw new Error('Input must be an object, HTMLFormElement, or JSON string');
    }

    if (ignoreUnset || ignoreEmpty) {
        processedInput = removeUnsetValues(processedInput, {
            removeEmpty: ignoreEmpty,
            emptyOptions: { trim: true, deep: true }
        });
    }

    const processObject = (obj: Record<string, any>, currentNamespace: string = namespace) => {
        for (const property in obj) {
            if (!obj.hasOwnProperty(property) || ignoreFields.includes(property)) {
                continue;
            }

            const fieldName = currentNamespace ? `${currentNamespace}[${property}]` : property;
            const value = obj[property];

            if (value == null) {
                if (!ignoreUnset) {
                    formData.append(fieldName, '');
                }
            } else if (value instanceof File || value instanceof Blob) {
                formData.append(fieldName, value);
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const arrayFieldName = `${fieldName}[${index}]`;
                    if (item instanceof File || item instanceof Blob) {
                        formData.append(arrayFieldName, item);
                    } else if (typeof item === 'object' && item !== null) {
                        processObject({ [index]: item }, fieldName);
                    } else {
                        const serializedItem = serializeBooleans && typeof item === 'boolean'
                            ? (item ? '1' : '0')
                            : String(item);
                        formData.append(arrayFieldName, serializedItem);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                processObject(value, fieldName);
            } else {
                const serializedValue = serializeBooleans && typeof value === 'boolean'
                    ? (value ? '1' : '0')
                    : String(value);
                formData.append(fieldName, serializedValue);
            }
        }
    };

    processObject(processedInput);
    return formData;
};

export { equal } from './equal.js';