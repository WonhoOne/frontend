import { expect, test, type Locator, type Page } from '@playwright/test';

const storageKey = 'mister-world:reservation-draft:v1';
const fixture = '/tests/e2e/fixtures/configure-states.html';

const draft = {
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
  updatedAt: 1,
};

async function seedDraft(page: Page) {
  await page.addInitScript((value: typeof draft) => {
    window.sessionStorage.setItem('mister-world:reservation-draft:v1', JSON.stringify(value));
  }, draft);
}

async function tabUntilFocused(page: Page, locator: Locator, maxTabs = 30) {
  for (let index = 0; index < maxTabs; index += 1) {
    if (await locator.evaluate((element) => element === document.activeElement)) {
      return;
    }

    await page.keyboard.press('Tab');
  }

  expect(await locator.evaluate((element) => element === document.activeElement)).toBe(true);
}

test('keyboard-only users can complete Configure and enter Review', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  const participantInput = page.getByRole('spinbutton', { name: /participants/i });
  await tabUntilFocused(page, participantInput);
  await page.keyboard.type('2');

  const hotelA = page.getByRole('radio', { name: /4-star hotel/i });
  await tabUntilFocused(page, hotelA);
  const hotelCardOutline = await hotelA.locator('xpath=ancestor::div[1]').evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(hotelCardOutline.style).not.toBe('none');
  expect(hotelCardOutline.width).not.toBe('0px');
  await page.keyboard.press('Space');

  const transportA = page.getByRole('radio', { name: /Private luxury car \(2\)/i });
  await tabUntilFocused(page, transportA);
  await page.keyboard.press('Space');

  const mealA = page.getByRole('radio', { name: /Local restaurant/i });
  await tabUntilFocused(page, mealA);
  await page.keyboard.press('Space');

  const review = page.getByRole('button', { name: 'Review trip' });
  await tabUntilFocused(page, review);
  await expect(review).toBeEnabled();
  await page.keyboard.press('Enter');

  await expect(page).toHaveURL('/reservation/review');
  await expect(page.getByRole('main')).toBeFocused();
});

test('Configure exposes one H1 and named selection groups for screen-reader navigation', async ({
  page,
}) => {
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: 'Configure' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Hotel' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Transport' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Meal' })).toBeVisible();
});

test('participant validation exposes a programmatic error relationship', async ({ page }) => {
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  const input = page.getByRole('spinbutton', { name: /participants/i });
  await input.fill('0');

  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const describedBy = await input.getAttribute('aria-describedby');
  expect(describedBy).not.toBeNull();

  const message = page.locator(`#${describedBy ?? ''}`);
  await expect(message).toBeVisible();
  await expect(message).toContainText('at least 1 participant');
});

test('rapid option changes keep the latest intent without resetting sibling groups', async ({
  page,
}) => {
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  await page.getByRole('spinbutton', { name: /participants/i }).fill('2');
  await page.getByRole('radio', { name: /Private luxury car \(2\)/i }).check();
  await page.getByRole('radio', { name: /Local restaurant/i }).check();

  await page.getByRole('radio', { name: /4-star hotel/i }).click();
  await page.getByRole('radio', { name: /5-star hotel/i }).click();

  await expect(page.getByRole('radio', { name: /5-star hotel/i })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Private luxury car \(2\)/i })).toBeChecked();
  await expect(page.getByRole('radio', { name: /Local restaurant/i })).toBeChecked();

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.sessionStorage.getItem(key);
        if (raw === null) {
          return null;
        }

        const parsed = JSON.parse(raw) as unknown;
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          return null;
        }

        const configuration = (parsed as Record<string, unknown>).configuration;
        if (
          typeof configuration !== 'object' ||
          configuration === null ||
          Array.isArray(configuration)
        ) {
          return null;
        }

        return configuration as Record<string, unknown>;
      }, storageKey),
    )
    .toMatchObject({
      hotelSelectionKey: 'HOTEL_5_STAR',
      transportSelectionKey: 'PRIVATE_LUXURY_CAR_2',
      mealSelectionKey: 'LOCAL_RESTAURANT',
    });
});

test('interactive Configure targets remain touch-sized on a 320px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  const targets = [
    page.getByRole('spinbutton', { name: /participants/i }),
    page.getByRole('radio', { name: /4-star hotel/i }).locator('xpath=ancestor::label[1]'),
    page.getByRole('button', { name: 'Open trip summary' }),
    page.getByRole('button', { name: 'Review' }),
  ];

  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

for (const width of [320, 390, 430, 640, 768, 1024, 1280]) {
  test(`Configure has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 760 });
    await seedDraft(page);
    await page.goto('/tours/103/configure');

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);
  });
}

test('a contracted mobile viewport does not leave the focused participant input behind the fixed bar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await seedDraft(page);
  await page.goto('/tours/103/configure');

  const input = page.getByRole('spinbutton', { name: /participants/i });
  await input.focus();
  await page.setViewportSize({ width: 390, height: 420 });
  await input.scrollIntoViewIfNeeded();

  const bar = page.getByRole('complementary', { name: 'Mobile trip summary' });
  const [inputBox, barBox] = await Promise.all([input.boundingBox(), bar.boundingBox()]);

  expect(inputBox).not.toBeNull();
  expect(barBox).not.toBeNull();
  expect((inputBox?.y ?? 0) + (inputBox?.height ?? 0)).toBeLessThanOrEqual(barBox?.y ?? 0);
});

test.describe('Configure browser state matrix', () => {
  test('loading uses geometry skeletons and reduced motion disables shimmer', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`${fixture}?state=loading`);

    const loading = page.getByLabel('Transport options loading');
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByTestId('configuration-option-skeleton')).toHaveCount(2);
    await expect(page.getByRole('progressbar')).toHaveCount(0);

    expect(
      await page
        .locator('[data-skeleton-variant]')
        .first()
        .evaluate((element) => getComputedStyle(element, '::after').animationName),
    ).toBe('none');

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);
  });

  test('500-style group failure stays local and retry is scoped to that group', async ({
    page,
  }) => {
    await page.goto(`${fixture}?state=500`);

    await expect(
      page.getByRole('heading', { name: 'Transport options unavailable' }),
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: /4-star hotel/i })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Local restaurant/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeDisabled();

    await page.getByRole('button', { name: 'Retry Transport' }).click();
    await expect(page.getByTestId('configure-retry-result')).toHaveText('group:transport');
  });

  test('partial failure preserves successful groups and isolates Review blocking', async ({
    page,
  }) => {
    await page.goto(`${fixture}?state=partial-failure`);

    await expect(
      page.getByRole('heading', { name: 'Transport options unavailable' }),
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: /4-star hotel/i })).toBeChecked();
    await expect(page.getByRole('radio', { name: /Local restaurant/i })).toBeChecked();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeDisabled();
  });

  test('invalid selection is announced and never auto-replaced', async ({ page }) => {
    await page.goto(`${fixture}?state=invalid`);

    await expect(
      page.getByRole('alert').filter({ hasText: 'transport option is no longer available' }),
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: /Private luxury car \(2\)/i })).toBeChecked();
    await expect(page.getByRole('radio', { name: /Premium van \(10\)/i })).not.toBeChecked();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeDisabled();

    await page.getByRole('radio', { name: /Premium van \(10\)/i }).check();

    await expect(page.getByRole('radio', { name: /Premium van \(10\)/i })).toBeChecked();
  });

  test('refreshing, stale, and offline preserve usable content with explicit status', async ({
    page,
  }) => {
    await page.goto(`${fixture}?state=refreshing`);
    await expect(
      page.getByRole('status').filter({ hasText: 'Updating availability' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();

    await page.goto(`${fixture}?state=stale`);
    await expect(
      page.getByRole('status').filter({ hasText: 'Availability may be out of date' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();

    await page.goto(`${fixture}?state=offline`);
    await expect(page.getByRole('status').filter({ hasText: 'You are offline' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();
  });

  test('price loading and price error never erase the transaction', async ({ page }) => {
    await page.goto(`${fixture}?state=price-loading`);
    await expect(page.getByLabel('Price loading')).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();

    await page.goto(`${fixture}?state=price-error`);
    await expect(page.getByText('Fixture previous total')).toBeVisible();
    await expect(page.getByText('Fixture price refresh failed.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Review trip' })).toBeEnabled();

    await page.getByRole('button', { name: 'Retry price' }).click();
    await expect(page.getByTestId('configure-retry-result')).toHaveText('price');
  });
});
