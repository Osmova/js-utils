/**
 * Browser-specific utilities for file downloads and DOM manipulation
 * These functions only work in browser environments
 */

/**
 * Check if running in browser environment
 */
const isBrowser = (): boolean => {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Download a Blob as a file
 * @param blob - Blob or File to download
 * @param filename - Name for the downloaded file
 * @param options - Download options
 * @returns The blob that was downloaded, or null if not in browser
 *
 * @example
 * const blob = new Blob(['Hello World'], { type: 'text/plain' });
 * downloadBlob(blob, 'hello.txt');
 *
 * @example
 * const csvData = new Blob([csvString], { type: 'text/csv' });
 * downloadBlob(csvData, 'data.csv');
 */
export const downloadBlob = (
    blob: Blob,
    filename: string,
    options: {
        removeLink?: boolean;
    } = {}
): Blob | null => {
    const { removeLink = true } = options;

    if (!isBrowser()) {
        console.warn('downloadBlob: Not in browser environment');
        return null;
    }

    try {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        if (removeLink) {
            document.body.removeChild(link);
        }

        window.URL.revokeObjectURL(url);
        return blob;
    } catch (error) {
        console.error('downloadBlob: Failed to download blob', error);
        return null;
    }
};

/**
 * Download a file from a URL
 * @param url - URL to download from
 * @param filename - Optional filename (extracted from URL if not provided)
 * @param options - Download options
 * @returns True if download initiated successfully
 *
 * @example
 * downloadUrl('https://example.com/file.pdf', 'document.pdf');
 *
 * @example
 * downloadUrl('https://example.com/image.jpg'); // Uses 'image.jpg' from URL
 */
export const downloadUrl = (
    url: string,
    filename?: string,
    options: {
        removeLink?: boolean;
    } = {}
): boolean => {
    const { removeLink = true } = options;

    if (!isBrowser()) {
        console.warn('downloadUrl: Not in browser environment');
        return false;
    }

    try {
        const link = document.createElement('a');
        link.href = url;

        if (filename) {
            link.setAttribute('download', filename);
        } else {
            const urlFilename = url.split('/').pop() || 'download';
            link.setAttribute('download', urlFilename);
        }

        document.body.appendChild(link);
        link.click();

        if (removeLink) {
            document.body.removeChild(link);
        }

        return true;
    } catch (error) {
        console.error('downloadUrl: Failed to download from URL', error);
        return false;
    }
};

/**
 * Open a Blob in a new browser tab/window
 * @param blob - Blob to open
 * @param options - Open options
 * @returns True if opened successfully
 *
 * @example
 * const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
 * openBlob(pdfBlob); // Opens PDF in new tab
 */
export const openBlob = (
    blob: Blob,
    options: {
        revokeTimeout?: number;
    } = {}
): boolean => {
    const { revokeTimeout = 1000 } = options;

    if (!isBrowser()) {
        console.warn('openBlob: Not in browser environment');
        return false;
    }

    try {
        const url = window.URL.createObjectURL(blob);
        window.open(url);

        setTimeout(() => {
            window.URL.revokeObjectURL(url);
        }, revokeTimeout);

        return true;
    } catch (error) {
        console.error('openBlob: Failed to open blob', error);
        return false;
    }
};

/**
 * Download or open a Blob based on options
 * @param blob - Blob to handle
 * @param filename - Filename for download
 * @param options - Behavior options
 * @returns The blob or null
 *
 * @example
 * handleBlobDownload(csvBlob, 'data.csv', { download: true });
 * handleBlobDownload(pdfBlob, 'doc.pdf', { download: false }); // Opens in new tab
 */
export const handleBlobDownload = (
    blob: Blob,
    filename: string,
    options: {
        download?: boolean;
        removeLink?: boolean;
        revokeTimeout?: number;
    } = {}
): Blob | null => {
    const { download = true, ...otherOptions } = options;

    if (!isBrowser()) {
        console.warn('handleBlobDownload: Not in browser environment');
        return null;
    }

    if (download) {
        return downloadBlob(blob, filename, otherOptions);
    } else {
        openBlob(blob, otherOptions);
        return blob;
    }
};

/**
 * Convert data URL to Blob
 * @param dataUrl - Data URL string
 * @returns Blob or null if invalid
 *
 * @example
 * const dataUrl = 'data:text/plain;base64,SGVsbG8gV29ybGQ=';
 * const blob = dataUrlToBlob(dataUrl);
 */
export const dataUrlToBlob = (dataUrl: string): Blob | null => {
    try {
        const parts = dataUrl.split(',');
        if (parts.length !== 2) return null;

        const mime = parts[0].match(/:(.*?);/)?.[1] || 'text/plain';
        const data = atob(parts[1]);
        const array = new Uint8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            array[i] = data.charCodeAt(i);
        }

        return new Blob([array], { type: mime });
    } catch (error) {
        console.error('dataUrlToBlob: Failed to convert data URL', error);
        return null;
    }
};

/**
 * Copy text to the clipboard
 * Uses the async Clipboard API in secure contexts, falling back to a
 * hidden textarea + execCommand elsewhere
 * @param options.fallback - Allow the hidden-textarea fallback in insecure contexts (default true)
 * @returns True when the copy succeeded
 *
 * @example
 * await copyToClipboard('hello');
 */
export const copyToClipboard = async (
    text: string,
    options: { fallback?: boolean } = {}
): Promise<boolean> => {
    const { fallback = true } = options;

    if (!isBrowser()) {
        console.warn('copyToClipboard: Not in browser environment');
        return false;
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }

        if (!fallback) return false;

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        try {
            textarea.select();
            return document.execCommand('copy');
        } finally {
            document.body.removeChild(textarea);
        }
    } catch (error) {
        console.error('copyToClipboard: Failed to copy', error);
        return false;
    }
};

/**
 * Convert a Blob to a data URL (inverse of dataUrlToBlob)
 * Uses FileReader when available, otherwise encodes manually,
 * so it also works in Node >= 16
 *
 * @example
 * const dataUrl = await blobToDataUrl(new Blob(['hi'], { type: 'text/plain' }));
 * // 'data:text/plain;base64,aGk='
 */
export const blobToDataUrl = async (blob: Blob): Promise<string> => {
    if (typeof FileReader !== 'undefined') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }

    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return `data:${blob.type || 'application/octet-stream'};base64,${btoa(binary)}`;
};
