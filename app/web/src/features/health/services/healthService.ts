import { apiClient } from "@/shared/lib/apiClient";
import type { HealthStatusDto } from "../types/health.types";

export async function fetchHealthStatus(): Promise<HealthStatusDto> {
  return apiClient<HealthStatusDto>("/health");
}
