import { test, expect } from '@playwright/test';
test('set monthly money, allocate by date, redistribute, and verify remaining', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Monthly money (₹)').fill('50000');
  await page.getByRole('button', { name: 'Open my calendar' }).click();
  await page.getByRole('button', { name: /August 1/ }).click();
  await page.getByRole('button', { name: '+ Add expense' }).click();
  await page.getByLabel('Description').fill('Groceries');
  await page.getByLabel('Direct amount (₹)').fill('5000');
  await page.getByRole('button', { name: 'Save allocation' }).click();
  await expect(page.getByText('₹45,000')).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Direct amount (₹)').fill('4000');
  await page.getByRole('button', { name: 'Save allocation' }).click();
  await expect(page.getByText('₹46,000')).toBeVisible();
});
