export const VOICE_THEMES = [
  'HONEYMOON_ROMANCE',
  'PARENTS_HEALING',
  'GOLF_CHALLENGE',
  'OUTDOOR_TREKKING',
] as const;
export type VoiceTheme = (typeof VOICE_THEMES)[number];

export const VOICE_TOUR_STYLES = ['CLASSIC', 'GRAND', 'PREMIUM'] as const;
export type VoiceTourStyle = (typeof VOICE_TOUR_STYLES)[number];

export const VOICE_HOTEL_OPTIONS = ['HOTEL_3_STAR', 'HOTEL_4_STAR', 'HOTEL_5_STAR'] as const;
export type VoiceHotelOption = (typeof VOICE_HOTEL_OPTIONS)[number];

export const VOICE_TRANSPORT_OPTIONS = ['PRIVATE_LUXURY_CAR_2', 'PREMIUM_VAN_10'] as const;
export type VoiceTransportOption = (typeof VOICE_TRANSPORT_OPTIONS)[number];

export const VOICE_MEAL_OPTIONS = ['LUNCH_BOX', 'LOCAL_RESTAURANT', 'PREMIUM_RESTAURANT'] as const;
export type VoiceMealOption = (typeof VOICE_MEAL_OPTIONS)[number];

export const VOICE_EXTRA_OPTIONS = ['CHAMPAGNE', 'COFFEE'] as const;
export type VoiceExtraOption = (typeof VOICE_EXTRA_OPTIONS)[number];

export const VOICE_COMMAND_NAMES = [
  'SHOW_TOURS',
  'SELECT_THEME',
  'SELECT_TOUR_PRODUCT',
  'SELECT_STYLE',
  'SELECT_SCHEDULE',
  'SET_PARTICIPANT_COUNT',
  'CHANGE_HOTEL',
  'CHANGE_TRANSPORT',
  'CHANGE_MEAL',
  'ADD_OPTION',
  'REMOVE_OPTION',
] as const;
export type VoiceCommandName = (typeof VOICE_COMMAND_NAMES)[number];

type CommandEnvelope<Name extends VoiceCommandName, Args> = {
  version: 1;
  command: Name;
  args: Args;
};

/**
 * 승인된 Voice Contract v0.2의 command/args 대응을 보존한다.
 * Feature 모델과 독립적이며, 실행이나 Reservation 제출 권한을 포함하지 않는다.
 */
export type VoiceCommand =
  | CommandEnvelope<'SHOW_TOURS', { theme?: VoiceTheme }>
  | CommandEnvelope<'SELECT_THEME', { theme: VoiceTheme }>
  | CommandEnvelope<'SELECT_TOUR_PRODUCT', { tourProductId: number }>
  | CommandEnvelope<'SELECT_STYLE', { style: VoiceTourStyle }>
  | CommandEnvelope<'SELECT_SCHEDULE', { scheduleId: number }>
  | CommandEnvelope<'SET_PARTICIPANT_COUNT', { participantCount: number }>
  | CommandEnvelope<'CHANGE_HOTEL', { hotelOption: VoiceHotelOption }>
  | CommandEnvelope<'CHANGE_TRANSPORT', { transportOption: VoiceTransportOption }>
  | CommandEnvelope<'CHANGE_MEAL', { mealOption: VoiceMealOption }>
  | CommandEnvelope<'ADD_OPTION', { extraOption: VoiceExtraOption }>
  | CommandEnvelope<'REMOVE_OPTION', { extraOption: VoiceExtraOption }>;
