import { test, expect } from '@playwright/test';

test('user loads homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Web Eye Tracker/i);
});

test('user clicks button', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Click me');
  await expect(page.locator('text=Clicked!')).toBeVisible();
});
