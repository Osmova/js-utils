import { isEmpty, isNumeric } from "../objects";

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts string to camelCase
 */
export const camelize = (str: string, options: { strict?: boolean } = {}): string => {
    const { strict = true } = options;
    let newStr = str;
    if (strict) {
        newStr = newStr.toLowerCase();
    }
    return newStr.replace(/[^a-zA-Z0-9]+(.)/g, (_m, chr) => chr.toUpperCase());
};

export const toCamelCase = camelize;

/**
 * Converts camelCase to snake_case
 */
export const camelToSnakeCase = (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

/**
 * Creates a slug from a string
 */
export const slugify = (string: string): string => {
    if (!string) return '';
    return string
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '');
};

/**
 * Gets the basename of a path
 */
export const basename = (str: string, sep: string = '/'): string => {
    return str.slice(str.lastIndexOf(sep) + 1);
};

/**
 * Removes file extension from string
 */
export const stripExtension = (str: string): string => {
    const lastDot = str.lastIndexOf('.');
    return lastDot === -1 ? str : str.slice(0, lastDot);
};

/**
 * Checks if a string looks like a file path
 */
export const isFilePath = (str: string, options: { strict?: boolean } = {}): boolean => {
    if (!str || typeof str !== 'string') return false;
    
    const { strict = false } = options;

    // Basic path patterns
    const hasPathSeparators = str.includes('/') || str.includes('\\');
    
    if (strict) {
        const hasExtension = /\.[a-zA-Z0-9]{1,10}$/.test(str);
        return hasPathSeparators && hasExtension;
    }

    const hasExtension = /\.[a-zA-Z0-9]{1,10}$/.test(str);
    return hasPathSeparators ||
        hasExtension ||
        str.startsWith('./') ||
        str.startsWith('../') ||
        str.startsWith('/');
};

/**
 * Validates if string is a valid URL
 */
export const isValidURL = (str: string, opts: { strict?: boolean } = {}): boolean => {
    if (opts.strict) {
        const pattern = new RegExp(
            '^(http[s]?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$',
            'i'
        );
        return !!pattern.test(str);
    }

    try {
        return Boolean(new URL(str));
    } catch (e) {
        return false;
    }
};

/**
 * Converts newlines to <br> tags
 */
export const nl2br = (str: string, replaceMode: boolean = true, isXhtml: boolean = false): string => {
    const breakTag = isXhtml ? '<br />' : '<br>';
    const replaceStr = replaceMode ? '$1' + breakTag : '$1' + breakTag + '$2';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, replaceStr);
};

/**
 * Gets string between two delimiters
 */
export const getStringBetween = (str: string, start: string, end: string): string => {
    const substr = str.split(start).pop()?.split(end)[0] || '';
    if (str.includes('' + start + substr + end)) {
        return substr;
    }
    return '';
};

/**
 * Truncates string with options for strict/word boundary
 */
export const truncate = (
    string: string,
    length: number,
    options: { ending?: string; strict?: boolean } = {}
): string => {
    if (typeof string !== 'string') return string;

    const { ending = '...', strict = false } = options;

    if (string.length > length) {
        const truncatedText = string.substring(0, length - ending.length);

        if (strict) {
            return truncatedText.trim() + ending;
        } else {
            const lastSpaceIndex = truncatedText.lastIndexOf(' ');
            return (lastSpaceIndex === -1 ? truncatedText : truncatedText.substring(0, lastSpaceIndex)) + ending;
        }
    } else {
        return string;
    }
};

/**
 * Strips HTML tags from a string
 *
 * @param html - The HTML string to strip
 * @returns The plain text content without HTML tags
 */
export const stripHtml = (html: string | null | undefined): string => {
    if (!html) return '';

    // Browser env - use DOM methods
    if (typeof document !== 'undefined') {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Node.js env - use regex fallback
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Validates if a string is a valid email address
 * @param {string} str - The email string to validate
 * @returns {boolean} - True if valid email, false otherwise
 */
export const isEmail = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;

    const trimmedEmail = str.trim();

    if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
        return false;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmedEmail)) {
        return false;
    }

    const parts = trimmedEmail.split('@');
    if (parts.length !== 2) {
        return false;
    }

    const [localPart, domainPart] = parts;

    if (localPart.length === 0 || localPart.length > 64 ||
        domainPart.length === 0 || domainPart.length > 253) {
        return false;
    }

    return !(trimmedEmail.includes('..') ||
        localPart.startsWith('.') || localPart.endsWith('.') ||
        domainPart.startsWith('.') || domainPart.endsWith('.'));
};

/**
 * Converts RGB to hex
 */
export const rgb2hex = (rgb: string): string => {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '';
    return `#${match.slice(1)
    .map(n => parseInt(n, 10).toString(16).padStart(2, '0'))
    .join('')}`;
};

/**
 * Composes path segments into a single path
 */
export const composePath = (...parts: (string | undefined | null)[]): string => {
    return parts
    .filter((part): part is string => typeof part === 'string' && !isEmpty(part))
    .map((part) => part.replace(/^\/+|\/+$/g, ''))
    .join('/');
};

/**
 * @deprecated Use composePath
 */
export const composeURL = composePath;

/**
 * Generates a secure password
 */
export const generatePassword = (options: {
    length?: number;
    symbols?: boolean
} = {}): string => {
    const { length = 12, symbols = true } = options;

    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbolChars = '!@#$%^&*';

    let charset = lowercase + uppercase + numbers;
    if (symbols) {
        charset += symbolChars;
    }

    const getRandomChar = (chars: string): string => {
        const array = new Uint8Array(1);
        crypto.getRandomValues(array);
        return chars[array[0] % chars.length];
    };

    let password = '';

    password += getRandomChar(uppercase);
    password += getRandomChar(lowercase);
    password += getRandomChar(numbers);

    if (symbols) {
        password += getRandomChar(symbolChars);
    }

    for (let i = password.length; i < length; i++) {
        password += getRandomChar(charset);
    }

    return password.split('').sort(() => {
        const array = new Uint8Array(1);
        crypto.getRandomValues(array);
        return (array[0] % 3) - 1;
    }).join('');
};

/**
 * Parse a string value to its appropriate type
 */
export const parseStringValue = (
    value: any,
    options: { parseBool?: boolean; parseNumeric?: boolean; parseJson?: boolean } = {}
): any => {
    const {
        parseBool = true,
        parseNumeric = true,
        parseJson = true
    } = options;

    if (typeof value !== 'string') return value;

    if (value === '') return value;

    if (value.toLowerCase() === 'null') return null;

    if (parseBool) {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
    }

    if (parseNumeric && isNumeric(value)) {
        const numValue = parseFloat(value);
        return Number.isInteger(numValue) ? parseInt(value, 10) : numValue;
    }

    if (parseJson && ((value.startsWith('{') && value.endsWith('}')) ||
        (value.startsWith('[') && value.endsWith(']')))) {
        try {
            return JSON.parse(value);
        } catch (error) {
            console.warn(`Failed to parse string value as JSON:`, error);
            return value;
        }
    }

    return value;
};

/**
 * Trims a specific character from the start and/or end of a string
 */
export const trimStr = (
    str: string,
    char: string = ' ',
    options: { start?: boolean; end?: boolean } = {}
): string => {
    if (!str || typeof str !== 'string') return str;
    if (!char || typeof char !== 'string') return str;

    const { start = true, end = true } = options;
    let result = str;

    if (start) {
        const startRegex = new RegExp(`^\\${char}+`);
        result = result.replace(startRegex, '');
    }

    if (end) {
        const endRegex = new RegExp(`\\${char}+$`);
        result = result.replace(endRegex, '');
    }

    return result;
};


