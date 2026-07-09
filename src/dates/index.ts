/**
 * Parse date from various formats
 */
export const parseDate = (value: any, defaultValue = new Date()): Date => {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    return defaultValue;
};

/**
 * Parse period from various data formats
 */
export const parsePeriod = (
  data: any,
  opts: { format?: 'object' | 'array' | 'string' } = {}
): { start: Date; end: Date; startISO: string; endISO: string } | [Date, Date] | string => {
    const { format = 'object' } = opts;

    const now = new Date();
    let periodStart = startOfDay(now, { utc: true });
    let periodEnd = endOfDay(now, { utc: true });

    if (Array.isArray(data)) {
        if (data.length > 0) {
            periodStart = parseDate(data[0], periodStart);
            if (data.length > 1) {
                periodEnd = parseDate(data[1], periodEnd);
            }
        }
    } else if (typeof data === 'string') {
        if (data.includes(',')) {
            const parts = data.split(',').map(part => part.trim());
            periodStart = parseDate(parts[0], periodStart);
            if (parts[1]) {
                periodEnd = parseDate(parts[1], periodEnd);
            }
        } else {
            periodStart = parseDate(data, periodStart);
        }
    } else if (data && typeof data === 'object') {
        const { start, end, from, to, period } = data;

        if (period !== undefined) {
            if (typeof period === 'string') {
                const parts = period.split(',').map(part => part.trim());
                periodStart = parseDate(parts[0], periodStart);
                if (parts[1]) {
                    periodEnd = parseDate(parts[1], periodEnd);
                }
            } else if (Array.isArray(period)) {
                if (period.length > 0) {
                    periodStart = parseDate(period[0], periodStart);
                    if (period.length > 1) {
                        periodEnd = parseDate(period[1], periodEnd);
                    }
                }
            }
        } else {
            const startDate = start ?? from;
            const endDate = end ?? to;

            if (startDate) {
                periodStart = parseDate(startDate, periodStart);
            }
            if (endDate) {
                periodEnd = parseDate(endDate, periodEnd);
            }
        }
    }

    if (format === 'array') {
        return [periodStart, periodEnd];
    } else if (format === 'string') {
        return `${periodStart.toISOString()},${periodEnd.toISOString()}`;
    } else {
        return {
            start: periodStart,
            end: periodEnd,
            startISO: periodStart.toISOString(),
            endISO: periodEnd.toISOString()
        };
    }
};
/**
 * Returns a new date with the given number of days added (negative to subtract)
 *
 * @example
 * addDays(new Date('2026-01-01'), 7) // 2026-01-08
 * addDays(new Date('2026-01-01'), -1) // 2025-12-31
 */
export const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Checks whether two dates fall on the same calendar day (local time)
 *
 * @example
 * isSameDay(new Date('2026-01-01T08:00'), new Date('2026-01-01T23:59')) // true
 */
export const isSameDay = (a: Date, b: Date): boolean => {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
};

/**
 * Returns a new date set to the start of the day (00:00:00.000)
 * @param date - Source date
 * @param options.utc - Use UTC day boundaries instead of local time
 */
export const startOfDay = (date: Date, options: { utc?: boolean } = {}): Date => {
    const result = new Date(date);
    if (options.utc) {
        result.setUTCHours(0, 0, 0, 0);
    } else {
        result.setHours(0, 0, 0, 0);
    }
    return result;
};

/**
 * Returns a new date set to the end of the day (23:59:59.999)
 * @param date - Source date
 * @param options.utc - Use UTC day boundaries instead of local time
 */
export const endOfDay = (date: Date, options: { utc?: boolean } = {}): Date => {
    const result = new Date(date);
    if (options.utc) {
        result.setUTCHours(23, 59, 59, 999);
    } else {
        result.setHours(23, 59, 59, 999);
    }
    return result;
};
