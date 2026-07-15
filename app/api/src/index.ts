import { createServer } from "./infrastructure/http/server";
import { GetHealthUseCase } from "./application/health/GetHealthUseCase";
import { SystemClock } from "./infrastructure/system/SystemClock";
import { getDatabase } from "./infrastructure/database/sqlite/database";
import { migrate as migrateEvents } from "./infrastructure/database/migrations/001_create_event_table";
import { migrate as migrateCourses } from "./infrastructure/database/migrations/002_create_course_table";
import { migrate as migrateAssignments } from "./infrastructure/database/migrations/003_create_assignment_table";
import { EventRepository } from "./infrastructure/database/repositories/EventRepository";
import { CreateEventUseCase } from "./application/event/CreateEventUseCase";
import { GetEventByIdUseCase } from "./application/event/GetEventByIdUseCase";
import { ListEventsUseCase } from "./application/event/ListEventsUseCase";
import { UpdateEventUseCase } from "./application/event/UpdateEventUseCase";
import { DeleteEventUseCase } from "./application/event/DeleteEventUseCase";
import { CourseRepository } from "./infrastructure/database/repositories/CourseRepository";
import { CreateCourseUseCase } from "./application/course/CreateCourseUseCase";
import { GetCourseByIdUseCase } from "./application/course/GetCourseByIdUseCase";
import { ListCoursesUseCase } from "./application/course/ListCoursesUseCase";
import { UpdateCourseUseCase } from "./application/course/UpdateCourseUseCase";
import { DeleteCourseUseCase } from "./application/course/DeleteCourseUseCase";
import { AssignmentRepository } from "./infrastructure/database/repositories/AssignmentRepository";
import { CreateAssignmentUseCase } from "./application/assignment/CreateAssignmentUseCase";
import { GetAssignmentByIdUseCase } from "./application/assignment/GetAssignmentByIdUseCase";
import { ListAssignmentsUseCase } from "./application/assignment/ListAssignmentsUseCase";
import { UpdateAssignmentUseCase } from "./application/assignment/UpdateAssignmentUseCase";
import { DeleteAssignmentUseCase } from "./application/assignment/DeleteAssignmentUseCase";

const PORT = Number(process.env.API_PORT ?? 4287);
const clock = new SystemClock();

// Initialize database and run migrations
const db = getDatabase();
migrateEvents(db);
migrateCourses(db);
migrateAssignments(db);

// Create repositories
const eventRepository = new EventRepository(db);
const courseRepository = new CourseRepository(db);
const assignmentRepository = new AssignmentRepository(db);

// Create app with all dependencies
const app = createServer({
  getHealthUseCase: new GetHealthUseCase(clock),
  createEventUseCase: new CreateEventUseCase(eventRepository, clock),
  getEventByIdUseCase: new GetEventByIdUseCase(eventRepository),
  listEventsUseCase: new ListEventsUseCase(eventRepository),
  updateEventUseCase: new UpdateEventUseCase(eventRepository),
  deleteEventUseCase: new DeleteEventUseCase(eventRepository),
  createCourseUseCase: new CreateCourseUseCase(courseRepository, clock),
  getCourseByIdUseCase: new GetCourseByIdUseCase(courseRepository),
  listCoursesUseCase: new ListCoursesUseCase(courseRepository),
  updateCourseUseCase: new UpdateCourseUseCase(courseRepository),
  deleteCourseUseCase: new DeleteCourseUseCase(courseRepository),
  createAssignmentUseCase: new CreateAssignmentUseCase(assignmentRepository, courseRepository, eventRepository, clock),
  getAssignmentByIdUseCase: new GetAssignmentByIdUseCase(assignmentRepository),
  listAssignmentsUseCase: new ListAssignmentsUseCase(assignmentRepository),
  updateAssignmentUseCase: new UpdateAssignmentUseCase(assignmentRepository, courseRepository, eventRepository, clock),
  deleteAssignmentUseCase: new DeleteAssignmentUseCase(assignmentRepository),
  allowedOrigins: ["http://localhost:1420", "tauri://localhost", "https://tauri.localhost"],
});

console.log(`[app-api] listening on http://127.0.0.1:${PORT}`);

export default { port: PORT, hostname: "127.0.0.1", fetch: app.fetch };
