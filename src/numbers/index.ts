/**
 * Format number as currency with locale support
 * @param value - Number to format
 * @param currency - Currency code (default: 'EUR')
 * @param locale - Locale code (default: 'fr-FR')
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // '1 234,56 €'
 * formatCurrency(1234.56, 'USD', 'en-US') // '$1,234.56'
 */
export const formatCurrency = (
    value: number,
    currency: string = 'EUR',
    locale: string = 'fr-FR'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    }).format(value);
};

/**
 * Format number with locale-specific separators
 * @param value - Number to format
 * @param options - Formatting options
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234.56) // '1 234,56'
 * formatNumber(1234.56, { decimals: 0 }) // '1 235'
 * formatNumber(1234.56, { locale: 'en-US' }) // '1,234.56'
 */
export const formatNumber = (
    value: number,
    options: {
        locale?: string;
        decimals?: number;
        minimumDecimals?: number;
    } = {}
): string => {
    const {
        locale = 'fr-FR',
        decimals,
        minimumDecimals,
    } = options;

    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: minimumDecimals ?? decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Format number as percentage
 * @param value - Number to format (0.15 = 15%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(0.1556) // '15,56 %'
 * formatPercent(0.1556, { decimals: 0 }) // '16 %'
 * formatPercent(0.1556, { locale: 'en-US' }) // '15.56%'
 */
export const formatPercent = (
    value: number,
    options: {
        locale?: string;
        decimals?: number;
    } = {}
): string => {
    const { locale = 'fr-FR', decimals = 2 } = options;

    return new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);
};

/**
 * Clamp number between min and max values
 * @param value - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * clamp(10, 0, 100) // 10
 * clamp(-5, 0, 100) // 0
 * clamp(150, 0, 100) // 100
 */
export const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

/**
 * Generate random integer between min and max (inclusive)
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer
 *
 * @example
 * randomInt(1, 10) // Random number between 1 and 10
 * randomInt(0, 100) // Random number between 0 and 100
 */
export const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Round a number to a fixed number of decimals (returns a number)
 * @example
 * roundTo(1.005, 2) // 1.01
 * roundTo(1234.5678, 1) // 1234.6
 */
export const roundTo = (value: number, decimals: number = 0): number => {
    const factor = 10 ** decimals;
    return Math.round((value + Number.EPSILON) * factor) / factor;
};

/**
 * Format a byte count as a human-readable size
 * @param bytes - Number of bytes
 * @param options.decimals - Max decimals (default 1)
 * @param options.binary - Use 1024-based units (KiB, MiB) instead of 1000-based (KB, MB)
 * @example
 * formatBytes(1536) // '1.5 KB'
 * formatBytes(1536, { binary: true }) // '1.5 KiB'
 * formatBytes(0) // '0 B'
 */
export const formatBytes = (
    bytes: number,
    options: { decimals?: number; binary?: boolean } = {}
): string => {
    const { decimals = 1, binary = false } = options;

    if (!Number.isFinite(bytes)) return '0 B';

    const base = binary ? 1024 : 1000;
    const units = binary
        ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
        : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

    const abs = Math.abs(bytes);
    if (abs < 1) return `${bytes} B`;

    const exp = Math.min(Math.floor(Math.log(abs) / Math.log(base)), units.length - 1);
    const value = bytes / base ** exp;

    return `${roundTo(value, exp === 0 ? 0 : decimals)} ${units[exp]}`;
};
