import {
  WorkSessionStateIdRequiredError,
  StartTimeInvalidError,
  EndTimeInvalidError,
  StartTimeNotBeforeEndTimeError,
  SpansMultipleDaysError,
} from "./WorkSessionError";

export function validateWorkSessionStateId(workSessionStateId: string): void {
  if (workSessionStateId.length === 0) {
    throw new WorkSessionStateIdRequiredError();
  }
}

export function validateStartTime(startTime: Date): void {
  if (isNaN(startTime.getTime())) {
    throw new StartTimeInvalidError();
  }
}

export function validateEndTime(endTime: Date): void {
  if (isNaN(endTime.getTime())) {
    throw new EndTimeInvalidError();
  }
}

export function validateStartBeforeEnd(startTime: Date, endTime: Date): void {
  if (!(startTime < endTime)) {
    throw new StartTimeNotBeforeEndTimeError();
  }
}

export function validateSameDay(startTime: Date, endTime: Date): void {
  const sameDay =
    startTime.getFullYear() === endTime.getFullYear() &&
    startTime.getMonth() === endTime.getMonth() &&
    startTime.getDate() === endTime.getDate();
  if (!sameDay) {
    throw new SpansMultipleDaysError();
  }
}
