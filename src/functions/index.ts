/**
 * Debounce function execution
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    options: { immediate?: boolean } = {}
): (...args: Parameters<T>) => void => {
    const { immediate = false } = options;
    let debounceTimer: NodeJS.Timeout | undefined;

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
        
        const timeLow = (timestamp & 0xffffffff).toString(16).padStart(8, '0');
        const timeMid = ((timestamp >>> 32) & 0xffff).toString(16).padStart(4, '0');
        const timeHigh = (((timestamp >>> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
        const clockSeqHigh = ((clockSeq >>> 8) | 0x80).toString(16).padStart(2, '0');
        const clockSeqLow = (clockSeq & 0xff).toString(16).padStart(2, '0');
        const nodeHex = node.map(n => n.toString(16).padStart(2, '0')).join('');
        
        return `${timeLow}-${timeMid}-${timeHigh}-${clockSeqHigh}${clockSeqLow}-${nodeHex}`;
    }
    
    throw new Error(`Unsupported UUID version: ${version}`);
};