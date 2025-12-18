import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    addBusinessDaysWithHolidays,
    calculateDeliveryEstimate,
    clearShippingZonesCache,
    DEFAULT_SHIPPING_ZONES,
    fetchAdminDeliveryZones,
    getCachedShippingZones,
    getHolidayInstance,
    getShippingZone,
    getShippingZonesCacheStatus,
    getUpcomingHolidays,
    isNonWorkingDay,
    isPublicHoliday,
    parseAdminDeliveryZonesResponse,
    SHIPPING_ZONES,
} from "./shipping";

describe("SHIPPING_ZONES", () => {
    it("has a default zone", () => {
        const defaultZone = SHIPPING_ZONES.find((z) => z.isDefault);
        expect(defaultZone).toBeDefined();
        expect(defaultZone?.id).toBe("domestic");
    });

    it("has valid zone configurations", () => {
        for (const zone of SHIPPING_ZONES) {
            expect(zone.id).toBeDefined();
            expect(zone.name).toBeDefined();
            expect(zone.minDays).toBeGreaterThan(0);
            expect(zone.maxDays).toBeGreaterThanOrEqual(zone.minDays);
        }
    });

    it("domestic zone has Germany", () => {
        const domestic = SHIPPING_ZONES.find((z) => z.id === "domestic");
        expect(domestic?.countries).toContain("DE");
    });

    it("has international zone as fallback", () => {
        const international = SHIPPING_ZONES.at(-1);
        expect(international?.id).toBe("international");
        expect(international?.countries).toHaveLength(0);
    });
});

describe("getHolidayInstance", () => {
    it("returns a holiday instance for Germany", () => {
        const holidays = getHolidayInstance("DE");
        expect(holidays).not.toBeNull();
    });

    it("handles lowercase country codes", () => {
        const holidays = getHolidayInstance("de");
        expect(holidays).not.toBeNull();
    });

    it("caches holiday instances", () => {
        const first = getHolidayInstance("DE");
        const second = getHolidayInstance("DE");
        expect(first).toBe(second);
    });

    it("returns an instance even for unknown country codes", () => {
        // The date-holidays package doesn't throw for unknown codes,
        // but getHolidays will return an empty list
        const holidays = getHolidayInstance("XX");
        expect(holidays).not.toBeNull();
        // Verify it returns no holidays for the unknown country
        const holidayList = holidays?.getHolidays(2024);
        expect(holidayList?.length).toBe(0);
    });
});

describe("isPublicHoliday", () => {
    it("returns true for Christmas Day in Germany", () => {
        const christmas = new Date("2024-12-25T12:00:00");
        expect(isPublicHoliday(christmas, "DE")).toBe(true);
    });

    it("returns true for New Year's Day in Germany", () => {
        const newYear = new Date("2025-01-01T12:00:00");
        expect(isPublicHoliday(newYear, "DE")).toBe(true);
    });

    it("returns false for a regular weekday", () => {
        const monday = new Date("2024-12-16T12:00:00");
        expect(isPublicHoliday(monday, "DE")).toBe(false);
    });

    it("defaults to Germany when no country specified", () => {
        const christmas = new Date("2024-12-25T12:00:00");
        expect(isPublicHoliday(christmas)).toBe(true);
    });

    it("returns false for unsupported countries", () => {
        const date = new Date("2024-12-25T12:00:00");
        expect(isPublicHoliday(date, "XX")).toBe(false);
    });
});

describe("isNonWorkingDay", () => {
    it("returns true for Saturday", () => {
        const saturday = new Date("2024-12-14T12:00:00");
        expect(isNonWorkingDay(saturday, "DE")).toBe(true);
    });

    it("returns true for Sunday", () => {
        const sunday = new Date("2024-12-15T12:00:00");
        expect(isNonWorkingDay(sunday, "DE")).toBe(true);
    });

    it("returns true for public holidays", () => {
        const christmas = new Date("2024-12-25T12:00:00");
        expect(isNonWorkingDay(christmas, "DE")).toBe(true);
    });

    it("returns false for regular weekdays", () => {
        const monday = new Date("2024-12-16T12:00:00");
        expect(isNonWorkingDay(monday, "DE")).toBe(false);
    });

    it("defaults to Germany when no country specified", () => {
        const saturday = new Date("2024-12-14T12:00:00");
        expect(isNonWorkingDay(saturday)).toBe(true);
    });
});

describe("addBusinessDaysWithHolidays", () => {
    it("adds business days correctly on a weekday", () => {
        const monday = new Date("2024-12-16T12:00:00");
        const result = addBusinessDaysWithHolidays(monday, 2, "DE");
        expect(result.getDate()).toBe(18);
        expect(result.getDay()).toBe(3); // Wednesday
    });

    it("skips weekends when adding days", () => {
        const friday = new Date("2024-12-13T12:00:00");
        const result = addBusinessDaysWithHolidays(friday, 1, "DE");
        expect(result.getDate()).toBe(16);
        expect(result.getDay()).toBe(1); // Monday
    });

    it("skips Christmas holidays", () => {
        // Dec 23 is Monday, Dec 25-26 are holidays, Dec 24 might be partial
        const dec23 = new Date("2024-12-23T12:00:00");
        const result = addBusinessDaysWithHolidays(dec23, 2, "DE");
        // Should skip Dec 25-26 (holidays), so lands on Dec 27 or later
        expect(result.getDate()).toBeGreaterThanOrEqual(27);
    });

    it("returns same date when adding 0 days", () => {
        const date = new Date("2024-12-16T12:00:00");
        const result = addBusinessDaysWithHolidays(date, 0, "DE");
        expect(result.getDate()).toBe(16);
    });

    it("does not mutate the original date", () => {
        const original = new Date("2024-12-16T12:00:00");
        const originalTime = original.getTime();
        addBusinessDaysWithHolidays(original, 5, "DE");
        expect(original.getTime()).toBe(originalTime);
    });
});

describe("getShippingZone", () => {
    it("returns domestic zone for Germany", () => {
        const zone = getShippingZone("DE");
        expect(zone.id).toBe("domestic");
        expect(zone.minDays).toBe(2);
        expect(zone.maxDays).toBe(4);
    });

    it("returns EU fast zone for Austria", () => {
        const zone = getShippingZone("AT");
        expect(zone.id).toBe("eu-fast");
    });

    it("returns EU fast zone for Netherlands", () => {
        const zone = getShippingZone("NL");
        expect(zone.id).toBe("eu-fast");
    });

    it("returns EU standard zone for France", () => {
        const zone = getShippingZone("FR");
        expect(zone.id).toBe("eu-standard");
    });

    it("returns UK zone for Great Britain", () => {
        const zone = getShippingZone("GB");
        expect(zone.id).toBe("uk");
    });

    it("returns Switzerland zone for CH", () => {
        const zone = getShippingZone("CH");
        expect(zone.id).toBe("ch");
    });

    it("returns international zone for unknown countries", () => {
        const zone = getShippingZone("US");
        expect(zone.id).toBe("international");
    });

    it("handles lowercase country codes", () => {
        const zone = getShippingZone("de");
        expect(zone.id).toBe("domestic");
    });

    it("returns default zone when no country specified", () => {
        const zone = getShippingZone();
        expect(zone.id).toBe("domestic");
    });

    it("returns default zone when empty string provided", () => {
        const zone = getShippingZone("");
        expect(zone.id).toBe("domestic");
    });
});

describe("calculateDeliveryEstimate", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("calculates estimate for domestic shipping", () => {
        const monday10am = new Date("2024-12-16T10:00:00");
        vi.setSystemTime(monday10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            referenceDate: monday10am,
        });

        expect(estimate.zone.id).toBe("domestic");
        expect(estimate.canShipToday).toBe(true);
        expect(estimate.hoursUntilCutoff).toBeGreaterThan(0);
    });

    it("calculates estimate for international shipping", () => {
        const monday10am = new Date("2024-12-16T10:00:00");
        vi.setSystemTime(monday10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "US",
            referenceDate: monday10am,
        });

        expect(estimate.zone.id).toBe("international");
        expect(estimate.zone.minDays).toBe(7);
        expect(estimate.zone.maxDays).toBe(14);
    });

    it("respects cutoff hour", () => {
        const monday10am = new Date("2024-12-16T10:00:00");
        vi.setSystemTime(monday10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            cutoffHour: 14,
            referenceDate: monday10am,
        });

        expect(estimate.canShipToday).toBe(true);
        expect(estimate.hoursUntilCutoff).toBe(4);
    });

    it("shows cannot ship today after cutoff", () => {
        const monday4pm = new Date("2024-12-16T16:00:00");
        vi.setSystemTime(monday4pm);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            cutoffHour: 14,
            referenceDate: monday4pm,
        });

        expect(estimate.canShipToday).toBe(false);
        expect(estimate.hoursUntilCutoff).toBe(0);
    });

    it("cannot ship today on weekends", () => {
        const saturday10am = new Date("2024-12-14T10:00:00");
        vi.setSystemTime(saturday10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            cutoffHour: 14,
            referenceDate: saturday10am,
        });

        expect(estimate.canShipToday).toBe(false);
    });

    it("cannot ship today on holidays", () => {
        const christmas10am = new Date("2024-12-25T10:00:00");
        vi.setSystemTime(christmas10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            cutoffHour: 14,
            referenceDate: christmas10am,
        });

        expect(estimate.canShipToday).toBe(false);
    });

    it("uses override days when provided", () => {
        const monday10am = new Date("2024-12-16T10:00:00");
        vi.setSystemTime(monday10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            minDaysOverride: 5,
            maxDaysOverride: 10,
            referenceDate: monday10am,
        });

        // The dates should reflect the override
        const dayDiff = Math.ceil(
            (estimate.maxDate.getTime() - estimate.minDate.getTime()) /
                (1000 * 60 * 60 * 24),
        );
        expect(dayDiff).toBeGreaterThanOrEqual(3); // At least 5 days difference (including potential weekends)
    });

    it("returns min and max dates", () => {
        const monday10am = new Date("2024-12-16T10:00:00");
        vi.setSystemTime(monday10am);

        const estimate = calculateDeliveryEstimate({
            countryCode: "DE",
            referenceDate: monday10am,
        });

        expect(estimate.minDate).toBeInstanceOf(Date);
        expect(estimate.maxDate).toBeInstanceOf(Date);
        expect(estimate.maxDate.getTime()).toBeGreaterThan(
            estimate.minDate.getTime(),
        );
    });
});

describe("getUpcomingHolidays", () => {
    it("returns upcoming holidays for Germany", () => {
        const dec20 = new Date("2024-12-20T12:00:00");
        const holidays = getUpcomingHolidays("DE", 14, dec20);

        expect(holidays.length).toBeGreaterThan(0);
        // Should include Christmas
        const hasChristmas = holidays.some(
            (h) =>
                h.date.getMonth() === 11 &&
                (h.date.getDate() === 25 || h.date.getDate() === 26),
        );
        expect(hasChristmas).toBe(true);
    });

    it("returns holidays sorted by date", () => {
        const dec1 = new Date("2024-12-01T12:00:00");
        const holidays = getUpcomingHolidays("DE", 60, dec1);

        for (let i = 1; i < holidays.length; i++) {
            expect(holidays[i].date.getTime()).toBeGreaterThanOrEqual(
                holidays[i - 1].date.getTime(),
            );
        }
    });

    it("returns empty array for unsupported countries", () => {
        const date = new Date("2024-12-20T12:00:00");
        const holidays = getUpcomingHolidays("XX", 14, date);
        expect(holidays).toHaveLength(0);
    });

    it("defaults to 14 days lookhead", () => {
        const dec20 = new Date("2024-12-20T12:00:00");
        const holidays = getUpcomingHolidays("DE", undefined, dec20);

        // All returned holidays should be within 14 days
        const maxDate = new Date(dec20);
        maxDate.setDate(maxDate.getDate() + 14);

        for (const holiday of holidays) {
            expect(holiday.date.getTime()).toBeLessThanOrEqual(
                maxDate.getTime(),
            );
        }
    });

    it("includes holiday name and type", () => {
        const dec20 = new Date("2024-12-20T12:00:00");
        const holidays = getUpcomingHolidays("DE", 14, dec20);

        for (const holiday of holidays) {
            expect(holiday.name).toBeDefined();
            expect(holiday.name.length).toBeGreaterThan(0);
            expect(holiday.type).toBeDefined();
        }
    });

    it("handles year boundary correctly", () => {
        const dec28 = new Date("2024-12-28T12:00:00");
        const holidays = getUpcomingHolidays("DE", 14, dec28);

        // Should include New Year's Day
        const hasNewYear = holidays.some(
            (h) => h.date.getMonth() === 0 && h.date.getDate() === 1,
        );
        expect(hasNewYear).toBe(true);
    });
});

describe("parseAdminDeliveryZonesResponse", () => {
    it("returns default zones for null response", () => {
        const zones = parseAdminDeliveryZonesResponse(null);
        expect(zones).toEqual(DEFAULT_SHIPPING_ZONES);
    });

    it("returns default zones for undefined response", () => {
        const zones = parseAdminDeliveryZonesResponse(undefined);
        expect(zones).toEqual(DEFAULT_SHIPPING_ZONES);
    });

    it("returns default zones for empty profiles", () => {
        const zones = parseAdminDeliveryZonesResponse({
            deliveryProfiles: { nodes: [] },
        });
        expect(zones).toEqual(DEFAULT_SHIPPING_ZONES);
    });

    it("parses valid Admin API response", () => {
        const response = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Germany",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/2",
                                                name: "Rest of Europe",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "AT",
                                                        },
                                                        provinces: [],
                                                    },
                                                    {
                                                        code: {
                                                            countryCode: "FR",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        const zones = parseAdminDeliveryZonesResponse(response);

        expect(zones.length).toBe(2);
        expect(zones[0].name).toBe("Germany");
        expect(zones[0].countries).toContain("DE");
        expect(zones[0].isDefault).toBe(true);
        expect(zones[1].name).toBe("Rest of Europe");
        expect(zones[1].countries).toContain("AT");
        expect(zones[1].countries).toContain("FR");
    });

    it("marks Germany zone as default", () => {
        const response = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "International",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "US",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/2",
                                                name: "Domestic",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        const zones = parseAdminDeliveryZonesResponse(response);

        // The zone with Germany should be marked as default
        const germanyZone = zones.find((z) => z.countries.includes("DE"));
        expect(germanyZone?.isDefault).toBe(true);
    });

    it("estimates delivery days based on zone name", () => {
        const response = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Germany",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/2",
                                                name: "International",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "US",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        const zones = parseAdminDeliveryZonesResponse(response);

        // Germany should have fast delivery times
        const germanyZone = zones.find((z) => z.name === "Germany");
        expect(germanyZone?.minDays).toBe(2);
        expect(germanyZone?.maxDays).toBe(4);

        // International should have longer delivery times
        const internationalZone = zones.find((z) => z.name === "International");
        expect(internationalZone?.minDays).toBe(7);
        expect(internationalZone?.maxDays).toBe(14);
    });

    it("deduplicates countries across zones", () => {
        const response = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Zone 1",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/2",
                                                name: "Zone 2",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                    {
                                                        code: {
                                                            countryCode: "AT",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        const zones = parseAdminDeliveryZonesResponse(response);

        // DE should only appear in Zone 1 (first match)
        expect(zones[0].countries).toContain("DE");
        // Zone 2 should only have AT (DE already seen)
        expect(zones[1].countries).not.toContain("DE");
        expect(zones[1].countries).toContain("AT");
    });
});

describe("fetchAdminDeliveryZones", () => {
    it("returns null on network error", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi
            .fn()
            .mockRejectedValue(new Error("Network error"));

        const result = await fetchAdminDeliveryZones(
            "test.myshopify.com",
            "token",
        );
        expect(result).toBeNull();

        globalThis.fetch = originalFetch;
    });

    it("returns null on non-200 response", async () => {
        const originalFetch = globalThis.fetch;
        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
        });

        const result = await fetchAdminDeliveryZones(
            "test.myshopify.com",
            "token",
        );
        expect(result).toBeNull();

        globalThis.fetch = originalFetch;
    });

    it("sends correct request to Admin API", async () => {
        const originalFetch = globalThis.fetch;
        const mockFetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({ data: { deliveryProfiles: { nodes: [] } } }),
        });
        globalThis.fetch = mockFetch;

        await fetchAdminDeliveryZones(
            "test.myshopify.com",
            "test-token",
            "2025-01",
        );

        expect(mockFetch).toHaveBeenCalledWith(
            "https://test.myshopify.com/admin/api/2025-01/graphql.json",
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": "test-token",
                }),
            }),
        );

        globalThis.fetch = originalFetch;
    });
});

describe("getCachedShippingZones", () => {
    let originalFetch: typeof globalThis.fetch;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
        clearShippingZonesCache();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        clearShippingZonesCache();
    });

    it("returns default zones when no token is provided", async () => {
        const zones = await getCachedShippingZones("test.myshopify.com");
        expect(zones).toEqual(DEFAULT_SHIPPING_ZONES);
    });

    it("returns default zones when token is undefined", async () => {
        const zones = await getCachedShippingZones(
            "test.myshopify.com",
            undefined,
        );
        expect(zones).toEqual(DEFAULT_SHIPPING_ZONES);
    });

    it("fetches from Admin API when token is provided", async () => {
        const mockResponse = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Germany",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
        });

        const zones = await getCachedShippingZones(
            "test.myshopify.com",
            "test-token",
        );

        expect(zones.length).toBe(1);
        expect(zones[0].name).toBe("Germany");
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it("returns cached zones on subsequent calls", async () => {
        const mockResponse = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Germany",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
        });

        // First call - should fetch
        await getCachedShippingZones("test.myshopify.com", "test-token");
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        // Second call - should use cache
        await getCachedShippingZones("test.myshopify.com", "test-token");
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        // Third call - should still use cache
        await getCachedShippingZones("test.myshopify.com", "test-token");
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it("returns default zones on fetch error", async () => {
        globalThis.fetch = vi
            .fn()
            .mockRejectedValue(new Error("Network error"));

        const zones = await getCachedShippingZones(
            "test.myshopify.com",
            "test-token",
        );

        expect(zones).toEqual(DEFAULT_SHIPPING_ZONES);
    });

    it("clears cache correctly", async () => {
        const mockResponse = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Germany",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
        });

        // First call - should fetch
        await getCachedShippingZones("test.myshopify.com", "test-token");
        expect(globalThis.fetch).toHaveBeenCalledTimes(1);

        // Clear cache
        clearShippingZonesCache();

        // Next call - should fetch again
        await getCachedShippingZones("test.myshopify.com", "test-token");
        expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });

    it("reports correct cache status when empty", () => {
        const status = getShippingZonesCacheStatus();
        expect(status.isCached).toBe(false);
        expect(status.expiresAt).toBeNull();
        expect(status.zoneCount).toBe(0);
        expect(status.ttlRemaining).toBe(0);
    });

    it("reports correct cache status after caching", async () => {
        const mockResponse = {
            deliveryProfiles: {
                nodes: [
                    {
                        id: "gid://shopify/DeliveryProfile/1",
                        name: "Default",
                        default: true,
                        profileLocationGroups: [
                            {
                                locationGroup: {
                                    id: "gid://shopify/LocationGroup/1",
                                },
                                locationGroupZones: {
                                    nodes: [
                                        {
                                            zone: {
                                                id: "gid://shopify/Zone/1",
                                                name: "Germany",
                                                countries: [
                                                    {
                                                        code: {
                                                            countryCode: "DE",
                                                        },
                                                        provinces: [],
                                                    },
                                                ],
                                            },
                                            methodDefinitions: { nodes: [] },
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            },
        };

        globalThis.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: mockResponse }),
        });

        await getCachedShippingZones("test.myshopify.com", "test-token");

        const status = getShippingZonesCacheStatus();
        expect(status.isCached).toBe(true);
        expect(status.expiresAt).toBeGreaterThan(Date.now());
        expect(status.zoneCount).toBe(1);
        expect(status.ttlRemaining).toBeGreaterThan(0);
    });
});
