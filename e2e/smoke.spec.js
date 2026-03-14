/** TEST-004: E2E スモーク。未認証時はログイン画面、認証時はメインUIが表示されることを確認 */
import { test, expect } from '@playwright/test'

test('home loads and shows either login or main UI', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()
  const hasLogin = await page.getByText(/ログインしてタスクを管理/).isVisible().catch(() => false)
  const hasTaskCount = await page.getByText(/件のタスク/).isVisible().catch(() => false)
  expect(hasLogin || hasTaskCount).toBe(true)
})
