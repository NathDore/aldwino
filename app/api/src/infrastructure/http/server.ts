import { Hono } from "hono";
import { cors } from "hono/cors";
import type { GetHealthUseCase } from "../../application/health/GetHealthUseCase";
import { registerHealthRoutes } from "./routes/health.route";

export interface ServerDeps {
  getHealthUseCase: GetHealthUseCase;
  allowedOrigins: string[];
}

export function createServer(deps: ServerDeps): Hono {
  const app = new Hono();
  app.use("*", cors({ origin: deps.allowedOrigins }));
  registerHealthRoutes(app, deps);
  return app;
}
