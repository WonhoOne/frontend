import { normalizeKrwInput } from '@/features/employee-tours/productFormRules';
import { formatKrw } from '@/shared/lib/formatKrw';
import { TextField } from '@/shared/ui';

interface KrwAmountFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
  readOnly?: boolean;
}

/**
 * 원화 금액 입력. 숫자만 입력받고, 유효한 값이면 아래에 `₩1,200,000`처럼 보여준다.
 * CONTRACT: 화면에 보이는 서식 문자열은 절대 전송하지 않는다 (E03 §10).
 */
export function KrwAmountField({
  error,
  id,
  label,
  onChange,
  readOnly = false,
  value,
}: KrwAmountFieldProps) {
  const normalized = normalizeKrwInput(value);
  const amount = Number(normalized);
  const preview =
    /^\d+$/.test(normalized) && Number.isSafeInteger(amount) && amount > 0
      ? formatKrw(amount)
      : '1인 기준 판매 가격 (원)';

  return (
    <TextField
      {...(error === undefined ? { helperText: preview } : { error })}
      autoComplete="off"
      id={id}
      inputMode="numeric"
      label={label}
      onChange={(event) => onChange(event.target.value)}
      readOnly={readOnly}
      required
      value={value}
    />
  );
}
