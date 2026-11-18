import { downloadBlob } from '../../src/browser/index.js';

describe('browser: downloadBlob', () => {
    it('keeps the blob URL alive after click so the browser can save it', () => {
        jest.useFakeTimers();
        const revoke = jest.fn();
        const link = { href: '', setAttribute: jest.fn(), click: jest.fn() };
        (global as any).window = { URL: { createObjectURL: () => 'blob:x', revokeObjectURL: revoke } };
        (global as any).document = {
            createElement: () => link,
            body: { appendChild: jest.fn(), removeChild: jest.fn() },
        };
        try {
            const blob = new Blob(['pdf']);
            expect(downloadBlob(blob, 'f.pdf')).toBe(blob);
            expect(link.click).toHaveBeenCalled();
            expect(revoke).not.toHaveBeenCalled();
            jest.advanceTimersByTime(60000);
            expect(revoke).toHaveBeenCalledWith('blob:x');
        } finally {
            delete (global as any).window;
            delete (global as any).document;
            jest.useRealTimers();
        }
    });
});
