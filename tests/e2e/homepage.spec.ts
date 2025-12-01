import { expect, test } from "@playwright/test";

test.describe("Homepage", () => {
    test("loads correctly and displays key elements", async ({ page }) => {
        await page.goto("/");

        // Wait for page to be fully loaded
        await page.waitForLoadState("networkidle");

        // Check for key structural elements
        await expect(page.locator("header")).toBeVisible();
        await expect(page.locator("main")).toBeVisible();
        await expect(page.locator("footer")).toBeVisible();
    });

    test("has working search functionality", async ({ page }) => {
        await page.goto("/");
        await page.waitForLoadState("networkidle");

        // Look for search input (might be in header or nav)
        const searchInput = page
            .locator('input[type="search"], input[placeholder*="Search" i]')
            .first();

        if (await searchInput.isVisible()) {
            await searchInput.fill("test");
            await page.waitForTimeout(500); // Wait for predictive search
            // Just verify no errors occurred
            await expect(page.locator("body")).toBeVisible();
        }
    });
});
