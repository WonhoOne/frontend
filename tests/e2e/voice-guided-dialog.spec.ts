import { expect, test, type Page } from '@playwright/test';
import { installInstantSpeechSynthesis } from './support/instant-speech-synthesis';

const storageKey = 'mister-world:reservation-draft:v1';

// CI has no microphone or speakers. Only the native recognition and synthesis boundaries are
// replaced; transcripts still enter adapter → runtime → guided dialog / interpreter → bridge.
async function installRecognition(page: Page) {
  await installInstantSpeechSynthesis(page);
  await page.addInitScript(() => {
    class Recognition {
      static current: Recognition | undefined;
      lang = '';
      continuous = false;
      interimResults = false;
      maxAlternatives = 1;
      onstart: (() => void) | null = null;
      onresult: ((event: unknown) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        Recognition.current = this;
        this.onstart?.();
      }
      stop() {
        this.onend?.();
      }
      abort() {
        if (Recognition.current === this) Recognition.current = undefined;
        this.onend?.();
      }
    }
    Object.defineProperty(window, 'SpeechRecognition', { value: Recognition });
    Object.defineProperty(window, 'guidedVoice', {
      value: {
        listening: () => Recognition.current !== undefined,
        say: (transcript: string) =>
          Recognition.current?.onresult?.({
            resultIndex: 0,
            results: [{ isFinal: true, length: 1, 0: { transcript, confidence: 1 } }],
          }),
      },
    });
  });
}

type GuidedVoiceWindow = Window & {
  guidedVoice: { listening: () => boolean; say: (text: string) => void };
  spokenVoiceReplies: string[];
};

async function customerSays(page: Page, transcript: string) {
  // Recognition re-arms after each spoken reply; wait for it like a presenter would.
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as GuidedVoiceWindow).guidedVoice.listening()),
    )
    .toBe(true);
  await page.evaluate(
    (text) => (window as unknown as GuidedVoiceWindow).guidedVoice.say(text),
    transcript,
  );
}

async function lastReply(page: Page) {
  return page.evaluate(() => (window as unknown as GuidedVoiceWindow).spokenVoiceReplies.at(-1));
}

test('guided voice dialog performs the presentation script without submitting', async ({
  page,
}) => {
  await installRecognition(page);
  const posts: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST') posts.push(request.url());
  });
  await page.goto('/tours');
  await expect(
    page.getByRole('link', { name: 'View Honeymoon Romance · Journey 01 tour details' }),
  ).toBeVisible();

  await page.getByRole('button', { name: 'Start voice' }).click();
  await expect.poll(() => lastReply(page)).toBe('안녕하세요, 어떤 여행 상품을 예약하시겠습니까?');

  await customerSays(page, '멋진 여행 상품 추천해주세요.');
  await expect.poll(() => lastReply(page)).toBe('무슨 기념일인가요?');
  await customerSays(page, '다음달 오늘에 결혼해요');
  await expect
    .poll(() => lastReply(page))
    .toBe('정말 축하드려요. 허니문 낭만 투어 또는 아웃도어 트레킹 투어는 어떠세요?');

  await customerSays(page, '허니문 낭만 투어 좋겠어요.');
  await expect(page).toHaveURL(/\/tours\/101$/);
  await expect
    .poll(() => lastReply(page))
    .toBe('허니문 낭만 투어 알겠습니다. 그리고 스타일은 프리미엄 스타일 어떨까요?');

  await expect(page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ })).toBeVisible();
  await customerSays(page, '네, 프리미엄 스타일 좋아요.');
  await expect(page.getByRole('radio', { name: /Premium/ })).toBeChecked();
  await expect
    .poll(() => lastReply(page))
    .toBe('네, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일로 선택하셨습니다.');

  // GUI steps between lines: date and Configure.
  await page.getByRole('radio', { name: /2027-03-10 – 2027-03-14/ }).check();
  await page.getByRole('button', { name: 'Configure this trip' }).click();
  await expect(page).toHaveURL(/\/tours\/101\/configure$/);
  await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeVisible();

  await customerSays(page, '그리고 식사시 커피 1포트, 샴페인 1병 추가해요.');
  await expect(page.getByRole('checkbox', { name: /Coffee/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: /Champagne/ })).toBeChecked();
  await expect
    .poll(() => lastReply(page))
    .toBe(
      '네, 여행은 허니문 낭만 투어, 스타일은 프리미엄 스타일, 커피 1포트, 샴페인 1병 추가하셨습니다.',
    );

  await customerSays(page, '맞아요.');
  await expect.poll(() => lastReply(page)).toBe('추가로 필요하신 것 있으세요?');
  await customerSays(page, '없어요.');
  await expect
    .poll(() => lastReply(page))
    .toBe('선택하신 내용을 화면에서 확인하신 뒤 Review trip 버튼을 눌러 예약을 진행해 주세요.');
  await expect(page.getByRole('button', { name: 'Start voice' })).toBeEnabled();

  const draft = await page.evaluate(
    (key) => JSON.parse(sessionStorage.getItem(key) ?? '{}') as Record<string, unknown>,
    storageKey,
  );
  expect(draft).toMatchObject({
    tourProductId: '101',
    tourStyle: 'PREMIUM',
    tourScheduleId: '1101',
    configuration: expect.objectContaining({
      // Configure keeps its own catalog order; both extras are what matters.
      extraSelectionKeys: expect.arrayContaining(['COFFEE', 'CHAMPAGNE']),
    }),
  });
  await expect(page).toHaveURL(/\/tours\/101\/configure$/);
  expect(posts).toEqual([]);
});
