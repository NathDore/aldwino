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
import type { CreateCourseUseCase } from "../../application/course/CreateCourseUseCase";
import type { GetCourseByIdUseCase } from "../../application/course/GetCourseByIdUseCase";
import type { ListCoursesUseCase } from "../../application/course/ListCoursesUseCase";
import type { UpdateCourseUseCase } from "../../application/course/UpdateCourseUseCase";
import type { DeleteCourseUseCase } from "../../application/course/DeleteCourseUseCase";
import { registerCourseRoutes } from "./routes/course.route";

export interface ServerDeps {
  getHealthUseCase: GetHealthUseCase;
  createEventUseCase: CreateEventUseCase;
  getEventByIdUseCase: GetEventByIdUseCase;
  listEventsUseCase: ListEventsUseCase;
  updateEventUseCase: UpdateEventUseCase;
  deleteEventUseCase: DeleteEventUseCase;
  createCourseUseCase: CreateCourseUseCase;
  getCourseByIdUseCase: GetCourseByIdUseCase;
  listCoursesUseCase: ListCoursesUseCase;
  updateCourseUseCase: UpdateCourseUseCase;
  deleteCourseUseCase: DeleteCourseUseCase;
  allowedOrigins: string[];
}

export function createServer(deps: ServerDeps): Hono {
  const app = new Hono();
  app.use("*", cors({ origin: deps.allowedOrigins }));
  registerHealthRoutes(app, deps);
  registerEventRoutes(app, deps);
  registerCourseRoutes(app, deps);
  return app;
}
