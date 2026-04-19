import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should display the main title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sleep Overview');
  });

  test('should render the three core metric cards', async ({ page }) => {
    await expect(page.locator('text=Sleep Quality Score')).toBeVisible();
    await expect(page.locator('text=Disturbance Score')).toBeVisible();
    await expect(page.locator('text=Total Sleep Duration')).toBeVisible();
  });

  test('should render at least one recharts container', async ({ page }) => {
    const chart = page.locator('.recharts-responsive-container').first();
    await expect(chart).toBeVisible();
  });

  test('should show trend chart with correct title', async ({ page }) => {
    await expect(page.locator('text=Sleep Quality Trend')).toBeVisible();
  });

  test('should show data summary section', async ({ page }) => {
    await expect(page.locator('text=Data Summary')).toBeVisible();
    await expect(page.locator('text=Quality Distribution')).toBeVisible();
  });
});
