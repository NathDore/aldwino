export type WorkSessionStateName = "INPROGRESS" | "COMPLETED" | "SKIPPED" | "WAIT_CONFIRM";

export interface WorkSessionStateDto {
  id: string;
  state: WorkSessionStateName;
}

export interface WorkSessionDto {
  id: string;
  workSessionStateId: string;
  startTime: string;
  endTime: string;
  completedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  wrapUpAt: string | null;
  rescheduleAt: string | null;
  waitConfirmAt: string | null;
  skippedAt: string | null;
  createdAt: string;
  mergedFrom?: string[];
}

export interface CreateWorkSessionData {
  startTime: string;
  endTime: string;
}

export interface RescheduleWorkSessionData {
  startTime: string;
  endTime: string;
}

export interface EditWorkSessionData {
  startTime: string;
  endTime: string;
}
