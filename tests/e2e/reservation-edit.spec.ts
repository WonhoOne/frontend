import { expect, test } from '@playwright/test';

import { openEditableReservation } from './support/authenticated-reservation';

/**
 * v0.3 demo scenario 2.2.1: 예약 수정 — 스타일을 그랜드로, 커피 & 샴페인 추가.
 */
test('customer changes the style to Grand and adds coffee and champagne', async ({ page }) => {
  const api = await openEditableReservation(page);

  await expect(page.getByRole('heading', { name: 'Synthetic Trekking' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit trip' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit trip' });
  await expect(dialog).toContainText('3 (cannot be changed)');
  await expect(dialog.getByRole('radio', { name: /Private luxury car/ })).toBeDisabled();

  await dialog.getByRole('radio', { name: 'Grand' }).check();
  await dialog.getByRole('checkbox', { name: 'Coffee' }).check();
  await dialog.getByRole('checkbox', { name: 'Champagne' }).check();
  await dialog.getByRole('button', { name: 'Save changes' }).click();

  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Trip updated.' })).toContainText(
    '5,400,000',
  );
  await expect(page.getByText('Coffee, Champagne')).toBeVisible();
  expect(api.writes).toEqual([
    {
      configuration: {
        style: 'GRAND',
        hotelOption: 'HOTEL_3_STAR',
        transportOption: 'PREMIUM_VAN_10',
        mealOption: 'LUNCH_BOX',
        extraOptions: ['COFFEE', 'CHAMPAGNE'],
      },
    },
  ]);
});
