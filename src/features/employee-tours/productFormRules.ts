import type {
  EmployeeTourProduct,
  ProductFormErrors,
  ProductFormField,
  ProductFormValues,
  TourProductWriteInput,
  TourStyle,
  TourTheme,
} from '@/features/employee-tours/employeeTour.model';

export const TOUR_STYLE_ORDER = [
  'CLASSIC',
  'GRAND',
  'PREMIUM',
] as const satisfies readonly TourStyle[];

export const PRODUCT_NAME_MAX_LENGTH = 255;
export const PRODUCT_DESCRIPTION_MAX_LENGTH = 2000;

/**
 * CONTRACT: BR-17/BR-21, Backend `TourStylePolicy`와 같은 규칙이다.
 * 화면이 빠르게 안내하기 위한 사본이며 최종 판단은 Backend 422가 한다.
 */
const ALLOWED_STYLES: Readonly<Record<TourTheme, readonly TourStyle[]>> = {
  HONEYMOON_ROMANCE: ['GRAND', 'PREMIUM'],
  PARENTS_HEALING: ['GRAND', 'PREMIUM'],
  GOLF_CHALLENGE: ['CLASSIC', 'GRAND', 'PREMIUM'],
  OUTDOOR_TREKKING: ['CLASSIC', 'GRAND', 'PREMIUM'],
};

/** Customer 화면과 같은 Style 표시 이름이다 (`TourCollectionCard`, `TourStyleExplainer`). */
const STYLE_LABELS: Readonly<Record<TourStyle, string>> = {
  CLASSIC: 'Classic',
  GRAND: 'Grand',
  PREMIUM: 'Premium',
};

export function allowedStylesForTheme(theme: TourTheme | ''): readonly TourStyle[] {
  return theme === '' ? [] : ALLOWED_STYLES[theme];
}

export function tourStyleLabel(style: TourStyle): string {
  return STYLE_LABELS[style];
}

export function emptyProductFormValues(): ProductFormValues {
  return { theme: '', name: '', description: '', prices: { CLASSIC: '', GRAND: '', PREMIUM: '' } };
}

export function productToFormValues(product: EmployeeTourProduct): ProductFormValues {
  const prices = { CLASSIC: '', GRAND: '', PREMIUM: '' };

  for (const { style, amount } of product.stylePrices) {
    prices[style] = String(amount);
  }

  return { theme: product.theme, name: product.name, description: product.description, prices };
}

/**
 * 가격 입력을 숫자 문자열로 정규화한다. "1,200,000", "₩1,200,000", " 1200000원 "을
 * 모두 "1200000"으로 바꾼다. 숫자가 아닌 다른 문자가 있으면 그대로 두어 검증에서
 * 오류로 드러나게 한다.
 */
export function normalizeKrwInput(raw: string): string {
  const stripped = raw.replace(/[\s,₩원]/g, '');
  return /^\d*$/.test(stripped) ? stripped : raw;
}

function priceError(style: TourStyle, raw: string): string | undefined {
  const value = normalizeKrwInput(raw);

  if (value === '') {
    return `${tourStyleLabel(style)} 가격을 입력해 주세요.`;
  }

  if (!/^\d+$/.test(value)) {
    return '가격은 숫자로만 입력해 주세요.';
  }

  const amount = Number(value);

  if (!Number.isSafeInteger(amount)) {
    return '금액이 너무 큽니다.';
  }

  if (amount < 1) {
    return '가격은 1원 이상의 정수여야 합니다.';
  }

  return undefined;
}

/** 화면 순서대로 오류를 모은다. 비어 있으면 제출할 수 있다. */
export function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const name = values.name.trim();
  const description = values.description.trim();

  if (values.theme === '') {
    errors.theme = '테마를 선택해 주세요.';
  }

  if (name === '') {
    errors.name = '상품명을 입력해 주세요.';
  } else if (name.length > PRODUCT_NAME_MAX_LENGTH) {
    errors.name = `상품명은 ${PRODUCT_NAME_MAX_LENGTH}자 이하여야 합니다.`;
  }

  if (description === '') {
    errors.description = '설명을 입력해 주세요.';
  } else if (description.length > PRODUCT_DESCRIPTION_MAX_LENGTH) {
    errors.description = `설명은 ${PRODUCT_DESCRIPTION_MAX_LENGTH}자 이하여야 합니다.`;
  }

  for (const style of allowedStylesForTheme(values.theme)) {
    const message = priceError(style, values.prices[style]);

    if (message !== undefined) {
      errors[`price.${style}`] = message;
    }
  }

  return errors;
}

/**
 * 검증된 폼 값을 쓰기 입력으로 바꾼다.
 *
 * CONTRACT: 선택한 Theme이 허용하는 Style만 Classic → Grand → Premium 순서로 보낸다.
 * 숨겨진 Style 가격은 보내지 않는다 (CP8 §3).
 */
export function toTourProductWriteInput(values: ProductFormValues): TourProductWriteInput {
  if (values.theme === '') {
    throw new Error('Theme must be selected before building a write input.');
  }

  const stylePrices = allowedStylesForTheme(values.theme).map((style) => ({
    style,
    amount: Number(normalizeKrwInput(values.prices[style])),
  }));

  return {
    theme: values.theme,
    name: values.name.trim(),
    description: values.description.trim(),
    stylePrices,
  };
}

/** 두 폼 값이 저장 결과로 같은지 비교한다 (trim, 숨은 Style 가격 무시). */
export function isSameProductFormValues(a: ProductFormValues, b: ProductFormValues): boolean {
  if (a.theme !== b.theme || a.name.trim() !== b.name.trim()) {
    return false;
  }

  if (a.description.trim() !== b.description.trim()) {
    return false;
  }

  return allowedStylesForTheme(a.theme).every(
    (style) => normalizeKrwInput(a.prices[style]) === normalizeKrwInput(b.prices[style]),
  );
}

const fieldErrorMessages: Readonly<Record<string, string>> = {
  REQUIRED: '입력해 주세요.',
  OUT_OF_RANGE: '허용 범위를 벗어났습니다.',
  INVALID_FORMAT: '형식이 올바르지 않습니다.',
  INVALID_VALUE: '값이 올바르지 않습니다.',
  NOT_ALLOWED: '이 테마에서 허용되지 않는 스타일 가격입니다.',
  DUPLICATE_VALUE: '이 테마에서 허용되지 않는 스타일 가격입니다.',
};

function messageFor(code: string) {
  return fieldErrorMessages[code] ?? '입력 값을 확인해 주세요.';
}

/**
 * Backend 422 `fieldErrors`를 폼 필드에 붙인다 (CP8 §3).
 *
 * `stylePrices[i]...`는 제출한 배열의 i번째 Style 입력으로 연결한다. 알 수 없는 필드도
 * 버리지 않고 `stylePrices` 요약으로 보낸다.
 */
export function mapProductFieldErrors(
  fieldErrors: ReadonlyArray<{ field: string; code: string }>,
  submittedStyles: readonly TourStyle[],
): ProductFormErrors {
  const errors: ProductFormErrors = {};

  for (const { field, code } of fieldErrors) {
    const message = messageFor(code);
    let target: ProductFormField | 'stylePrices' = 'stylePrices';

    if (field === 'theme' || field === 'name' || field === 'description') {
      target = field;
    } else {
      const indexed = /^stylePrices\[(\d+)\]/.exec(field);
      const style = indexed === null ? undefined : submittedStyles[Number(indexed[1])];

      if (style !== undefined && code !== 'NOT_ALLOWED' && code !== 'DUPLICATE_VALUE') {
        target = `price.${style}`;
      }
    }

    errors[target] ??= message;
  }

  return errors;
}

/** 오류 요약에 화면 순서대로 표시할 항목이다. */
export function orderedProductErrors(
  errors: ProductFormErrors,
  theme: TourTheme | '',
): ReadonlyArray<{ field: ProductFormField | 'stylePrices'; message: string }> {
  const order: Array<ProductFormField | 'stylePrices'> = [
    'theme',
    'name',
    'description',
    'stylePrices',
    ...allowedStylesForTheme(theme).map((style) => `price.${style}` as const),
  ];

  return order.flatMap((field) => {
    const message = errors[field];
    return message === undefined ? [] : [{ field, message }];
  });
}
