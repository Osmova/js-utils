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
