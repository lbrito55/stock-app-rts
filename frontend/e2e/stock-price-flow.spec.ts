import { test, expect } from '@playwright/test';

test.describe('Stock Price Checker E2E Flow', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();

    await page.goto('http://localhost:3000');

    await page.evaluate(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
    });
  });

  test('complete user flow: sign up → login → search stock → logout', async ({
    page,
  }) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpass123';

    await page.goto('http://localhost:3000');
    await expect(page).toHaveURL(/.*login/);

    await page.click('text=Sign up here');
    await expect(page).toHaveURL(/.*signup/);

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button:has-text("Sign up")');

    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    await expect(page.locator('text=Registration successful')).toBeVisible();

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button:has-text("Login")');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h2:has-text("Look up")')).toBeVisible();

    await page.fill('input[name="symbol"]', 'AAPL');
    await page.click('button:has-text("Get Stock Price")');

    await expect(page.locator('text=Opening Price:')).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('text=Current Price:')).toBeVisible();

    await page.click('button:has-text("Logout")');

    await expect(page).toHaveURL(/.*login/);
  });

  test('protects dashboard route when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');

    await expect(page).toHaveURL(/.*login/);
  });

  test('handles invalid login credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button:has-text("Login")');

    await expect(page.locator('.error-message')).toBeVisible({ timeout: 5000 });

    // Update this to match the actual error message from the backend
    await expect(page.locator('.error-message')).toContainText("Incorrect email or password");
  });
});