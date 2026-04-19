import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('should navigate to Night Analysis page', async ({ page }) => {
    await page.click('text=Night Analysis');
    await expect(page).toHaveURL(/\/analysis/);
    await expect(page.locator('h1')).toContainText('Night Analysis');
  });

  test('should navigate to Mood vs Sleep page', async ({ page }) => {
    await page.click('text=Mood');
    await expect(page).toHaveURL(/\/mood/);
    await expect(page.locator('h1')).toContainText('Mood');
  });

  test('should navigate to Environment Impact page', async ({ page }) => {
    await page.click('text=Environment');
    await expect(page).toHaveURL(/\/environment/);
    await expect(page.locator('h1')).toContainText('Environmental Impact');
  });

  test('should navigate to Model Comparison page', async ({ page }) => {
    await page.click('text=Model');
    await expect(page).toHaveURL(/\/models/);
    await expect(page.locator('h1')).toContainText('Model Comparison');
  });

  test('each page should render its primary heading', async ({ page }) => {
    const routes = [
      { path: '/dashboard',    heading: 'Sleep Overview' },
      { path: '/analysis',     heading: 'Night Analysis' },
      { path: '/mood',         heading: 'Mood' },
      { path: '/environment',  heading: 'Environmental Impact' },
      { path: '/models',       heading: 'Model Comparison' },
    ];
    for (const { path, heading } of routes) {
      await page.goto(path);
      await expect(page.locator('h1')).toContainText(heading);
    }
  });
});
