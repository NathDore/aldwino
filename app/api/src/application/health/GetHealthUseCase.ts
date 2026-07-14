import { HealthStatus } from "../../domain/health/HealthStatus";
import type { Clock } from "./ports/Clock";

export class GetHealthUseCase {
  constructor(private readonly clock: Clock) {}

  execute(): HealthStatus {
    return HealthStatus.create({ checkedAt: this.clock.now() });
  }
}
