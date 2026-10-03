import { expect, test, type Page } from '@playwright/test';

const storageKey = 'mister-world:reservation-draft:v2';

const baseDraft = {
  schemaVersion: 2,
  tourProductId: 42,
  tourScheduleId: 7,
  tourStyle: 'GRAND',
  participantCount: null,
  configuration: {
    hotelSelectionKey: null,
    transportSelectionKey: null,
    mealSelectionKey: null,
    extraSelectionKeys: [],
  },
  updatedAt: 1,
};

async function seedDraft(page: Page, draft = baseDraft) {
  await page.addInitScript(
    ({ key, value }) => {
      if (window.sessionStorage.getItem(key) === null) {
        window.sessionStorage.setItem(key, JSON.stringify(value));
      }
    },
    { key: storageKey, value: draft },
  );
}

async function completeConfiguration(page: Page) {
  await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
  await page.getByRole('radio', { name: /Fixture hotel A/i }).check();
  await page.getByRole('radio', { name: /Fixture transport B/i }).check();
  await page.getByRole('radio', { name: /Fixture meal A/i }).check();
}

test('Configure → Review → browser Back preserves the transaction Draft', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedDraft(page);
  await page.goto('/tours/42/configure');
  await completeConfiguration(page);

  await page.getByRole('button', { name: 'Review trip' }).click();

  await expect(page).toHaveURL('/reservation/review');
  await expect(page.getByRole('heading', { name: 'Review your trip' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Change configuration' })).toHaveAttribute(
    'href',
    '/tours/42/configure',
  );

  await page.goBack();

  await expect(page).toHaveURL('/tours/42/configure');
  await expect(page.getByRole('radio', { name: /Fixture hotel A/i })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Fixture transport B/i })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();
  await expect(page.getByRole('spinbutton', { name: /participants/i })).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();
});

test('refresh rehydrates the same Configure selections from sessionStorage', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedDraft(page);
  await page.goto('/tours/42/configure');
  await completeConfiguration(page);

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = window.sessionStorage.getItem(key);
        if (stored === null) {
          return null;
        }

        const parsed = JSON.parse(stored) as unknown;
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return null;
        }

        const record = parsed as Record<string, unknown>;
        return {
          participantCount: record.participantCount,
          configuration: record.configuration,
        };
      }, storageKey),
    )
    .toMatchObject({
      participantCount: 2,
      configuration: {
        hotelSelectionKey: 'fixture:hotel:a',
        transportSelectionKey: 'fixture:transport:b',
        mealSelectionKey: 'fixture:meal:a',
      },
    });

  await page.reload();

  await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Fixture hotel A/i })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Fixture transport B/i })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Fixture meal A/i })).toBeChecked();
  await expect(page.getByRole('spinbutton', { name: /participants/i })).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();
});

test('a route mismatch preserves the saved trip and offers an explicit resume path', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedDraft(page, {
    ...baseDraft,
    tourProductId: 43,
  });
  await page.goto('/tours/44/configure');

  await expect(
    page.getByRole('heading', { name: 'This route does not match your saved trip' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Resume saved trip' })).toHaveAttribute(
    'href',
    '/tours/43/configure',
  );

  const storedProduct = await page.evaluate((key) => {
    const stored = window.sessionStorage.getItem(key);
    if (stored === null) {
      return null;
    }

    const parsed = JSON.parse(stored) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null;
    }

    const tourProductId = (parsed as Record<string, unknown>).tourProductId;
    return typeof tourProductId === 'number' ? tourProductId : null;
  }, storageKey);
  expect(storedProduct).toBe(43);
});

test('corrupt sessionStorage is cleared and shown as a calm recovery state', async ({ page }) => {
  await page.addInitScript((key) => {
    window.sessionStorage.setItem(key, '{not-json');
  }, storageKey);
  await page.goto('/tours/42/configure');

  await expect(
    page.getByRole('heading', { name: 'Saved trip could not be restored' }),
  ).toBeVisible();
  expect(await page.evaluate((key) => window.sessionStorage.getItem(key), storageKey)).toBeNull();
});

test('direct Review without a Draft recovers to Tours instead of showing a false review', async ({
  page,
}) => {
  await page.goto('/reservation/review');

  await expect(page.getByRole('heading', { name: 'No trip to review' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Browse tours' })).toHaveAttribute('href', '/tours');
});
