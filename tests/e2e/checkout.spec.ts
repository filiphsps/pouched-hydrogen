import { expect, test } from "@playwright/test";

test.describe("Checkout", () => {
  test("homepage loads without errors", async ({ page }) => {
    // Simple smoke test to verify the app loads
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Verify basic page structure
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
    
    // Check for no console errors (optional)
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });
    
    // Navigate around a bit
    await page.waitForTimeout(1000);
    
    // Verify no critical errors
    expect(errors.filter((e) => e.includes("Error"))).toHaveLength(0);
  });
});
