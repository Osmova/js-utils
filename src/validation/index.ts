/**
 * Parse language code from locale
 */
export const parseLanguageCode = (
    value: string,
    options: { lowercase?: boolean } = {}
): string | null => {
    const { lowercase = true } = options;

    if (!value?.trim()) return null;

    const code = value.trim().split(/[-_]/)[0];
    return code.length === 2
        ? lowercase
            ? code.toLowerCase()
            : code.toUpperCase()
        : null;
};

/**
 * Parse boolean value from various formats
 * Handles: boolean, number (0/1), string ('0'/'1'/'true'/'false'), null/undefined
 *
 * @param value - Value to parse as boolean
 * @returns True, false, or original value if not parseable
 *
 * @example
 * parseBool(1) // true
 * parseBool('1') // true
 * parseBool(0) // false
 * parseBool('false') // false
 * parseBool(true) // true
 */
export const parseBool = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (value === 1 || value === '1' || value === 'true') return true;
    if (value === 0 || value === '0' || value === 'false') return false;
    return Boolean(value);
};

/**
 * Validates CSS property and value
 */
export const isValidCss = (prop: string, val: string): boolean => {
    if (prop === 'color') {
        return isValidHex(val);
    }

    if (prop === 'length') return false;
    if (val === '') return true;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
            const testElement = document.createElement('div');
            const style = testElement.style as any;

            if (style[prop] !== '') return false;
            style[prop] = val;
            return style[prop] !== '';
        } catch (error) {
            console.warn('CSS validation failed:', error);
            return false;
        }
    }

    return typeof val === 'string' && val.length > 0;
};

/**
 * Validates hex color
 */
export const isValidHex = (color: string): boolean => {
    if (!color || typeof color !== 'string') return false;

    if (color.substring(0, 1) === '#') color = color.substring(1);

    switch (color.length) {
        case 3:
            return /^[0-9A-F]{3}$/i.test(color);
        case 6:
            return /^[0-9A-F]{6}$/i.test(color);
        case 8:
            return /^[0-9A-F]{8}$/i.test(color);
        default:
            return false;
    }
};

/**
 * Validates color string (hex, named, rgb, hsl)
 */
export const isValidColor = (color: string): boolean => {
    if (!color || typeof color !== 'string') return false;

    if (color.startsWith('#')) {
        return isValidHex(color);
    }

    const namedColors = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
        'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
        'teal', 'silver', 'maroon', 'olive', 'aqua', 'fuchsia', 'transparent'
    ];

    if (namedColors.includes(color.toLowerCase())) {
        return true;
    }

    const rgbRegex = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[01]?(?:\.\d+)?)?\s*\)$/;
    if (rgbRegex.test(color)) {
        return true;
    }

    const hslRegex = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*[01]?(?:\.\d+)?)?\s*\)$/;
    if (hslRegex.test(color)) {
        return true;
    }

    return false;
};