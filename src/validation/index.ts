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
 * Validates CSS property and value
 * Note: This function has limited functionality in Node.js environments
 */
export const isValidCss = (prop: string, val: string): boolean => {
    if (prop === 'color') {
        return isValidHex(val);
    }

    if (prop === 'length') return false;
    if (val === '') return true;

    // For browser environments with DOM access
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        try {
            // Create a temporary element to test CSS
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

    // Basic validation for Node.js environments
    // You might want to add more specific validation rules here
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
 * Basic color validation that works in both browser and Node.js
 */
export const isValidColor = (color: string): boolean => {
    if (!color || typeof color !== 'string') return false;

    // Check if it's a hex color
    if (color.startsWith('#')) {
        return isValidHex(color);
    }

    // Check if it's a named color (basic list)
    const namedColors = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
        'pink', 'brown', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
        'teal', 'silver', 'maroon', 'olive', 'aqua', 'fuchsia', 'transparent'
    ];

    if (namedColors.includes(color.toLowerCase())) {
        return true;
    }

    // Check if it's rgb() or rgba()
    const rgbRegex = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*[01]?(?:\.\d+)?)?\s*\)$/;
    if (rgbRegex.test(color)) {
        return true;
    }

    // Check if it's hsl() or hsla()
    const hslRegex = /^hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*(?:,\s*[01]?(?:\.\d+)?)?\s*\)$/;
    if (hslRegex.test(color)) {
        return true;
    }

    return false;
};