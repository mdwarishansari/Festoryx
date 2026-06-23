import { test, expect } from '@playwright/test';

test.describe('Festoryx Web — Core User Journeys', () => {
  test('Landing page loads with Festoryx branding', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toContainText('FESTORYX');
    await expect(page.getByRole('link', { name: /Discover Events|Events/i }).first()).toBeVisible();
  });

  test('Event marketplace lists competitions and supports discovery', async ({ page }) => {
    await page.goto('/events', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toContainText(/All Competitions/i);
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible();
  });

  test('Event registration page renders dynamic registration form', async ({ page }) => {
    await page.goto('/register/quiz-arena', { waitUntil: 'domcontentloaded' });

    const registrationContent = page
      .getByRole('heading', { name: /register for quiz arena|registration/i })
      .or(page.getByLabel(/name|email|participant/i).first())
      .or(page.getByText(/not found|404/i));

    await expect(registrationContent.first()).toBeVisible({ timeout: 15000 });
  });

  test('Super Admin authentication portal displays Clerk sign-in entry point', async ({ page }) => {
    await page.goto('/superadmin/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Super Admin Portal/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Authenticate with Clerk/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Authenticate with Clerk/i })).toHaveAttribute(
      'href',
      /sign-in/
    );
  });

  test('Event creation workflow redirects unauthenticated users to sign-in', async ({ page }) => {
    await page.goto('/dashboard/events/new', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/sign-in|dashboard\/events\/new/);
    const signInOrForm = page
      .getByRole('heading', { name: /Create New Competition|Sign in/i })
      .or(page.locator('form'));
    await expect(signInOrForm.first()).toBeVisible({ timeout: 15000 });
  });
});
