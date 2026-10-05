/** 숫자의 부호/소수점/구분자는 보존하여 잘못된 수를 유효한 ID로 바꾸지 않는다. */
export function normalizeVoiceTranscript(transcript: string): string {
  const text = transcript.normalize('NFKC').toLowerCase();
  return text
    .replace(/[\p{P}\p{S}]/gu, (separator: string, offset: number) => {
      const before = text[offset - 1] ?? '';
      const after = text.slice(offset + 1);
      if (/[+\p{Pd}\u2212]/u.test(separator) && /^[\s\p{P}\p{S}]*\d/u.test(after)) {
        return separator;
      }
      if (separator === '.' && /^\s*\d/.test(after)) {
        return separator;
      }
      if (separator === ',' && /\d/.test(before) && /^\d/.test(after)) {
        return separator;
      }
      return ' ';
    })
    .replace(/(\d)\s+(명|성급|인)/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
}
