/**
 * Debounce function execution
 */
export const debounce = (func: Function, delay: number) => {
    let debounceTimer: NodeJS.Timeout;
    return function (this: any, ...args: any[]) {
        const context = this;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
};

/**
 * Load external script dynamically
 */
export const loadExternalScript = (
    src: string,
    opts: { id?: string; async?: boolean } = {}
): Promise<void> => {
    const { id, async = true } = opts;
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
 * Generate UUID v4
 */
export const genUuid = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = (Math.random() * 16) | 0;
        const value = char === 'x' ? random : (random & 0x3) | 0x8;
        return value.toString(16);
    });
};