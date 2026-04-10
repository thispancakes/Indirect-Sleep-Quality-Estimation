import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main title and welcome message', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sleep Overview');
    await expect(page.locator('p')).toContainText("Welcome back! Here's your sleep analysis for this week.");
  });

  test('should render the three core metric cards', async ({ page }) => {
    // Quality Score Card
    const qualityCard = page.locator('div:has-text("Sleep Quality Score")').first();
    await expect(qualityCard).toBeVisible();

    // Disturbance Card
    const disturbanceCard = page.locator('div:has-text("Disturbance Level")').first();
    await expect(disturbanceCard).toBeVisible();

    // Duration Card
    const durationCard = page.locator('div:has-text("Total Sleep Duration")').first();
    await expect(durationCard).toBeVisible();
  });

  test('should render the trend chart', async ({ page }) => {
    // Recharts container
    const chartContainer = page.locator('.recharts-responsive-container');
    await expect(chartContainer).toBeVisible();
  });

  test('should display recommended action cards', async ({ page }) => {
    await expect(page.locator('h3:has-text("Recommended Actions")')).toBeVisible();
    await expect(page.locator('text=Reduce light exposure')).toBeVisible();
    await expect(page.locator('text=Optimal Temperature')).toBeVisible();
  });
});
