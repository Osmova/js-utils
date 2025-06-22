
/**
 * Parse date from various formats
 */
export const parseDate = (obj: any): Date => {
    if (obj instanceof Date) {
        return obj;
    }

    if (typeof obj === 'string' || typeof obj === 'number') {
        try {
            return new Date(obj);
        } catch (err) {
            console.error(`Error parsing ${obj} to Date`, err);
        }
    }

    return obj;
};

/**
 * Parse period from various data formats
 */
export const parsePeriod = (
    data: any,
    opts: { format?: 'object' | 'array' } = {}
): { from: Date; to: Date } | [Date, Date] => {
    const { format = 'object' } = opts;
    let { from = null, to = null, period = null } = data;

    if (Array.isArray(data) || typeof data == 'string') {
        period = data;
    }

    let periodStart = new Date();
    periodStart.setUTCHours(0, 0, 0, 0);
    let periodEnd = new Date(periodStart.getTime());
    periodEnd.setUTCHours(23, 59, 59, 999);

    const parseDateTime = (date: any, errorValue: Date = new Date()): Date => {
        try {
            return new Date(date);
        } catch (err) {
            console.error(err);
            return errorValue;
        }
    };

    from = from ?? data.start;
    to = to ?? data.end;

    if (typeof from === 'string') {
        periodStart = parseDateTime(from, periodStart);
    }

    if (typeof to === 'string') {
        periodEnd = parseDateTime(to, periodEnd);
    }

    if (typeof period === 'string') {
        period = period.split(',').map((part: string) => part.trim());
    }

    if (Array.isArray(period)) {
        periodStart = parseDateTime(period[0], periodStart);
        if (period[1]) {
            periodEnd = parseDateTime(period[1], periodEnd);
        }
    }

    if (format == 'array') {
        return [periodStart, periodEnd];
    }

    return {
        from: periodStart,
        to: periodEnd,
    };
};