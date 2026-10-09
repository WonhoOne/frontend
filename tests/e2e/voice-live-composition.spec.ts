import { expect, test, type Page } from '@playwright/test';

const storageKey = 'mister-world:reservation-draft:v1';
async function installRecognition(page: Page) {
  await page.addInitScript(() => {
    class FakeRecognition {
      static current: FakeRecognition | undefined;
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onstart: (() => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        FakeRecognition.current = this;
        this.onstart?.();
      }
      stop() {
        this.onend?.();
      }
      abort() {
        this.onend?.();
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: FakeRecognition });
    Object.defineProperty(window, 'voiceTest', {
      value: {
        say: (transcript: string, isFinal: boolean) =>
          FakeRecognition.current?.onresult?.({
            resultIndex: 0,
            results: [{ isFinal, length: 1, 0: { transcript, confidence: 1 } }],
          }),
        error: (error: string) => {
          FakeRecognition.current?.onerror?.({ error });
          FakeRecognition.current?.onend?.();
        },
      },
    });
  });
}
async function say(page: Page, transcript: string, isFinal = true) {
  await page.evaluate(
    ({ transcript, isFinal }) => {
      (
        window as unknown as { voiceTest: { say: (text: string, final: boolean) => void } }
      ).voiceTest.say(transcript, isFinal);
    },
    { transcript, isFinal },
  );
}
async function readDraft(page: Page) {
  return page.evaluate(
    (key) =>
      JSON.parse(sessionStorage.getItem(key) ?? '{}') as {
        tourProductId: string;
        tourScheduleId: string;
        tourStyle: string;
        participantCount: number;
        configuration: { extraSelectionKeys: string[] };
      },
    storageKey,
  );
}

test('live app composes recognition, dynamic choices, Draft, Configure and Review without submission', async ({
  page,
}) => {
  await installRecognition(page);
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await page.goto('/tours?theme=GOLF_CHALLENGE');
  await expect(
    page.getByRole('link', { name: 'View Golf Challenge · Journey 01 tour details' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Start voice' }).click();
  await say(page, '상품 Golf Challenge · Journey 01 선택');
  await expect(page).toHaveURL(new RegExp('/tours/103$'));
  await expect(
    page.getByRole('heading', { level: 1, name: 'Golf Challenge · Journey 01' }),
  ).toBeVisible();
  await expect(page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ })).toBeVisible();
  await say(page, '프리미엄 스타일 선택');
  await expect(page.getByRole('radio', { name: /Premium/ })).toBeChecked();
  await say(page, '2027년 3월 10일 일정 선택');
  await expect(page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ })).toBeChecked();
  expect(await readDraft(page)).toMatchObject({
    tourProductId: '103',
    tourScheduleId: '1301',
    tourStyle: 'PREMIUM',
  });
  await page.getByRole('button', { name: 'Configure this trip' }).click();
  const coffee = page.getByRole('checkbox', { name: /Coffee/ });
  const champagne = page.getByRole('checkbox', { name: /Champagne/ });
  await expect(champagne).toBeChecked();
  await say(page, '인원 2명');
  await say(page, '호텔 4성급 선택');
  await expect(page.getByRole('radio', { name: /4-star hotel/ })).toBeChecked();
  await say(page, '차량 프리미엄 밴 선택');
  await expect(page.getByRole('radio', { name: /Premium van/ })).toBeChecked();
  await say(page, '식사 현지식 레스토랑 선택');
  await expect(page.getByRole('radio', { name: /Local restaurant/ })).toBeChecked();
  await say(page, '커피 추가', false);
  await expect(coffee).not.toBeChecked();
  await say(page, '커피 추가');
  await expect(coffee).toBeChecked();
  await say(page, '커피 추가');
  expect((await readDraft(page)).configuration.extraSelectionKeys).toEqual(['CHAMPAGNE', 'COFFEE']);
  await say(page, '샴페인 제거');
  await expect(champagne).not.toBeChecked();
  // GUI change between Voice callbacks must be seen by the next V6-B getter.
  await champagne.check();
  await coffee.uncheck();
  await say(page, '샴페인 제거');
  await expect(champagne).not.toBeChecked();
  await say(page, '커피 추가');
  await expect(coffee).toBeChecked();
  await say(page, '예약 제출');
  await expect(page.getByRole('status').filter({ hasText: 'not understood' })).toBeVisible();
  expect(posts).toEqual([]);
  await page.reload();
  await expect(champagne).not.toBeChecked();
  await expect(coffee).toBeChecked();
  await page.getByRole('button', { name: 'Start voice' }).click();
  await say(page, '프리미엄 스타일 선택');
  await say(page, '인원 4명');
  await expect(champagne).not.toBeChecked();
  await page.getByRole('button', { name: 'Review trip' }).click();
  await expect(page).toHaveURL(new RegExp('/reservation/review$'));
  await expect(page.getByRole('button', { name: 'Start voice' })).toHaveCount(0);
  expect(posts).toEqual([]);
});

test('recognition failure preserves choices and leaves GUI available at 320px', async ({
  page,
}) => {
  await installRecognition(page);
  await page.setViewportSize({ width: 320, height: 760 });
  await page.addInitScript(
    (key) =>
      sessionStorage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 1,
          tourProductId: '103',
          tourScheduleId: '1301',
          tourStyle: 'GRAND',
          participantCount: 2,
          configuration: {
            hotelSelectionKey: 'HOTEL_4_STAR',
            transportSelectionKey: 'PREMIUM_VAN_10',
            mealSelectionKey: 'LOCAL_RESTAURANT',
            extraSelectionKeys: [],
          },
          updatedAt: 1,
        }),
      ),
    storageKey,
  );
  await page.goto('/tours/103/configure');
  const coffee = page.getByRole('checkbox', { name: /Coffee/ });
  await expect(coffee).toBeVisible();
  await page.getByRole('button', { name: 'Start voice' }).click();
  await page.evaluate(() =>
    (window as unknown as { voiceTest: { error: (code: string) => void } }).voiceTest.error(
      'not-allowed',
    ),
  );
  await expect(page.getByRole('status').filter({ hasText: 'recognition failed' })).toBeVisible();
  expect((await readDraft(page)).configuration.extraSelectionKeys).toEqual([]);
  await coffee.check();
  await expect(coffee).toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
    false,
  );
});
