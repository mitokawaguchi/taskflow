/** TEST-004: E2E スモーク。未認証時はログイン画面、認証時はメインUIが表示されることを確認 */
import { test, expect } from '@playwright/test'

test('home loads and shows either login or main UI', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toBeVisible()
  const hasLogin = await page.getByText(/ログインしてタスクを管理/).isVisible().catch(() => false)
  const hasTaskCount = await page.getByText(/件のタスク/).isVisible().catch(() => false)
  expect(hasLogin || hasTaskCount).toBe(true)
})

test('legal links are visible', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: '利用規約' })).toBeVisible({ timeout: 10000 })
})

test('view title or menu is visible when main UI shown', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const body = await page.locator('body').textContent()
  const hasUi = body && (body.includes('プロジェクト') || body.includes('カンバン') || body.includes('ログイン'))
  expect(hasUi).toBe(true)
})
