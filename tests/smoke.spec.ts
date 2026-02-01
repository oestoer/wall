import { test, expect } from '@playwright/test';

test.describe('Wall Line Calculator - Smoke Tests', () => {
    test('should load the application successfully', async ({ page }) => {
        await page.goto('/');

        // Verify the page title
        await expect(page).toHaveTitle(/Wall Line Calculator/);

        // Verify the main heading is visible
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
        await expect(heading).toContainText('Wall Line Calculator');
    });

    test('should display all main form sections', async ({ page }) => {
        await page.goto('/');

        // Check that all main sections are present using more specific selectors
        await expect(page.locator('summary:has-text("📏 Wall Dimensions")')).toBeVisible();
        await expect(page.locator('summary:has-text("📐 Line Configuration")')).toBeVisible();
        await expect(page.locator('summary:has-text("🎨 Colours")')).toBeVisible();
        await expect(page.locator('summary:has-text("🚪 Wardrobe/Door")')).toBeVisible();
        await expect(page.locator('summary:has-text("🪟 Window")')).toBeVisible();
    });

    test('should have all required input fields', async ({ page }) => {
        await page.goto('/');

        // Verify required inputs exist
        await expect(page.locator('#wallLength')).toBeVisible();
        await expect(page.locator('#wallHeight')).toBeVisible();
        await expect(page.locator('#minThickness')).toBeVisible();
        await expect(page.locator('#maxThickness')).toBeVisible();
        await expect(page.locator('#lineRatio')).toBeVisible();
        await expect(page.locator('#lineConfig')).toBeVisible();
    });

    test('should display visualization container', async ({ page }) => {
        await page.goto('/');

        // Verify the wall container is present
        const wallContainer = page.locator('#wall-container');
        await expect(wallContainer).toBeVisible();
    });

    test('should allow basic interaction with inputs', async ({ page }) => {
        await page.goto('/');

        // Test that we can interact with wall length input
        const wallLengthInput = page.locator('#wallLength');
        await wallLengthInput.clear();
        await wallLengthInput.fill('500');
        await expect(wallLengthInput).toHaveValue('500');

        // Test that we can interact with wall height input
        const wallHeightInput = page.locator('#wallHeight');
        await wallHeightInput.clear();
        await wallHeightInput.fill('300');
        await expect(wallHeightInput).toHaveValue('300');
    });

    test('should have submit button', async ({ page }) => {
        await page.goto('/');

        // Verify the calculate button exists
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeVisible();
        await expect(submitButton).toContainText('Calculate');
    });

    test('should have reset button', async ({ page }) => {
        await page.goto('/');

        // Verify the reset button exists
        const resetButton = page.locator('button:has-text("Reset")');
        await expect(resetButton).toBeVisible();
    });

    test('should have hamburger menu', async ({ page }) => {
        await page.goto('/');

        // Verify the hamburger menu exists
        const hamburgerMenu = page.locator('#hamburger-menu');
        await expect(hamburgerMenu).toBeVisible();
    });

    test('should toggle side menu when hamburger is clicked', async ({ page }) => {
        await page.goto('/');

        const hamburgerMenu = page.locator('#hamburger-menu');
        const sideMenu = page.locator('#side-menu');

        // Initially, side menu should not be visible (aria-hidden=true)
        await expect(sideMenu).toHaveAttribute('aria-hidden', 'true');

        // Click hamburger menu
        await hamburgerMenu.click();

        // Wait a bit for animation
        await page.waitForTimeout(300);

        // Side menu should now be visible (aria-hidden=false)
        await expect(sideMenu).toHaveAttribute('aria-hidden', 'false');
    });

    test('should generate wall visualization when configuration is selected', async ({ page }) => {
        await page.goto('/');

        // Wait for the line configuration dropdown to be populated
        const lineConfig = page.locator('#lineConfig');
        await expect(lineConfig).toBeVisible();

        // Select the second option (first valid configuration)
        // We use index 1 because index 0 is the "Select a configuration" placeholder
        await lineConfig.selectOption({ index: 1 });

        // Verify that lines are generated in the visualization
        const wallContainer = page.locator('#wall-container');
        const lines = wallContainer.locator('.line');

        // Should have at least one line
        await expect(lines.first()).toBeVisible();

        // Verify we have multiple lines (it should generate many lines based on default settings)
        const count = await lines.count();
        expect(count).toBeGreaterThan(0);
    });
});
