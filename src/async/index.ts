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
    if (timeoutMs === Infinity) return promise;

    const maxTimerDelay = 2_147_483_647;
    let timer: ReturnType<typeof setTimeout>;
    let remaining = Number.isFinite(timeoutMs) ? timeoutMs : 0;

    const timeout = new Promise<never>((_, reject) => {
        const schedule = () => {
            const delay = Math.min(remaining, maxTimerDelay);
            timer = setTimeout(() => {
                remaining -= delay;
                if (remaining <= 0) {
                    reject(new Error(timeoutMessage));
                } else {
                    schedule();
                }
            }, delay);
        };
        schedule();
    });

    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
/**
 * A promise with its resolve/reject exposed, for bridging
 * callback-style flows (modals, queues, one-shot events)
 */
export interface Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
}

/**
 * Create an externally controllable promise
 * @example
 * const modal = deferred<boolean>();
 * confirmButton.onclick = () => modal.resolve(true);
 * const confirmed = await modal.promise;
 */
export function deferred<T = void>(): Deferred<T> {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

/**
 * Poll until a (sync or async) predicate returns truthy
 * Rejects with an Error once the timeout elapses
 * @example
 * await waitFor(() => !!document.querySelector('#ready'), { interval: 100, timeout: 3000 });
 */
export async function waitFor(
    predicate: () => boolean | Promise<boolean>,
    options: { interval?: number; timeout?: number; timeoutMessage?: string } = {}
): Promise<void> {
    const {
        interval = 50,
        timeout = 5000,
        timeoutMessage = 'waitFor: condition not met before timeout'
    } = options;
    // A zero/negative timeout is a single check, preserving the original
    // behavior for asynchronous predicates without adding a polling delay.
    if (timeout <= 0) {
        if (await predicate()) return;
        throw new Error(timeoutMessage);
    }

    const deadline = Date.now() + timeout;

    for (;;) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) {
            if (await predicate()) return;
            throw new Error(timeoutMessage);
        }

        // Race the predicate against the deadline so a hanging async
        // predicate cannot suspend the timeout forever.
        if (await withTimeout(Promise.resolve(predicate()), remaining, timeoutMessage)) {
            return;
        }

        const delay = Math.min(Math.max(interval, 0), deadline - Date.now());
        await sleep(delay);
    }
}
