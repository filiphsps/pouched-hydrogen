import { describe, expect, it } from "vitest";
import {
    addBusinessDays,
    formatShortDate,
    getHoursUntilCutoff,
    isWeekend,
} from "./date";

describe("formatShortDate", () => {
    it("formats date in en-US locale", () => {
        const date = new Date("2024-12-16T12:00:00");
        const result = formatShortDate(date, "en-US");
        expect(result).toBe("Mon, Dec 16");
    });

    it("formats date in de-DE locale", () => {
        const date = new Date("2024-12-16T12:00:00");
        const result = formatShortDate(date, "de-DE");
        // German format: "Mo., 16. Dez."
        expect(result).toContain("16");
        expect(result).toContain("Dez");
    });

    it("handles different days of the week", () => {
        const friday = new Date("2024-12-13T12:00:00");
        const result = formatShortDate(friday, "en-US");
        expect(result).toBe("Fri, Dec 13");
    });
});

describe("addBusinessDays", () => {
    it("adds business days correctly on a weekday", () => {
        // Monday Dec 16, 2024
        const monday = new Date("2024-12-16T12:00:00");
        const result = addBusinessDays(monday, 2);
        // Should be Wednesday Dec 18
        expect(result.getDate()).toBe(18);
        expect(result.getDay()).toBe(3); // Wednesday
    });

    it("skips weekends when adding days", () => {
        // Friday Dec 13, 2024
        const friday = new Date("2024-12-13T12:00:00");
        const result = addBusinessDays(friday, 1);
        // Should skip Sat/Sun, land on Monday Dec 16
        expect(result.getDate()).toBe(16);
        expect(result.getDay()).toBe(1); // Monday
    });

    it("handles multiple weekend skips", () => {
        // Friday Dec 13, 2024
        const friday = new Date("2024-12-13T12:00:00");
        const result = addBusinessDays(friday, 6);
        // 6 business days from Friday = next Friday + 1 = next Monday + 5 more
        // Fri -> Mon(1) -> Tue(2) -> Wed(3) -> Thu(4) -> Fri(5) -> Mon(6)
        // Dec 13 + skip weekend -> Dec 16(1), 17(2), 18(3), 19(4), 20(5), skip weekend -> Dec 23(6)
        expect(result.getDate()).toBe(23);
        expect(result.getDay()).toBe(1); // Monday
    });

    it("returns same date when adding 0 days", () => {
        const date = new Date("2024-12-16T12:00:00");
        const result = addBusinessDays(date, 0);
        expect(result.getDate()).toBe(16);
    });

    it("does not mutate the original date", () => {
        const original = new Date("2024-12-16T12:00:00");
        const originalTime = original.getTime();
        addBusinessDays(original, 5);
        expect(original.getTime()).toBe(originalTime);
    });
});

describe("getHoursUntilCutoff", () => {
    it("returns hours until cutoff when before cutoff", () => {
        // 10:00 AM reference time
        const reference = new Date("2024-12-16T10:00:00");
        const result = getHoursUntilCutoff(14, reference);
        expect(result).toBe(4);
    });

    it("returns 0 when past cutoff", () => {
        // 3:00 PM reference time, cutoff at 2:00 PM
        const reference = new Date("2024-12-16T15:00:00");
        const result = getHoursUntilCutoff(14, reference);
        expect(result).toBe(0);
    });

    it("returns 0 when exactly at cutoff", () => {
        // Exactly 2:00 PM
        const reference = new Date("2024-12-16T14:00:00");
        const result = getHoursUntilCutoff(14, reference);
        expect(result).toBe(0);
    });

    it("rounds up partial hours", () => {
        // 10:30 AM reference time, cutoff at 14:00
        const reference = new Date("2024-12-16T10:30:00");
        const result = getHoursUntilCutoff(14, reference);
        // 3.5 hours -> should round up to 4
        expect(result).toBe(4);
    });

    it("handles early morning cutoffs", () => {
        // 6:00 AM reference time, cutoff at 8:00 AM
        const reference = new Date("2024-12-16T06:00:00");
        const result = getHoursUntilCutoff(8, reference);
        expect(result).toBe(2);
    });
});

describe("isWeekend", () => {
    it("returns true for Saturday", () => {
        const saturday = new Date("2024-12-14T12:00:00");
        expect(isWeekend(saturday)).toBe(true);
    });

    it("returns true for Sunday", () => {
        const sunday = new Date("2024-12-15T12:00:00");
        expect(isWeekend(sunday)).toBe(true);
    });

    it("returns false for Monday", () => {
        const monday = new Date("2024-12-16T12:00:00");
        expect(isWeekend(monday)).toBe(false);
    });

    it("returns false for Friday", () => {
        const friday = new Date("2024-12-13T12:00:00");
        expect(isWeekend(friday)).toBe(false);
    });

    it("returns false for Wednesday", () => {
        const wednesday = new Date("2024-12-18T12:00:00");
        expect(isWeekend(wednesday)).toBe(false);
    });
});
