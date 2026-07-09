/**
 * Async utility functions
 */

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry async function with exponential backoff
 */
export async function retry<T>(
    fn: () => Promise<T>,
    maxAttempts = 3,
    baseDelay = 1000
): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                throw lastError;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            await sleep(delay);
        }
    }

    throw lastError!;
}

/**
 * Execute tasks with a concurrency limit
 *
 * Pass factories (`() => Promise`) so tasks start lazily and the limit is
 * actually enforced. Plain promises are also accepted for backward
 * compatibility, but those are already running when passed in, so they
 * cannot be throttled.
 */
export async function promiseAllLimit<T>(
    tasks: Array<Promise<T> | (() => Promise<T>)>,
    limit: number
): Promise<T[]> {
    const results: T[] = new Array(tasks.length);
    const all: Promise<void>[] = [];
    const executing = new Set<Promise<void>>();

    for (const [index, task] of tasks.entries()) {
        const execute = Promise.resolve(typeof task === 'function' ? task() : task)
            .then(result => {
                results[index] = result;
            })
            .finally(() => {
                executing.delete(execute);
            });

        all.push(execute);
        executing.add(execute);

        if (executing.size >= limit) {
            await Promise.race(executing);
        }
    }

    await Promise.all(all);
    return results;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    timeoutMessage = 'Operation timed out'
): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;

    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}