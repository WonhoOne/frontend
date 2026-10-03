import { expect, test, type Locator, type Page } from '@playwright/test';

async function tabUntilFocused(page: Page, target: Locator, maximumTabs = 12) {
  for (let index = 0; index < maximumTabs; index += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) {
      return;
    }

    await page.keyboard.press('Tab');
  }

  await expect(target).toBeFocused();
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      })),
    )
    .toEqual(
      expect.objectContaining({
        innerWidth: expect.any(Number),
        scrollWidth: expect.any(Number),
      }),
    );

  const viewport = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);
}

test.describe('Account and Travel History QA hardening', () => {
  test(
    'auth surfaces reflow without horizontal task overflow at canonical widths',
    async ({ page }) => {
    for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440, 1728]) {
      await page.setViewportSize({ width, height: 900 });

      await page.goto('/login');
      await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto('/signup');
      await expect(page.getByRole('heading', { level: 1, name: 'Signup' })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    },
  );

  test(
    '320px direct My Trips access returns safely to Login without starting a visible private surface',
    async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto('/my-trips');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const returnContext = await page.evaluate(() =>
      window.sessionStorage.getItem('mister-world:return-context:v1'),
    );

    expect(returnContext).not.toBeNull();
    expect(returnContext).toContain('/my-trips');
    expect(returnContext).toContain('continue-navigation');
    },
  );

  test(
    'Login is operable keyboard-only and credentials never enter Web Storage',
    async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { level: 1, name: 'Login' })).toBeVisible();

    const loginId = page.getByRole('textbox', { name: '로그인 ID' });
    const password = page.getByLabel('비밀번호');
    const submit = page.getByRole('button', { name: '로그인' });

    await tabUntilFocused(page, loginId);
    await page.keyboard.type('keyboard-user');
    await page.keyboard.press('Tab');
    await expect(password).toBeFocused();

    await page.keyboard.type('keyboard-password');
    await page.keyboard.press('Tab');
    await expect(submit).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.getByRole('alert')).toContainText(
      '잠시 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    );

    const storageText = await page.evaluate(() => {
      const entries = (storage: Storage) =>
        Array.from({ length: storage.length }, (_, index) => {
          const key = storage.key(index);
          return key === null ? '' : `${key}=${storage.getItem(key) ?? ''}`;
        }).join('\n');

      return `${entries(window.sessionStorage)}\n${entries(window.localStorage)}`;
    });

    expect(storageText).not.toContain('keyboard-user');
    expect(storageText).not.toContain('keyboard-password');
    },
  );
});
