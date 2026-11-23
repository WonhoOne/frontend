import { useState } from 'react';

import styles from '@/features/reservation/ReservationEditDialog.module.css';
import type { ReservationDataSource } from '@/features/reservation/reservation.dataSource';
import type {
  ReservationConfigurationModel,
  ReservationExtraOption,
  ReservationModel,
} from '@/features/reservation/reservation.model';
import {
  allowedStylesForReservation,
  isSameReservationConfiguration,
  presentReservationEditFailure,
  reservationEditOptions,
  reservationStyleLabel,
  type ReservationEditFailure,
} from '@/features/reservation/reservationEdit';
import { useUpdateReservationConfiguration } from '@/features/reservation/reservationEdit.mutation';
import { checkTransportCapacity } from '@/features/reservation/transportCapacity';
import { Button, Dialog } from '@/shared/ui';

interface ReservationEditDialogProps {
  dataSource: Pick<ReservationDataSource, 'updateReservationConfiguration'>;
  reservation: ReservationModel;
  open: boolean;
  onClose: () => void;
  onUpdated: (updated: ReservationModel) => void;
  /** 결과를 모르거나 더 이상 바꿀 수 없다. page가 예약을 다시 읽는다. */
  onNeedsRefresh: () => void;
  /** Backend가 409 `RESERVATION_NOT_MODIFIABLE`로 수정 마감을 알렸다. */
  onClosedForChanges: () => void;
}

function copyConfiguration(configuration: ReservationConfigurationModel) {
  return { ...configuration, extraOptions: [...configuration.extraOptions] };
}

/**
 * 예약 수정 dialog (v0.3 demo, scenario 2.2.1).
 *
 * CONTRACT:
 * - Style, 호텔, 이동수단, 식사, 추가 옵션만 바꾼다. 인원과 일정은 읽기 전용이다.
 * - Style은 상품 Theme이 허용하는 것만, 이동수단은 인원을 태울 수 있는 것만 고를 수 있다.
 * - 가격은 계산하지 않는다. 저장 후 Backend가 다시 계산한 값을 page가 보여준다.
 * - 요청 중에는 Escape/바깥 클릭으로 닫히지 않는다.
 */
export function ReservationEditDialog({
  dataSource,
  onClose,
  onClosedForChanges,
  onNeedsRefresh,
  onUpdated,
  open,
  reservation,
}: ReservationEditDialogProps) {
  const update = useUpdateReservationConfiguration(dataSource, reservation.id);
  const [values, setValues] = useState(() => copyConfiguration(reservation.configuration));
  const [failure, setFailure] = useState<ReservationEditFailure | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // LIFECYCLE ('이전 render 정보' 패턴): 열릴 때마다 현재 예약 값으로 새로 시작한다.
  if (open && !wasOpen) {
    setWasOpen(true);
    setValues(copyConfiguration(reservation.configuration));
    setFailure(null);
  }

  if (!open && wasOpen) {
    setWasOpen(false);
  }

  const submitting = update.isPending;
  const participantCount = reservation.participantCount;
  const allowedStyles = allowedStylesForReservation(reservation.tourProduct.theme);
  const capacity = checkTransportCapacity({
    participantCount,
    transportSelectionKey: values.transportOption,
  });
  const styleAllowed = allowedStyles.includes(values.style);
  const unchanged = isSameReservationConfiguration(values, reservation.configuration);
  const blocked = capacity.status === 'exceeded' || !styleAllowed;
  const fieldMessages = failure?.fieldMessages ?? {};

  async function submit() {
    if (blocked || unchanged || failure?.closed === true) {
      return;
    }

    setFailure(null);

    try {
      const updated = await update.mutateAsync(values);
      onUpdated(updated);
    } catch (error) {
      const presented = presentReservationEditFailure(error, participantCount);
      setFailure(presented);

      if (presented.closed) {
        onClosedForChanges();
      }

      if (presented.needsRefresh) {
        onNeedsRefresh();
      }
    }
  }

  function toggleExtra(extra: ReservationExtraOption, checked: boolean) {
    setValues((current) => ({
      ...current,
      extraOptions: checked
        ? [...current.extraOptions.filter((value) => value !== extra), extra]
        : current.extraOptions.filter((value) => value !== extra),
    }));
  }

  return (
    <Dialog
      closeLabel="Close"
      closeOnEscape={!submitting}
      closeOnInteractOutside={!submitting}
      description="Change the style and options of this trip. The service recalculates the price when you save."
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
      open={open}
      title="Edit trip"
    >
      <form
        className={styles.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <dl className={styles.summary}>
          <div>
            <dt>Dates</dt>
            <dd>
              {reservation.schedule.startDate} – {reservation.schedule.endDate}
            </dd>
          </div>
          <div>
            <dt>Travellers</dt>
            <dd>{participantCount} (cannot be changed)</dd>
          </div>
        </dl>

        <fieldset className={styles.group} disabled={submitting}>
          <legend>Style</legend>
          {allowedStyles.map((style) => (
            <label className={styles.choice} key={style}>
              <input
                checked={values.style === style}
                name="edit-style"
                onChange={() => setValues((current) => ({ ...current, style }))}
                type="radio"
                value={style}
              />
              {reservationStyleLabel(style)}
            </label>
          ))}
          {fieldMessages.style === undefined ? null : (
            <p className={styles.fieldError}>{fieldMessages.style}</p>
          )}
        </fieldset>

        <fieldset className={styles.group} disabled={submitting}>
          <legend>Hotel</legend>
          {reservationEditOptions.hotel.map((option) => (
            <label className={styles.choice} key={option.value}>
              <input
                checked={values.hotelOption === option.value}
                name="edit-hotel"
                onChange={() => setValues((current) => ({ ...current, hotelOption: option.value }))}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <fieldset className={styles.group} disabled={submitting}>
          <legend>Transport</legend>
          {reservationEditOptions.transport.map((option) => {
            const check = checkTransportCapacity({
              participantCount,
              transportSelectionKey: option.value,
            });
            const tooSmall = check.status === 'exceeded';

            return (
              <label className={styles.choice} key={option.value}>
                <input
                  checked={values.transportOption === option.value}
                  disabled={tooSmall}
                  name="edit-transport"
                  onChange={() =>
                    setValues((current) => ({ ...current, transportOption: option.value }))
                  }
                  type="radio"
                  value={option.value}
                />
                {option.label}
                {check.status === 'exceeded' ? (
                  <span className={styles.hint}>
                    {' '}
                    — seats {check.capacity}, not enough for {participantCount} travellers
                  </span>
                ) : null}
              </label>
            );
          })}
          {capacity.status === 'exceeded' ? (
            <p className={styles.fieldError}>
              Choose a transport that seats all {participantCount} travellers.
            </p>
          ) : null}
          {fieldMessages.transport === undefined ? null : (
            <p className={styles.fieldError}>{fieldMessages.transport}</p>
          )}
        </fieldset>

        <fieldset className={styles.group} disabled={submitting}>
          <legend>Meal</legend>
          {reservationEditOptions.meal.map((option) => (
            <label className={styles.choice} key={option.value}>
              <input
                checked={values.mealOption === option.value}
                name="edit-meal"
                onChange={() => setValues((current) => ({ ...current, mealOption: option.value }))}
                type="radio"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <fieldset className={styles.group} disabled={submitting}>
          <legend>Extras</legend>
          {reservationEditOptions.extras.map((option) => (
            <label className={styles.choice} key={option.value}>
              <input
                checked={values.extraOptions.includes(option.value)}
                name="edit-extras"
                onChange={(event) => toggleExtra(option.value, event.target.checked)}
                type="checkbox"
                value={option.value}
              />
              {option.label}
            </label>
          ))}
          {fieldMessages.extras === undefined ? null : (
            <p className={styles.fieldError}>{fieldMessages.extras}</p>
          )}
        </fieldset>

        {failure === null ? null : (
          <p className={styles.alert} role="alert">
            {failure.message}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={blocked || unchanged || failure?.closed === true}
            isLoading={submitting}
            loadingLabel="Saving changes"
            type="submit"
          >
            Save changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
