/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
  testDir: 'e2e',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  timeout: 15000,
}
