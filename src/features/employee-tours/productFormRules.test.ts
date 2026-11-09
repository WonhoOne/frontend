import { describe, expect, it } from 'vitest';

import type { ProductFormValues } from '@/features/employee-tours/employeeTour.model';
import {
  allowedStylesForTheme,
  emptyProductFormValues,
  isSameProductFormValues,
  mapProductFieldErrors,
  normalizeKrwInput,
  orderedProductErrors,
  productToFormValues,
  toTourProductWriteInput,
  validateProductForm,
} from '@/features/employee-tours/productFormRules';

function golfValues(overrides: Partial<ProductFormValues> = {}): ProductFormValues {
  return {
    theme: 'GOLF_CHALLENGE',
    name: '  제주 골프 3일  ',
    description: '  바다를 보며 치는 골프  ',
    prices: { CLASSIC: '890,000', GRAND: '1200000', PREMIUM: '₩1,800,000' },
    ...overrides,
  };
}

describe('allowedStylesForTheme', () => {
  it('follows BR-17/21: Honeymoon and Parents → Grand, Premium; Golf and Trekking → all three', () => {
    expect(allowedStylesForTheme('HONEYMOON_ROMANCE')).toEqual(['GRAND', 'PREMIUM']);
    expect(allowedStylesForTheme('PARENTS_HEALING')).toEqual(['GRAND', 'PREMIUM']);
    expect(allowedStylesForTheme('GOLF_CHALLENGE')).toEqual(['CLASSIC', 'GRAND', 'PREMIUM']);
    expect(allowedStylesForTheme('OUTDOOR_TREKKING')).toEqual(['CLASSIC', 'GRAND', 'PREMIUM']);
    expect(allowedStylesForTheme('')).toEqual([]);
  });
});

describe('normalizeKrwInput', () => {
  it.each([
    ['1,200,000', '1200000'],
    ['₩1,200,000', '1200000'],
    [' 1200000원 ', '1200000'],
    ['', ''],
  ])('normalizes %s', (raw, expected) => {
    expect(normalizeKrwInput(raw)).toBe(expected);
  });

  it('keeps non-numeric input so validation can reject it', () => {
    expect(normalizeKrwInput('12만')).toBe('12만');
  });
});

describe('validateProductForm', () => {
  it('accepts a complete Golf form', () => {
    expect(validateProductForm(golfValues())).toEqual({});
  });

  it('reports every missing field in Korean', () => {
    expect(validateProductForm(emptyProductFormValues())).toEqual({
      theme: '테마를 선택해 주세요.',
      name: '상품명을 입력해 주세요.',
      description: '설명을 입력해 주세요.',
    });
  });

  it('only requires prices for the styles the Theme allows', () => {
    const errors = validateProductForm(
      golfValues({ theme: 'HONEYMOON_ROMANCE', prices: { CLASSIC: '', GRAND: '1', PREMIUM: '' } }),
    );

    expect(errors).toEqual({ 'price.PREMIUM': 'Premium 가격을 입력해 주세요.' });
  });

  it('rejects zero, text and amounts beyond the safe integer range', () => {
    const errors = validateProductForm(
      golfValues({ prices: { CLASSIC: '0', GRAND: '12만', PREMIUM: '9007199254740992' } }),
    );

    expect(errors).toEqual({
      'price.CLASSIC': '가격은 1원 이상의 정수여야 합니다.',
      'price.GRAND': '가격은 숫자로만 입력해 주세요.',
      'price.PREMIUM': '금액이 너무 큽니다.',
    });
  });

  it('enforces name and description length limits after trimming', () => {
    const errors = validateProductForm(
      golfValues({ name: 'a'.repeat(256), description: ` ${'b'.repeat(2001)} ` }),
    );

    expect(errors.name).toBe('상품명은 255자 이하여야 합니다.');
    expect(errors.description).toBe('설명은 2000자 이하여야 합니다.');
  });
});

describe('toTourProductWriteInput', () => {
  it('trims text and sends only allowed styles in Classic → Grand → Premium order', () => {
    expect(toTourProductWriteInput(golfValues())).toEqual({
      theme: 'GOLF_CHALLENGE',
      name: '제주 골프 3일',
      description: '바다를 보며 치는 골프',
      stylePrices: [
        { style: 'CLASSIC', amount: 890000 },
        { style: 'GRAND', amount: 1200000 },
        { style: 'PREMIUM', amount: 1800000 },
      ],
    });
  });

  it('drops hidden style prices when the Theme allows fewer styles', () => {
    const input = toTourProductWriteInput(golfValues({ theme: 'PARENTS_HEALING' }));

    expect(input.stylePrices.map(({ style }) => style)).toEqual(['GRAND', 'PREMIUM']);
  });
});

describe('isSameProductFormValues', () => {
  const saved = productToFormValues({
    id: '7',
    theme: 'GOLF_CHALLENGE',
    name: '제주 골프 3일',
    description: '바다를 보며 치는 골프',
    stylePrices: [
      { style: 'CLASSIC', amount: 890000 },
      { style: 'GRAND', amount: 1200000 },
      { style: 'PREMIUM', amount: 1800000 },
    ],
  });

  it('treats whitespace and formatting-only changes as unchanged', () => {
    expect(isSameProductFormValues(saved, golfValues())).toBe(true);
  });

  it('detects a real change', () => {
    expect(isSameProductFormValues(saved, golfValues({ name: '제주 골프 4일' }))).toBe(false);
  });
});

describe('mapProductFieldErrors', () => {
  it('maps top-level, indexed and unknown fields without dropping any', () => {
    const errors = mapProductFieldErrors(
      [
        { field: 'name', code: 'REQUIRED' },
        { field: 'stylePrices[1].amount', code: 'OUT_OF_RANGE' },
        { field: 'stylePrices[0].style', code: 'NOT_ALLOWED' },
        { field: 'somethingNew', code: 'INVALID_VALUE' },
      ],
      ['CLASSIC', 'GRAND', 'PREMIUM'],
    );

    expect(errors).toEqual({
      name: '입력해 주세요.',
      'price.GRAND': '허용 범위를 벗어났습니다.',
      stylePrices: '이 테마에서 허용되지 않는 스타일 가격입니다.',
    });
  });

  it('orders summary items the way the form is laid out', () => {
    const ordered = orderedProductErrors(
      { 'price.GRAND': 'g', theme: 't', description: 'd' },
      'GOLF_CHALLENGE',
    );

    expect(ordered.map(({ field }) => field)).toEqual(['theme', 'description', 'price.GRAND']);
  });
});
