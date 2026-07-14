import type { Clock } from "../../application/health/ports/Clock";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
