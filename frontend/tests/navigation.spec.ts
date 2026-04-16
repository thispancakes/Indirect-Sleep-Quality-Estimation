import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to Night Analysis page', async ({ page }) => {
    await page.click('text=Night Analysis');
    await expect(page).toHaveURL(/\/analysis/);
    await expect(page.locator('h1')).toContainText('Night Analysis');
  });

  test('should navigate to Mood vs Sleep page', async ({ page }) => {
    await page.click('text=Mood vs Sleep');
    await expect(page).toHaveURL(/\/mood/);
    await expect(page.locator('h1')).toContainText('Mood & Cognitive Correlation');
  });

  test('should navigate to Environment Impact page', async ({ page }) => {
    await page.click('text=Environment');
    await expect(page).toHaveURL(/\/environment/);
    await expect(page.locator('h1')).toContainText('Environmental Impact');
  });

  test('should navigate to Model Comparison page', async ({ page }) => {
    await page.click('text=Model Comparison');
    await expect(page).toHaveURL(/\/models/);
    await expect(page.locator('h1')).toContainText('Model Comparison');
  });

  test('should return to Overview when clicking sidebar logo', async ({ page }) => {
    await page.click('text=Night Analysis');
    await page.click('text=Sleep Analytics');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Sleep Overview');
  });
});
