import type { FormEvent } from 'react';

import type {
  ProductFormErrors,
  ProductFormValues,
  TourTheme,
} from '@/features/employee-tours/employeeTour.model';
import { KrwAmountField } from '@/features/employee-tours/KrwAmountField';
import styles from '@/features/employee-tours/ProductForm.module.css';
import { productFieldId } from '@/features/employee-tours/productFieldIds';
import {
  allowedStylesForTheme,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  tourStyleLabel,
} from '@/features/employee-tours/productFormRules';
import { TOUR_THEME_ORDER, tourThemeTitle } from '@/features/tour-discovery';
import { SelectField, TextAreaField, TextField } from '@/shared/ui';

interface ProductFormProps {
  formId: string;
  values: ProductFormValues;
  errors: ProductFormErrors;
  onChange: (values: ProductFormValues) => void;
  onSubmit: () => void;
  readOnly: boolean;
  /** 편집 화면에서 Theme 아래에 항상 보이는 안내 (E04 §5) */
  themeNote?: string;
}

/**
 * 여행상품 생성/수정 공용 폼 (E03, E04).
 *
 * CONTRACT: 값과 오류는 page가 소유한다. 이 component는 Theme → 허용 Style 가격 칸을
 * 보여주는 것까지만 책임지고, 숨겨진 Style 가격 값은 지우지 않는다 (CP5 §3.6).
 */
export function ProductForm({
  errors,
  formId,
  onChange,
  onSubmit,
  readOnly,
  themeNote,
  values,
}: ProductFormProps) {
  const allowedStyles = allowedStylesForTheme(values.theme);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className={styles.form} id={formId} noValidate onSubmit={handleSubmit}>
      <section aria-labelledby={`${formId}-basic`} className={styles.section}>
        <h2 className={styles.sectionTitle} id={`${formId}-basic`}>
          기본 정보
        </h2>

        <SelectField
          {...(errors.theme === undefined
            ? themeNote === undefined
              ? {}
              : { helperText: themeNote }
            : { error: errors.theme })}
          disabled={readOnly}
          id={productFieldId('theme')}
          label="테마"
          onChange={(event) => onChange({ ...values, theme: event.target.value as TourTheme | '' })}
          required
          value={values.theme}
        >
          <option value="">테마 선택</option>
          {TOUR_THEME_ORDER.map((theme) => (
            <option key={theme} value={theme}>
              {tourThemeTitle(theme)}
            </option>
          ))}
        </SelectField>

        <TextField
          {...(errors.name === undefined ? {} : { error: errors.name })}
          autoComplete="off"
          id={productFieldId('name')}
          label="상품명"
          maxLength={PRODUCT_NAME_MAX_LENGTH}
          onChange={(event) => onChange({ ...values, name: event.target.value })}
          readOnly={readOnly}
          required
          value={values.name}
        />

        <TextAreaField
          {...(errors.description === undefined
            ? { helperText: `${values.description.length} / ${PRODUCT_DESCRIPTION_MAX_LENGTH}` }
            : { error: errors.description })}
          id={productFieldId('description')}
          label="설명"
          maxLength={PRODUCT_DESCRIPTION_MAX_LENGTH}
          onChange={(event) => onChange({ ...values, description: event.target.value })}
          readOnly={readOnly}
          required
          rows={6}
          value={values.description}
        />
      </section>

      <section aria-labelledby={`${formId}-prices`} className={styles.section}>
        <h2 className={styles.sectionTitle} id={`${formId}-prices`}>
          스타일별 1인 가격
        </h2>

        {errors.stylePrices === undefined ? null : (
          <p className={styles.sectionError} id={productFieldId('stylePrices')} tabIndex={-1}>
            {errors.stylePrices}
          </p>
        )}

        {allowedStyles.length === 0 ? (
          <p className={styles.hint}>
            테마를 선택하면 해당 테마에서 판매할 스타일의 가격을 입력할 수 있습니다.
          </p>
        ) : (
          allowedStyles.map((style) => (
            <KrwAmountField
              error={errors[`price.${style}`]}
              id={productFieldId(`price.${style}`)}
              key={style}
              label={`${tourStyleLabel(style)} 1인 가격 (원)`}
              onChange={(price) =>
                onChange({ ...values, prices: { ...values.prices, [style]: price } })
              }
              readOnly={readOnly}
              value={values.prices[style]}
            />
          ))
        )}
      </section>
    </form>
  );
}
