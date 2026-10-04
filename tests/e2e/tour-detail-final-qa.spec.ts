import { expect, test, type Locator } from '@playwright/test';

const canonicalWidths = [320, 360, 390, 430, 768, 1024, 1280, 1440, 1728];

async function touchSurfaceHeight(locator: Locator) {
  return locator.evaluate((element) => {
    const label = element.closest('label');
    return label instanceof HTMLElement ? label.getBoundingClientRect().height : 0;
  });
}

test.describe('Tour Detail final responsive and accessibility QA', () => {
  for (const width of canonicalWidths) {
    test(`keeps the complete S03 hierarchy usable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/tours/103');

      await expect(
        page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
      ).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

      const viewport = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.innerWidth);

      const hero = page.locator('section[aria-labelledby="tour-title"]');
      const mediaFrame = hero.locator('[data-image-state]').first();
      const heroBox = await hero.boundingBox();
      const mediaBox = await mediaFrame.boundingBox();

      expect(heroBox).not.toBeNull();
      expect(mediaBox).not.toBeNull();
      expect(await hero.evaluate((element) => getComputedStyle(element).overflow)).toBe('hidden');
      expect(
        await mediaFrame.evaluate((element) =>
          getComputedStyle(element).getPropertyValue('--image-frame-object-fit').trim(),
        ),
      ).toBe('cover');
      expect(Math.abs((mediaBox?.width ?? 0) - (heroBox?.width ?? 0))).toBeLessThanOrEqual(1);
      expect(Math.abs((mediaBox?.height ?? 0) - (heroBox?.height ?? 0))).toBeLessThanOrEqual(1);

      const styleGroup = page.getByRole('group', { name: 'Tour style options' });
      const scheduleGroup = page.getByRole('group', { name: 'Tour schedule options' });
      const configureSection = page.locator('section[aria-labelledby="tour-configure-title"]');
      const configure = configureSection.getByRole('button', { name: 'Configure this trip' });

      await expect(styleGroup).toBeVisible();
      await expect(scheduleGroup).toBeVisible();
      await expect(configure).toBeVisible();
      await expect(configure).toBeDisabled();
      await expect(configureSection.getByText('Not selected', { exact: true })).toHaveCount(2);

      const backLink = hero.getByRole('link', { name: /Back to Golf Challenge journeys/ });
      const backBox = await backLink.boundingBox();
      const configureBox = await configure.boundingBox();
      expect(backBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(configureBox?.height ?? 0).toBeGreaterThanOrEqual(44);

      const grand = styleGroup.getByRole('radio', { name: /Grand/ });
      const schedule = scheduleGroup.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ });
      expect(await touchSurfaceHeight(grand)).toBeGreaterThanOrEqual(44);
      expect(await touchSurfaceHeight(schedule)).toBeGreaterThanOrEqual(44);

      await grand.click();
      await schedule.click();

      await expect(grand).toBeChecked();
      await expect(schedule).toBeChecked();
      await expect(configure).toBeEnabled();
      await expect(configureSection.getByText('Golf Challenge', { exact: true })).toBeVisible();
      await expect(configureSection.getByText('Grand', { exact: true })).toBeVisible();
      await expect(
        configureSection.getByText('2027-03-10 – 2027-03-14', { exact: true }),
      ).toBeVisible();

      const actionInner = configureSection.locator(':scope > div').first();
      const actionBox = await actionInner.boundingBox();
      const actionContentWidth = await actionInner.evaluate((element) => {
        const style = getComputedStyle(element);
        return (
          element.getBoundingClientRect().width -
          Number.parseFloat(style.paddingLeft) -
          Number.parseFloat(style.paddingRight)
        );
      });
      const activeConfigureBox = await configure.boundingBox();

      expect(actionBox).not.toBeNull();
      expect(activeConfigureBox).not.toBeNull();

      if (width < 768) {
        expect(
          await configureSection.evaluate((element) => getComputedStyle(element).position),
        ).toBe('sticky');
        expect(activeConfigureBox?.width ?? 0).toBeGreaterThanOrEqual(actionContentWidth * 0.99);

        const footerLink = page
          .locator('footer')
          .getByRole('link', { name: 'Back to Golf Challenge journeys' });
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await expect(footerLink).toBeVisible();

        const stickyBox = await configureSection.boundingBox();
        const footerLinkBox = await footerLink.boundingBox();

        expect(stickyBox).not.toBeNull();
        expect(footerLinkBox).not.toBeNull();

        const overlapsFooterLink =
          (footerLinkBox?.y ?? 0) < (stickyBox?.y ?? 0) + (stickyBox?.height ?? 0) &&
          (footerLinkBox?.y ?? 0) + (footerLinkBox?.height ?? 0) > (stickyBox?.y ?? 0);

        expect(overlapsFooterLink).toBe(false);
      } else {
        expect(
          await configureSection.evaluate((element) => getComputedStyle(element).position),
        ).toBe('static');
        expect(activeConfigureBox?.width ?? 0).toBeLessThan((actionBox?.width ?? 0) * 0.5);
      }
    });
  }

  test('remains task-complete at the 1280px-at-200%-zoom equivalent width', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 720 });
    await page.goto('/tours/103');

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1),
    ).toBe(false);

    await page.getByRole('radio', { name: /Classic/ }).click();
    await page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ }).click();

    const configure = page.getByRole('button', { name: 'Configure this trip' });
    await expect(configure).toBeEnabled();
    await configure.scrollIntoViewIfNeeded();
    await expect(configure).toBeVisible();

    const configureBox = await configure.boundingBox();
    expect(configureBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test('supports the Style → Schedule → Configure task with native keyboard controls', async ({
    page,
  }) => {
    await page.goto('/tours/103');

    const classic = page.getByRole('radio', { name: /Classic/ });
    await classic.focus();
    await expect(classic).toBeFocused();
    await page.keyboard.press('Space');
    await expect(classic).toBeChecked();

    const schedule = page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ });
    await schedule.focus();
    await expect(schedule).toBeFocused();
    await page.keyboard.press('Space');
    await expect(schedule).toBeChecked();

    const configure = page.getByRole('button', { name: 'Configure this trip' });
    await expect(configure).toBeEnabled();
    await configure.focus();
    await expect(configure).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/tours\/103\/configure$/);
    await expect(page.getByRole('heading', { name: 'Build your trip' })).toBeVisible();
  });

  test('uses semantic selected and disabled states without relying on motion or color alone', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/tours/103');

    const heroReveal = page
      .locator('section[aria-labelledby="tour-title"] [data-revealed]')
      .first();
    await expect(heroReveal).toBeVisible();
    const heroTransform = await heroReveal.evaluate(
      (element) => getComputedStyle(element).transform,
    );
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(heroTransform);
    expect(
      await heroReveal.evaluate((element) => getComputedStyle(element).transitionDuration),
    ).toBe('0s');

    const grand = page.getByRole('radio', { name: /Grand/ });
    await grand.click();
    await expect(grand).toBeChecked();

    const selectedStyleMotion = await grand.evaluate((element) => {
      const card = element.closest('[data-selected="true"]');
      return card instanceof HTMLElement ? getComputedStyle(card).transitionDuration : null;
    });
    expect(selectedStyleMotion).toBe('0s');

    const schedule = page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ });
    const unavailable = page.getByRole('radio', { name: /2027-04-10 – 2027-04-14/ });

    await schedule.click();
    await expect(schedule).toBeChecked();
    await expect(unavailable).toBeDisabled();
    await expect(page.getByText('Reservation unavailable', { exact: true })).toBeVisible();

    const selectedScheduleMotion = await schedule.evaluate((element) => {
      const card = element.closest('[data-selected="true"]');
      return card instanceof HTMLElement ? getComputedStyle(card).transitionDuration : null;
    });
    expect(selectedScheduleMotion).toBe('0s');
  });
});
