import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for Filament Mobile Bottom Navigation Plugin
 *
 * Tests mobile navigation behavior on iOS Safari and Chrome Mobile with
 * accessibility scanning via axe-core.
 */
export default defineConfig({
  testDir: './tests/Browser',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Limit workers on CI to avoid resource issues
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: 'html',

  // Shared settings for all tests
  use: {
    // Base URL for tests (Laravel default)
    baseURL: 'http://localhost:8000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot only on failure
    screenshot: 'only-on-failure',

    // Video only on failure
    video: 'retain-on-failure',
  },

  // Configure projects for major mobile browsers
  projects: [
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 14 Pro'],
        // Override viewport for consistency
        viewport: { width: 390, height: 844 },
      },
    },

    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
        // Override viewport for consistency
        viewport: { width: 412, height: 915 },
      },
    },
  ],

  // Run local dev server before starting tests (optional)
  // webServer: {
  //   command: 'php artisan serve',
  //   url: 'http://localhost:8000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
