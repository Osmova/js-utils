/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (str: string): string => {
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
    if (str === str.toUpperCase()) {
        return str.toLowerCase();
    }

    return str
    .split(/(?=[A-Z])/)
    .map((word, index) => (index === 0 ? word : `_${word}`))
    .join('')
    .toLowerCase();
};

/**
 * Creates a slug from a string
 */
export const slugify = (string: string): string => {
    if (!string) {
        return '';
    }
    return string
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '_');
};

/**
 * Gets the basename of a path
 */
export const basename = (str: string, sep: string = '/'): string => {
    return str.substr(str.lastIndexOf(sep) + 1);
};

/**
 * Removes file extension from string
 */
export const stripExtension = (str: string): string => {
    return str.substr(0, str.lastIndexOf('.'));
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
 * Converts RGB to hex
 */
export const rgb2hex = (rgb: string): string =>
    `#${rgb
    .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
    ?.slice(1)
    .map((n) => parseInt(n, 10).toString(16).padStart(2, '0'))
    .join('') || ''}`;

/**
 * Composes URL parts
 */
export const composeURL = (...parts: string[]): string => {
    return parts
    .map((part) => {
        return part.replace(/^\/+|\/+$/g, '');
    })
    .join('/');
};

/**
 * Generates a secure password
 */
export const generatePassword = (options: { length?: number } = {}): string => {
    const { length = 12 } = options;
    const charset =
        'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each type
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};