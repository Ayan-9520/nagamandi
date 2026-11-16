import { expect, test } from '@playwright/test'

test('introduction, sign-in, licence desk and an empty password are handled', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.getByRole('banner').getByRole('link', { name: 'Enter the desk' }).click()
  await expect(page).toHaveURL(/\/login/)

  await page.getByRole('button', { name: 'Enter desk' }).click()
  await expect(page.getByText('Choose a demonstration desk.')).toBeVisible()

  await page.getByRole('button', { name: /Super Admin/ }).click()
  await page.getByRole('button', { name: 'Use published password' }).click()
  await page.getByRole('button', { name: 'Enter desk' }).click()
  await expect(page.getByRole('heading', { name: 'Super Admin' })).toBeVisible()

  await page.getByRole('link', { name: 'Licences', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Licence desk' })).toBeVisible()
})

test('a parking operator cannot open finance', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Parking/ }).click()
  await page.getByRole('button', { name: 'Use published password' }).click()
  await page.getByRole('button', { name: 'Enter desk' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.goto('/finance')
  await expect(page).toHaveURL(/\/unauthorized/)
  await expect(page.getByRole('heading', { name: 'Outside this role' })).toBeVisible()
})

test('seller parchi preview renders without printing', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Super Admin/ }).click()
  await page.getByRole('button', { name: 'Use published password' }).click()
  await page.getByRole('button', { name: 'Enter desk' }).click()
  await expect(page.getByRole('heading', { name: 'Super Admin' })).toBeVisible()
  await page.goto('/trading/DEMO-TRD-6101/seller-parchi')
  await expect(page.getByRole('heading', { name: 'Seller parchi' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Print/ })).toBeVisible()
  await page.goto('/trading/DEMO-TRD-6101/buyer-parchi')
  await expect(page.getByRole('heading', { name: 'Buyer parchi' })).toBeVisible()
})

test('command matrix pages its rows and the field desk keeps typed QR entry', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('button', { name: /Super Admin/ }).click()
  await page.getByRole('button', { name: 'Use published password' }).click()
  await page.getByRole('button', { name: 'Enter desk' }).click()
  await expect(page.getByRole('heading', { name: 'Super Admin' })).toBeVisible()
  await page.goto('/compliance')
  await expect(page.getByText(/Showing 1–4 of \d+ demonstration rows/)).toBeVisible()
  await page.goto('/field')
  await expect(page.getByRole('button', { name: 'Use typed code' })).toBeVisible()
  await page.getByRole('button', { name: 'Scan QR' }).click()
  await expect(page.getByText(/camera was not opened|camera could not be opened/)).toBeVisible()
})
