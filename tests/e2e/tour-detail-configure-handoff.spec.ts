import { expect, test, type Page } from '@playwright/test';

const reservationDraftStorageKey = 'mister-world:reservation-draft:v1';

const staleDifferentTourDraft = {
  schemaVersion: 1,
  tourProductId: '104',
  tourScheduleId: '1401',
  tourStyle: 'PREMIUM',
  participantCount: 8,
  configuration: {
    hotelSelectionKey: 'HOTEL_5_STAR',
    transportSelectionKey: 'PREMIUM_VAN_10',
    mealSelectionKey: 'PREMIUM_RESTAURANT',
    extraSelectionKeys: ['CHAMPAGNE'],
  },
  updatedAt: 1,
};

async function seedStaleTransaction(page: Page) {
  await page.addInitScript(
    ({ key, draft }) => {
      window.sessionStorage.setItem(key, JSON.stringify(draft));
    },
    {
      key: reservationDraftStorageKey,
      draft: staleDifferentTourDraft,
    },
  );
}

test.describe('Tour Detail → Configure transaction handoff', () => {
  test('replaces a prior transaction atomically with the explicit Tour, Style, and Schedule choices', async ({
    page,
  }) => {
    await seedStaleTransaction(page);
    await page.goto('/tours/103');

    const configure = page.getByRole('button', { name: 'Configure this trip' });

    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
    await expect(configure).toBeDisabled();

    await page.getByRole('radio', { name: /Grand/ }).click();
    await expect(configure).toBeDisabled();

    await page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ }).click();
    await expect(configure).toBeEnabled();

    await configure.click();

    await expect(page).toHaveURL(/\/tours\/103\/configure$/);
    await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
    await expect(page.getByText(/Golf Challenge · Grand · 2027-03-10 – 2027-03-14/)).toBeVisible();

    await expect(page.getByRole('spinbutton', { name: /participants/i })).toHaveValue('');
    await expect(page.getByRole('radio', { name: /4-star hotel/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /5-star hotel/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Private luxury car \(2\)/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Premium van \(10\)/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Local restaurant/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Premium restaurant/i })).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeDisabled();

    await expect
      .poll(() =>
        page.evaluate(
          ({ key, productId }) =>
            window.sessionStorage.getItem(key)?.includes(`"tourProductId":"${productId}"`) ?? false,
          {
            key: reservationDraftStorageKey,
            productId: '103',
          },
        ),
      )
      .toBe(true);

    const serialized = await page.evaluate(
      (key) => window.sessionStorage.getItem(key),
      reservationDraftStorageKey,
    );

    expect(serialized).not.toBeNull();

    const persisted = JSON.parse(serialized ?? 'null') as unknown;

    expect(persisted).toMatchObject({
      schemaVersion: 1,
      tourProductId: '103',
      tourScheduleId: '1301',
      tourStyle: 'GRAND',
      participantCount: null,
      configuration: {
        hotelSelectionKey: null,
        transportSelectionKey: null,
        mealSelectionKey: null,
        extraSelectionKeys: [],
      },
    });
    expect(persisted).not.toMatchObject({
      tourProductId: '104',
      tourScheduleId: '1401',
      participantCount: 8,
      configuration: {
        hotelSelectionKey: 'HOTEL_5_STAR',
        transportSelectionKey: 'PREMIUM_VAN_10',
        mealSelectionKey: 'PREMIUM_RESTAURANT',
        extraSelectionKeys: ['CHAMPAGNE'],
      },
    });
  });
});
