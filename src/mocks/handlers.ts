import type { RequestHandler } from 'msw';

/**
 * 공용 mock handler registry다.
 *
 * CONTRACT: Foundation은 Backend DTO나 endpoint를 추측하지 않는다.
 * Product handler는 해당 계약이 승인된 뒤에만 추가한다.
 */
export const handlers: RequestHandler[] = [];
