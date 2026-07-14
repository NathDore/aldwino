import type { Hono } from "hono";
import type { GetHealthUseCase } from "../../../application/health/GetHealthUseCase";

export function registerHealthRoutes(app: Hono, deps: { getHealthUseCase: GetHealthUseCase }) {
  app.get("/health", (c) => c.json(deps.getHealthUseCase.execute().toJSON()));
}
