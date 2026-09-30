import { expect, test, type Page } from '@playwright/test';

const reservationDraftStorageKey = 'mister-world:reservation-draft:v1';

const staleDifferentTourDraft = {
  schemaVersion: 1,
  tourProductId: 'tour-old',
  tourScheduleId: 'schedule-old',
  tourStyle: 'PREMIUM',
  participantCount: 8,
  configuration: {
    hotelSelectionKey: 'fixture:hotel:b',
    transportSelectionKey: 'fixture:transport:b',
    mealSelectionKey: 'fixture:meal:b',
    extraSelectionKeys: ['fixture:extras:a'],
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
    await page.goto('/tours/demo-golf-product-a');

    const configure = page.getByRole('button', { name: 'Configure this trip' });

    await expect(
      page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
    ).toBeVisible();
    await expect(configure).toBeDisabled();

    await page.getByRole('radio', { name: /Grand/ }).click();
    await expect(configure).toBeDisabled();

    await page.getByRole('radio', { name: /Schedule preview A/ }).click();
    await expect(configure).toBeEnabled();

    await configure.click();

    await expect(page).toHaveURL(/\/tours\/demo-golf-product-a\/configure$/);
    await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
    await expect(page.getByText(/Fixture theme · Grand · Fixture schedule/)).toBeVisible();

    await expect(page.getByRole('spinbutton', { name: /participants/i })).toHaveValue('');
    await expect(page.getByRole('radio', { name: /Fixture hotel A/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Fixture hotel B/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Fixture transport A/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Fixture transport B/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Fixture meal A/i })).not.toBeChecked();
    await expect(page.getByRole('radio', { name: /Fixture meal B/i })).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeDisabled();

    await expect
      .poll(() =>
        page.evaluate(
          ({ key, productId }) =>
            window.sessionStorage.getItem(key)?.includes(`"tourProductId":"${productId}"`) ?? false,
          {
            key: reservationDraftStorageKey,
            productId: 'demo-golf-product-a',
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
      tourProductId: 'demo-golf-product-a',
      tourScheduleId: 'preview-golf_challenge-a',
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
      tourProductId: 'tour-old',
      tourScheduleId: 'schedule-old',
      participantCount: 8,
      configuration: {
        hotelSelectionKey: 'fixture:hotel:b',
        transportSelectionKey: 'fixture:transport:b',
        mealSelectionKey: 'fixture:meal:b',
        extraSelectionKeys: ['fixture:extras:a'],
      },
    });
  });
});
