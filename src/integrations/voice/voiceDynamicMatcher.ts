import { type VoiceCommand } from './voiceCommand';
import { decodeVoiceCommand } from './voiceCommandDecoder';
import { type VoiceInterpretationContext } from './voiceInterpretationContext';
import { normalizeVoiceTranscript } from './voiceTranscriptNormalizer';

/** 표시 문자열은 정규식/코드로 해석하지 않고 전체 문장으로만 비교한다. */
export function matchDynamicVoiceCandidates(
  normalizedTranscript: string,
  context: VoiceInterpretationContext,
): VoiceCommand[] {
  const candidates: VoiceCommand[] = [];
  const add = (phrases: readonly string[], command: VoiceCommand) => {
    if (!phrases.some((phrase) => normalizeVoiceTranscript(phrase) === normalizedTranscript))
      return;
    // application-owned context도 ID coercion 없이 기존 V1 경계를 통과해야 한다.
    const decoded = decodeVoiceCommand(command);
    if (decoded.ok) candidates.push(decoded.value);
  };

  for (const product of context.tourProducts) {
    if (typeof product.name !== 'string') continue;
    const name = normalizeVoiceTranscript(product.name);
    if (!name) continue;
    add(selectionPhrases(name, '상품', '투어', 'product'), {
      version: 1,
      command: 'SELECT_TOUR_PRODUCT',
      args: { tourProductId: product.id },
    });
  }

  const selected = context.selectedTourProductId;
  if (selected !== undefined && !isPositiveSafeInteger(selected)) return candidates;
  for (const schedule of context.tourSchedules) {
    if (!isPositiveSafeInteger(schedule.tourProductId)) continue;
    if (selected !== undefined && schedule.tourProductId !== selected) continue;
    const start = calendarDateAliases(schedule.startDate);
    const end = calendarDateAliases(schedule.endDate);
    // 날짜 순서는 ISO 표현의 구조적 불변식이다. 예약 가능 여부는 판단하지 않는다.
    if (!start || !end || schedule.startDate > schedule.endDate) continue;
    const phrases = start.flatMap((date) => selectionPhrases(date, '일정', '스케줄', 'schedule'));
    for (let index = 0; index < start.length; index++) {
      phrases.push(
        ...selectionPhrases(`${start[index]}부터 ${end[index]}까지`, '일정', '스케줄', 'schedule'),
      );
    }
    phrases.push(`from ${schedule.startDate} to ${schedule.endDate} schedule`);
    add(phrases, { version: 1, command: 'SELECT_SCHEDULE', args: { scheduleId: schedule.id } });
  }
  return candidates;
}

function selectionPhrases(
  name: string,
  noun: string,
  alternative: string,
  english: string,
): string[] {
  return [
    `${name} ${noun} 선택`,
    `${name} ${alternative} 선택`,
    `${noun} ${name} 선택`,
    `${alternative} ${name} 선택`,
    `select ${english} ${name}`,
  ];
}

/** Gregorian 달력 검사만 수행한다. Date/locale/현재 시각을 사용하지 않는다. */
function calendarDateAliases(iso: string): readonly string[] | undefined {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return undefined;
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  if (year < 1 || month < 1 || month > 12 || day < 1) return undefined;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > (days[month - 1] ?? 0)) return undefined;
  return [iso, `${year}년 ${month}월 ${day}일`, `${month}월 ${day}일`];
}

function isPositiveSafeInteger(id: number): boolean {
  return Number.isSafeInteger(id) && id > 0;
}
