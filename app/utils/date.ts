/**
 * Date utility functions for shipping estimates and calendar calculations.
 *
 * @module utils/date
 */

/**
 * Formats a date as a localized short string (e.g., "Mon, Dec 16").
 *
 * @param date - The date to format
 * @param locale - Locale string for formatting (e.g., "en-US", "de-DE")
 * @returns Formatted date string with weekday, month, and day
 *
 * @example
 * ```ts
 * formatShortDate(new Date("2024-12-16"), "en-US");
 * // => "Mon, Dec 16"
 *
 * formatShortDate(new Date("2024-12-16"), "de-DE");
 * // => "Mo., 16. Dez."
 * ```
 */
export function formatShortDate(date: Date, locale: string): string {
    return date.toLocaleDateString(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

/**
 * Adds business days to a date, skipping weekends (Saturday and Sunday).
 *
 * @param startDate - The starting date
 * @param days - Number of business days to add (must be >= 0)
 * @returns New date with business days added
 *
 * @example
 * ```ts
 * // Starting from Friday Dec 13, 2024
 * addBusinessDays(new Date("2024-12-13"), 1);
 * // => Monday Dec 16, 2024 (skips Sat/Sun)
 *
 * addBusinessDays(new Date("2024-12-16"), 3);
 * // => Thursday Dec 19, 2024
 * ```
 */
export function addBusinessDays(startDate: Date, days: number): Date {
    const result = new Date(startDate);
    let addedDays = 0;

    while (addedDays < days) {
        result.setDate(result.getDate() + 1);
        const dayOfWeek = result.getDay();
        // Skip Saturday (6) and Sunday (0)
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++;
        }
    }

    return result;
}

/**
 * Calculates hours remaining until a specific hour cutoff today.
 * Returns 0 if the cutoff time has already passed.
 *
 * @param cutoffHour - The cutoff hour in 24-hour format (0-23)
 * @param referenceDate - Optional reference date (defaults to current time)
 * @returns Hours until cutoff, or 0 if past cutoff
 *
 * @example
 * ```ts
 * // If current time is 10:00 AM
 * getHoursUntilCutoff(14); // => 4
 *
 * // If current time is 3:00 PM
 * getHoursUntilCutoff(14); // => 0 (past cutoff)
 * ```
 */
export function getHoursUntilCutoff(
    cutoffHour: number,
    referenceDate?: Date,
): number {
    const now = referenceDate ?? new Date();
    const cutoff = new Date(now);
    cutoff.setHours(cutoffHour, 0, 0, 0);

    if (now >= cutoff) {
        return 0;
    }

    return Math.ceil((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60));
}

/**
 * Checks if a given date is a weekend (Saturday or Sunday).
 *
 * @param date - The date to check
 * @returns True if the date is Saturday or Sunday
 *
 * @example
 * ```ts
 * isWeekend(new Date("2024-12-14")); // Saturday => true
 * isWeekend(new Date("2024-12-16")); // Monday => false
 * ```
 */
export function isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
}
