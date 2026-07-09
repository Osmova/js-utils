import { sleep, retry, promiseAllLimit, withTimeout } from '../../src/async/index.js';

describe('promiseAllLimit', () => {
    it('enforces the concurrency limit with factories (regression)', async () => {
        let active = 0;
        let maxActive = 0;

        const tasks = Array.from({ length: 10 }, (_, i) => async () => {
            active++;
            maxActive = Math.max(maxActive, active);
            await sleep(10);
            active--;
            return i;
        });

        const results = await promiseAllLimit(tasks, 3);
        expect(maxActive).toBeLessThanOrEqual(3);
        expect(results).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('still accepts plain promises (backward compatibility)', async () => {
        const results = await promiseAllLimit(
            [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)],
            2
        );
        expect(results).toEqual([1, 2, 3]);
    });

    it('propagates rejections', async () => {
        const tasks = [
            () => Promise.resolve(1),
            () => Promise.reject(new Error('boom')),
            () => Promise.resolve(3)
        ];
        await expect(promiseAllLimit(tasks, 2)).rejects.toThrow('boom');
    });
});

describe('withTimeout', () => {
    it('resolves when the promise settles in time', async () => {
        await expect(withTimeout(sleep(5).then(() => 'ok'), 100)).resolves.toBe('ok');
    });

    it('rejects with the timeout message when too slow', async () => {
        await expect(withTimeout(sleep(100), 10, 'too slow')).rejects.toThrow('too slow');
    });
});

describe('retry', () => {
    it('retries until success', async () => {
        let attempts = 0;
        const result = await retry(async () => {
            attempts++;
            if (attempts < 3) throw new Error('nope');
            return 'done';
        }, 3, 1);
        expect(result).toBe('done');
        expect(attempts).toBe(3);
    });

    it('throws the last error after max attempts', async () => {
        await expect(retry(async () => {
            throw new Error('always');
        }, 2, 1)).rejects.toThrow('always');
    });
});
