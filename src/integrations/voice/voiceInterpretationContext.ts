/** 이미 decode된 현재 선택지를 호출자가 투영한다. Backend DTO/Feature 모델이 아니다. */
export interface VoiceTourProductChoice {
  id: number;
  name: string;
}

export interface VoiceTourScheduleChoice {
  id: number;
  tourProductId: number;
  startDate: string;
  endDate: string;
}

export interface VoiceInterpretationContext {
  tourProducts: readonly VoiceTourProductChoice[];
  tourSchedules: readonly VoiceTourScheduleChoice[];
  selectedTourProductId?: number;
}
