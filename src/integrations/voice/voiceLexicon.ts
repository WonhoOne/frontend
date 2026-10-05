import {
  type VoiceTheme,
  type VoiceTourStyle,
  type VoiceHotelOption,
  type VoiceTransportOption,
  type VoiceMealOption,
  type VoiceExtraOption,
} from './voiceCommand';

// Voice-local 명시적 어휘이며 공유 계약이나 Backend catalog를 대체하지 않는다.
export const THEME_ALIASES = {
  HONEYMOON_ROMANCE: ['허니문', '신혼여행', 'honeymoon', 'honeymoon romance'],
  PARENTS_HEALING: ['부모님 힐링', '부모님 여행', '효도여행', 'parents healing'],
  GOLF_CHALLENGE: ['골프', '골프 챌린지', 'golf', 'golf challenge'],
  OUTDOOR_TREKKING: ['아웃도어 트레킹', '트레킹', 'outdoor trekking', 'trekking'],
} as const satisfies Record<VoiceTheme, readonly string[]>;

export const STYLE_ALIASES = {
  CLASSIC: ['클래식', 'classic'],
  GRAND: ['그랜드', 'grand'],
  PREMIUM: ['프리미엄', 'premium'],
} as const satisfies Record<VoiceTourStyle, readonly string[]>;

export const HOTEL_ALIASES = {
  HOTEL_3_STAR: ['3성급', '3성급 호텔', '3 star', '3 star hotel'],
  HOTEL_4_STAR: ['4성급', '4성급 호텔', '4 star', '4 star hotel'],
  HOTEL_5_STAR: ['5성급', '5성급 호텔', '5 star', '5 star hotel'],
} as const satisfies Record<VoiceHotelOption, readonly string[]>;

export const TRANSPORT_ALIASES = {
  PRIVATE_LUXURY_CAR_2: [
    '2인 고급차량',
    '2인 럭셔리 차량',
    '프라이빗 럭셔리 카',
    'private luxury car',
  ],
  PREMIUM_VAN_10: ['10인 승합 고급차량', '10인 프리미엄 밴', '프리미엄 밴', 'premium van'],
} as const satisfies Record<VoiceTransportOption, readonly string[]>;

export const MEAL_ALIASES = {
  LUNCH_BOX: ['도시락', 'lunch box'],
  LOCAL_RESTAURANT: ['현지식 레스토랑', 'local restaurant'],
  PREMIUM_RESTAURANT: ['고급 레스토랑', 'premium restaurant'],
} as const satisfies Record<VoiceMealOption, readonly string[]>;

export const EXTRA_ALIASES = {
  CHAMPAGNE: ['샴페인', 'champagne'],
  COFFEE: ['커피', 'coffee'],
} as const satisfies Record<VoiceExtraOption, readonly string[]>;

export const COUNT_WORDS: Readonly<Record<string, number>> = {
  한: 1,
  하나: 1,
  두: 2,
  둘: 2,
  세: 3,
  셋: 3,
  네: 4,
  넷: 4,
  다섯: 5,
  여섯: 6,
  일곱: 7,
  여덟: 8,
  아홉: 9,
  열: 10,
};

export const UNSUPPORTED_PHRASES = [
  '예약 제출',
  '예약 확정',
  '예약해줘',
  '예약 해줘',
  'submit reservation',
  'create reservation',
  '로그인',
  '회원가입',
  'login',
  'signup',
  'sign up',
  '취소',
  '환불',
  '결제',
  'cancel',
  'refund',
  'payment',
  'pay',
  '추천',
  '검색',
  'recommend',
  'recommendation',
  'search',
  '재고 수정',
  '재고 변경',
  '직원 상품 수정',
  'employee mutation',
] as const;
