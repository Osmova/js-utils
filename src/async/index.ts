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
 * Execute promises with concurrency limit
 */
export async function promiseAllLimit<T>(
    promises: Promise<T>[],
    limit: number
): Promise<T[]> {
    const results: T[] = [];
    const executing: Promise<void>[] = [];

    for (const [index, promise] of promises.entries()) {
        const execute = promise.then(result => {
            results[index] = result;
        });

        executing.push(execute);

        if (executing.length >= limit) {
            await Promise.race(executing);
            executing.splice(executing.findIndex(p => p === execute), 1);
        }
    }

    await Promise.all(executing);
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
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    );

    return Promise.race([promise, timeout]);
}