import { defineConfig, devices } from '@playwright/test';

const QUIZ_BASE_URL = process.env.PLAYWRIGHT_QUIZ_URL || 'http://localhost:3002';

export default defineConfig({
  testDir: './tests-e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'festoryx-web',
      testMatch: /web-journeys\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'festoryx-quiz',
      testMatch: /quiz-journeys\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: QUIZ_BASE_URL,
      },
    },
  ],
  webServer: [
    {
      command: 'npm run start',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'npm run start',
      cwd: '../FestoryxQuiz',
      url: QUIZ_BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
