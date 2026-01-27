/**
 * Random utility functions
 *
 * Utility functions for random data operations, useful for demo data generation,
 * shuffling arrays, and picking random elements.
 */

/**
 * Fisher-Yates shuffle algorithm for arrays
 * @param array - Array to shuffle
 * @returns New shuffled array (does not mutate original)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

/**
 * Generate a unique seed based on timestamp and random values
 * @returns Unique seed string
 */
export const generateSeed = (): string =>
    `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Pick a random element from an array
 * @param array - Array to pick from
 * @returns Random element, or undefined if array is empty
 */
export const pickOne = <T>(array: T[]): T | undefined =>
    array.length > 0 ? array[Math.floor(Math.random() * array.length)] : undefined;

/**
 * Pick N random unique items from an array
 * @param array - Array to pick from
 * @param count - Number of items to pick
 * @returns Array of picked items (up to count or array length, whichever is smaller)
 */
export const pickRandom = <T>(array: T[], count: number): T[] => {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, Math.min(count, array.length));
};
