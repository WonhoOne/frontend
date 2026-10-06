import { themeDiscoveryPresentations } from '@/features/tour-discovery/themeDiscoveryPresentations';
import type {
  TourProductSummaryModel,
  TourTheme,
} from '@/features/tour-discovery/tourDiscovery.model';
import type { TourProductDto } from '@/integrations/backend/contracts';
import { toCanonicalBackendResourceIdentity } from '@/shared/lib/resourceIdentity';

export class TourProductPresentationError extends Error {
  override readonly name = 'TourProductPresentationError';

  constructor(readonly theme: TourTheme) {
    super(`Frontend presentation is missing for TourProduct theme ${theme}.`);
  }
}

function resolveEditorialMedia(theme: TourTheme) {
  const presentation = themeDiscoveryPresentations.find((item) => item.theme === theme);

  if (presentation === undefined) {
    throw new TourProductPresentationError(theme);
  }

  return { ...presentation.media };
}

export function adaptTourProductDto(dto: TourProductDto): TourProductSummaryModel {
  return {
    id: toCanonicalBackendResourceIdentity(dto.id),
    theme: dto.theme,
    name: dto.name,
    description: dto.description,
    availableStyles: [...dto.availableStyles],
    stylePrices: dto.stylePrices.map((price) => ({ ...price })),
    media: resolveEditorialMedia(dto.theme),
  };
}
