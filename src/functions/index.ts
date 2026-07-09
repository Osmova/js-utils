/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    options: { immediate?: boolean } = {}
): (...args: Parameters<T>) => void => {
    const { immediate = false } = options;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;

    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        const later = () => {
            debounceTimer = undefined;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !debounceTimer;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(later, delay);

        if (callNow) {
            func.apply(context, args);
        }
    };
};

/**
 * Load external script dynamically (browser only)
 */
export const loadExternalScript = (
    src: string,
    opts: { id?: string; async?: boolean } = {}
): Promise<void> => {
    const { id, async = true } = opts;
    
    if (typeof document === 'undefined') {
        return Promise.reject(new Error('loadExternalScript is only available in browser environments'));
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = async;
        script.onload = () => resolve();
        script.onerror = reject;

        if (id) {
            script.id = id;
        }

        document.body.appendChild(script);
    });
};

/**
 * Generate UUID with version support
 */
export const genUuid = (options: { version?: 1 | 4 } = {}): string => {
    const { version = 4 } = options;
    
    if (version === 4) {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const random = (Math.random() * 16) | 0;
            const value = char === 'x' ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    }
    
    if (version === 1) {
        const timestamp = Date.now();
        const clockSeq = Math.floor(Math.random() * 0x4000);
        const node = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));

        // Bitwise shifts (>>>) truncate to 32 bits in JS, so the high bits
        // must be extracted with arithmetic division instead
        const timeLow = (timestamp % 2 ** 32).toString(16).padStart(8, '0');
        const timeHighBits = Math.floor(timestamp / 2 ** 32);
        const timeMid = (timeHighBits & 0xffff).toString(16).padStart(4, '0');
        const timeHigh = (((timeHighBits >>> 16) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
        const clockSeqHigh = ((clockSeq >>> 8) | 0x80).toString(16).padStart(2, '0');
        const clockSeqLow = (clockSeq & 0xff).toString(16).padStart(2, '0');
        const nodeHex = node.map(n => n.toString(16).padStart(2, '0')).join('');
        
        return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHigh}${clockSeqLow}-${nodeHex}`;
    }
    
    throw new Error(`Unsupported UUID version: ${version}`);
};

/**
 * Throttle function execution to limit frequency
 * Executes immediately on first call, then limits subsequent calls
 * @param func - Function to throttle
 * @param delay - Minimum time between executions in milliseconds
 * @param options - Throttle options. `trailing` defaults to `!leading`, so
 * `{ leading: false }` flushes calls on the trailing edge. Passing both
 * `leading: false` and `trailing: false` disables the function entirely.
 * @returns Throttled function
 *
 * @example
 * const throttledScroll = throttle(() => console.log('Scrolling'), 1000);
 * window.addEventListener('scroll', throttledScroll);
 *
 * const throttledResize = throttle(handleResize, 500, { trailing: true });
 * window.addEventListener('resize', throttledResize);
 */
export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    options: { leading?: boolean; trailing?: boolean } = {}
): ((...args: Parameters<T>) => void) => {
    const { leading = true } = options;
    // With leading disabled, calls must be flushed on the trailing edge or
    // the throttled function would never run at all
    const trailing = options.trailing ?? !leading;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let lastRan: number | undefined;
    let lastArgs: Parameters<T> | undefined;
    let lastContext: any;

    const invokeFunc = () => {
        if (lastArgs) {
            func.apply(lastContext, lastArgs);
            lastRan = Date.now();
            lastArgs = undefined;
        }
    };

    return function (this: any, ...args: Parameters<T>) {
        const context = this;
        const now = Date.now();

        const isFirstCall = !lastRan;

        if (isFirstCall && !leading) {
            lastRan = now;
        }

        const remaining = delay - (lastRan ? now - lastRan : 0);

        lastArgs = args;
        lastContext = context;

        if (remaining <= 0 || remaining > delay || (isFirstCall && leading)) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }
            invokeFunc();
        } else if (!timeout && trailing) {
            timeout = setTimeout(() => {
                invokeFunc();
                timeout = undefined;
            }, remaining);
        }
    };
};
/**
 * Wrap a function so it only ever executes once
 * Subsequent calls return the result of the first invocation
 * @param func - Function to wrap
 * @returns Wrapped function
 *
 * @example
 * const init = once(() => expensiveSetup());
 * init(); // runs
 * init(); // returns cached result, does not run again
 */
export const once = <T extends (...args: any[]) => any>(
    func: T
): ((...args: Parameters<T>) => ReturnType<T>) => {
    let called = false;
    let result: ReturnType<T>;

    return function (this: any, ...args: Parameters<T>): ReturnType<T> {
        if (!called) {
            called = true;
            result = func.apply(this, args);
        }
        return result;
    };
};

/**
 * Memoize a function by caching results per argument list
 * @param func - Function to memoize
 * @param resolver - Optional cache key resolver (defaults to JSON.stringify of args)
 * @returns Memoized function
 *
 * @example
 * const slowSquare = memoize((n: number) => n * n);
 * slowSquare(4); // computed
 * slowSquare(4); // cached
 */
export const memoize = <T extends (...args: any[]) => any>(
    func: T,
    resolver?: (...args: Parameters<T>) => string
): ((...args: Parameters<T>) => ReturnType<T>) => {
    const cache = new Map<string, ReturnType<T>>();

    return function (this: any, ...args: Parameters<T>): ReturnType<T> {
        const key = resolver ? resolver(...args) : JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key)!;
        }
        const result = func.apply(this, args);
        cache.set(key, result);
        return result;
    };
};
