import type {
  EmployeeSchedule,
  ScheduleDepartureResult,
} from '@/features/employee-schedules/employeeSchedule.model';

/** 직원 출발 운영 server boundary (v0.3 demo, scenario 3). */
export interface EmployeeScheduleDataSource {
  listSchedules(signal?: AbortSignal): Promise<readonly EmployeeSchedule[]>;
  /** 출발 처리. 서버가 Theme별 기념품을 차감하고 차감 결과를 돌려준다. */
  markDeparted(scheduleId: number): Promise<ScheduleDepartureResult>;
  /** 여행 완료 처리. DEPARTED 일정만 가능하다. */
  markCompleted(scheduleId: number): Promise<EmployeeSchedule>;
}
