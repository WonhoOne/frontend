import styles from '@/features/employee-tours/EditorActionBar.module.css';
import { Button } from '@/shared/ui';

interface EditorActionBarProps {
  formId: string;
  onCancel: () => void;
  isSubmitting: boolean;
  submitDisabled?: boolean;
}

/**
 * 편집 화면 하단 고정 버튼 영역 (CP2-B §4.2).
 *
 * WHY: DOM 순서상 마지막 필드 다음에 있어 키보드 사용자가 폼을 끝까지 지나면 바로
 * 저장에 닿는다. 화면에서만 sticky로 보인다.
 */
export function EditorActionBar({
  formId,
  isSubmitting,
  onCancel,
  submitDisabled = false,
}: EditorActionBarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <Button onClick={onCancel} variant="secondary">
          취소
        </Button>
        <Button
          disabled={submitDisabled}
          form={formId}
          isLoading={isSubmitting}
          loadingLabel="저장 중"
          type="submit"
        >
          저장
        </Button>
      </div>
    </div>
  );
}
