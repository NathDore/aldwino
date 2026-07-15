import { Hono } from "hono";
import { cors } from "hono/cors";
import type { GetHealthUseCase } from "../../application/health/GetHealthUseCase";
import { registerHealthRoutes } from "./routes/health.route";
import type { CreateEventUseCase } from "../../application/event/CreateEventUseCase";
import type { GetEventByIdUseCase } from "../../application/event/GetEventByIdUseCase";
import type { ListEventsUseCase } from "../../application/event/ListEventsUseCase";
import type { UpdateEventUseCase } from "../../application/event/UpdateEventUseCase";
import type { DeleteEventUseCase } from "../../application/event/DeleteEventUseCase";
import { registerEventRoutes } from "./routes/event.route";

export interface ServerDeps {
  getHealthUseCase: GetHealthUseCase;
  createEventUseCase: CreateEventUseCase;
  getEventByIdUseCase: GetEventByIdUseCase;
  listEventsUseCase: ListEventsUseCase;
  updateEventUseCase: UpdateEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
  allowedOrigins: string[];
}

export function createServer(deps: ServerDeps): Hono {
  const app = new Hono();
  app.use("*", cors({ origin: deps.allowedOrigins }));
  registerHealthRoutes(app, deps);
  registerEventRoutes(app, deps);
  return app;
}
