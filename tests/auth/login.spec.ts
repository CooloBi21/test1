import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  const email = process.env.PLAYWRIGHT_TEST_EMAIL;
  const password = process.env.PLAYWRIGHT_TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD must be configured in .env.local',
    );
  }

  await page.goto('/login');

  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();

  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);

  await page.locator('button[type="submit"]').click();

  await expect(page).not.toHaveURL(/\/login/);
});