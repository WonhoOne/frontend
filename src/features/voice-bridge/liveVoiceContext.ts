import type { ConfigurationCategory, ConfigureScenario } from '@/features/configuration';
import { validateParticipantCount, type ReservationDraftV1 } from '@/features/reservation';
import type { ScheduleChoiceModel, TourDetailModel } from '@/features/tour-detail';
import type { TourProductSummaryModel } from '@/features/tour-discovery';
import type { VoiceInterpretationContext } from '@/integrations/voice';
import { parseResourceIdRouteParam } from '@/shared/lib/resourceIdentity';
import type { ReservationDraftVoiceContext } from './reservationDraftVoiceAdapter';

export interface LiveVoiceChoices {
  products: readonly TourProductSummaryModel[];
  product: TourDetailModel | undefined;
  schedules: readonly ScheduleChoiceModel[];
  screen: 'discovery' | 'detail' | 'configure';
  scenario: ConfigureScenario;
}

/** 현재 화면의 public view model만 투영한다. 요청, 기본값, Business Rule 계산은 없다. */
export function createLiveVoiceContext(
  choices: LiveVoiceChoices,
  draft: ReservationDraftV1,
  allowExtraRemoval = false,
): { interpretation: VoiceInterpretationContext; draft: ReservationDraftVoiceContext } {
  const { product, schedules, screen, scenario } = choices;
  const products = screen === 'discovery' ? choices.products : product ? [product] : [];
  const selectedId = parseResourceIdRouteParam(draft.tourProductId ?? undefined);
  const productMatchesDraft = product !== undefined && product.id === draft.tourProductId;
  const canConfigure =
    screen === 'configure' &&
    productMatchesDraft &&
    draft.tourStyle !== null &&
    draft.tourScheduleId !== null;

  function resolve(category: ConfigurationCategory, value: string): string | null {
    if (!canConfigure) return null;
    const option = scenario.groups
      .find((group) => group.category === category)
      ?.options.find((option) => option.selectionKey === value);
    if (!option) return null;
    const removable =
      category === 'extras' &&
      allowExtraRemoval &&
      draft.configuration.extraSelectionKeys.includes(option.selectionKey);
    return option.availability.status === 'selectable' || removable ? option.selectionKey : null;
  }

  return {
    interpretation: {
      tourProducts: products.flatMap((p) => {
        const id = parseResourceIdRouteParam(p.id);
        return id === null ? [] : [{ id, name: p.name }];
      }),
      tourSchedules: productMatchesDraft
        ? schedules.flatMap((s) => {
            const id = parseResourceIdRouteParam(s.selectionKey);
            return id === null || !s.calendar ? [] : [{ id, ...s.calendar }];
          })
        : [],
      ...(selectedId === null ? {} : { selectedTourProductId: selectedId }),
    },
    draft: {
      canSelectTourProduct: (id) => products.some((p) => parseResourceIdRouteParam(p.id) === id),
      canSelectStyle: (style) => productMatchesDraft && product.availableStyles.includes(style),
      canSelectSchedule: (id) =>
        productMatchesDraft &&
        schedules.some((s) => parseResourceIdRouteParam(s.selectionKey) === id && s.isSelectable),
      canSetParticipantCount: (count) =>
        canConfigure &&
        validateParticipantCount(
          product.theme === 'HONEYMOON_ROMANCE' ? 'honeymoon' : 'general',
          count,
        ).status === 'valid',
      resolveHotelSelectionKey: (value) => resolve('hotel', value),
      resolveTransportSelectionKey: (value) => resolve('transport', value),
      resolveMealSelectionKey: (value) => resolve('meal', value),
      resolveExtraSelectionKey: (value) => resolve('extras', value),
    },
  };
}
