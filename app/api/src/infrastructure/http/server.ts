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
import type { CreateAssignmentUseCase } from "../../application/assignment/CreateAssignmentUseCase";
import type { GetAssignmentByIdUseCase } from "../../application/assignment/GetAssignmentByIdUseCase";
import type { ListAssignmentsUseCase } from "../../application/assignment/ListAssignmentsUseCase";
import type { UpdateAssignmentUseCase } from "../../application/assignment/UpdateAssignmentUseCase";
import type { DeleteAssignmentUseCase } from "../../application/assignment/DeleteAssignmentUseCase";
import { registerAssignmentRoutes } from "./routes/assignment.route";
import type { CreateTaskUseCase } from "../../application/task/CreateTaskUseCase";
import type { GetTaskByIdUseCase } from "../../application/task/GetTaskByIdUseCase";
import type { ListTasksUseCase } from "../../application/task/ListTasksUseCase";
import type { UpdateTaskUseCase } from "../../application/task/UpdateTaskUseCase";
import type { DeleteTaskUseCase } from "../../application/task/DeleteTaskUseCase";
import { registerTaskRoutes } from "./routes/task.route";

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
  createAssignmentUseCase: CreateAssignmentUseCase;
  getAssignmentByIdUseCase: GetAssignmentByIdUseCase;
  listAssignmentsUseCase: ListAssignmentsUseCase;
  updateAssignmentUseCase: UpdateAssignmentUseCase;
  deleteAssignmentUseCase: DeleteAssignmentUseCase;
  createTaskUseCase: CreateTaskUseCase;
  getTaskByIdUseCase: GetTaskByIdUseCase;
  listTasksUseCase: ListTasksUseCase;
  updateTaskUseCase: UpdateTaskUseCase;
  deleteTaskUseCase: DeleteTaskUseCase;
  allowedOrigins: string[];
}

export function createServer(deps: ServerDeps): Hono {
  const app = new Hono();
  app.use("*", cors({ origin: deps.allowedOrigins }));
  registerHealthRoutes(app, deps);
  registerEventRoutes(app, deps);
  registerCourseRoutes(app, deps);
  registerAssignmentRoutes(app, deps);
  registerTaskRoutes(app, deps);
  return app;
}
