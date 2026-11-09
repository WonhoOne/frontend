const krwFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

/**
 * 원화 금액을 Customer 화면과 같은 형식(`₩1,200,000`)으로 표시한다.
 *
 * INVARIANT: 화면에 보이는 금액은 Backend가 준 정수 그대로다. 소수나 안전 범위를
 * 넘는 값은 반올림하지 않고 예외로 드러낸다 (CP8 §4).
 */
export function formatKrw(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError('KRW amount must be a safe integer.');
  }

  return krwFormatter.format(amount);
}
