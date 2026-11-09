import styles from '@/features/employee-tours/LeaveEditorDialog.module.css';
import { Button, Dialog } from '@/shared/ui';

interface LeaveEditorDialogProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
  isSaving?: boolean;
}

/** 저장하지 않은 변경 사항 확인 (CP6-F §3). 기본 포커스는 '계속 편집'이다. */
export function LeaveEditorDialog({
  isSaving = false,
  onLeave,
  onStay,
  open,
}: LeaveEditorDialogProps) {
  return (
    <Dialog
      closeLabel="닫기"
      description={
        isSaving
          ? '저장 요청이 아직 끝나지 않았습니다. 이 페이지를 나가면 입력한 내용이 사라집니다.'
          : '이 페이지를 나가면 입력한 내용이 사라집니다.'
      }
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onStay();
        }
      }}
      open={open}
      title="저장하지 않은 변경 사항이 있습니다"
    >
      <div className={styles.actions}>
        <Button autoFocus onClick={onStay} variant="secondary">
          계속 편집
        </Button>
        <Button onClick={onLeave} variant="destructive">
          나가기
        </Button>
      </div>
    </Dialog>
  );
}
