import type { RequestHandler } from 'msw';

/**
 * Shared mock registry.
 *
 * CONTRACT: Foundation does not guess Backend DTOs or endpoints. Product
 * handlers are added only after their approved contract exists.
 */
export const handlers: RequestHandler[] = [];
