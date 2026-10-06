import {
  createTourDetailMedia,
  themeDetailPresentations,
} from '@/features/tour-detail/tourDetailPresentations';
import type {
  ScheduleChoiceModel,
  TourDetailModel,
  TourDetailTheme,
} from '@/features/tour-detail/tourDetail.model';
import {
  ContractMappingError,
  type TourProductDto,
  type TourScheduleDto,
} from '@/integrations/backend/contracts';
import {
  toCanonicalBackendResourceIdentity,
  type ResourceId,
} from '@/shared/lib/resourceIdentity';

export class TourDetailPresentationError extends Error {
  override readonly name = 'TourDetailPresentationError';

  constructor(readonly theme: TourDetailTheme) {
    super(`Frontend detail presentation is missing for TourProduct theme ${theme}.`);
  }
}

export function adaptTourProductDetailDto(dto: TourProductDto): TourDetailModel {
  const presentation = themeDetailPresentations[dto.theme];

  if (presentation === undefined) {
    throw new TourDetailPresentationError(dto.theme);
  }

  return {
    id: toCanonicalBackendResourceIdentity(dto.id),
    theme: dto.theme,
    themeLabel: presentation.themeLabel,
    name: dto.name,
    summary: dto.description,
    storyTitle: presentation.storyTitle,
    storyBody: presentation.storyBody,
    heroMedia: createTourDetailMedia(`${presentation.themeLabel} hero visual unavailable`),
    storyMedia: createTourDetailMedia(`${presentation.themeLabel} story visual unavailable`),
    includedExperiences: presentation.includedExperiences,
    availableStyles: [...dto.availableStyles],
    stylePrices: dto.stylePrices.map((price) => ({ ...price })),
  };
}

function recruitmentUnitLabel(unit: TourScheduleDto['recruitment']['unit']) {
  return unit === 'COUPLE_TEAM' ? 'couples/teams' : 'participants';
}

export function adaptTourScheduleDto(
  dto: TourScheduleDto,
  requestedTourId: ResourceId,
): ScheduleChoiceModel {
  if (dto.tourId !== requestedTourId) {
    throw new ContractMappingError('TourSchedule', '$.tourId', 'resource-identity-mismatch');
  }

  const unitLabel = recruitmentUnitLabel(dto.recruitment.unit);

  return {
    selectionKey: toCanonicalBackendResourceIdentity(dto.id),
    dateLabel: `${dto.startDate} – ${dto.endDate}`,
    statusLabel: dto.reservable ? 'Reservation available' : 'Reservation unavailable',
    recruitmentSummary: `${dto.recruitment.currentCount} / ${dto.recruitment.requiredCount} ${unitLabel} · ${dto.recruitment.confirmed ? 'Confirmed' : 'Not confirmed'}`,
    isSelectable: dto.reservable,
  };
}
