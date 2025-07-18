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
        console.error(`Error parsing ${value} to Date: Invalid date`);
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
    let periodStart = new Date(now);
    periodStart.setUTCHours(0, 0, 0, 0);
    let periodEnd = new Date(now);
    periodEnd.setUTCHours(23, 59, 59, 999);

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