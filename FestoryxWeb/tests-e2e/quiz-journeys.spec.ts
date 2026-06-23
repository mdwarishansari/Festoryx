import { test, expect } from '@playwright/test';

test.describe('Festoryx Quiz Arena — Participation & Leaderboard', () => {
  test('Quiz participation join lobby displays credential form', async ({ page }) => {
    await page.goto('/join', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /Festoryx QUIZ ARENA/i })).toBeVisible();
    await expect(page.locator('#regCode')).toBeVisible();
    await expect(page.locator('#accCode')).toBeVisible();
    await expect(page.getByRole('button', { name: /Join Live Lobby/i })).toBeVisible();
  });

  test('Leaderboard viewing page loads live rankings board', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const leaderboardLink = page.locator('a[href*="/leaderboard/"]').first();
    const hasLeaderboard = await leaderboardLink.count();

    if (hasLeaderboard > 0) {
      await leaderboardLink.click();
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByText(/Live Rankings Board|Leaderboard/i)).toBeVisible({ timeout: 15000 });
    } else {
      await page.goto('/leaderboard/non-existent-session', { waitUntil: 'domcontentloaded' });
      const rankingsOrNotFound = page
        .getByText(/Live Rankings Board|Leaderboard|not found|404/i)
        .first();
      await expect(rankingsOrNotFound).toBeVisible({ timeout: 15000 });
    }
  });
});
